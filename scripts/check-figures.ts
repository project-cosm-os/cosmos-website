/**
 * Checks that the illustrative figures on the site reconcile.
 *
 * ── WHY A MARKETING SITE NEEDS AN ARITHMETIC TEST ─────────────────────────
 *
 * The figures in the console mockup, the Ask Cosmo panel and the Comply panel
 * are one set of numbers used in three places. They are made up, but
 * they are made up about a double-entry accounting product, and the site's whole
 * argument is that its numbers are computed rather than guessed.
 *
 * The first draft shipped three fee lines totalling ₹8,65,139 under a tile
 * reading ₹6,31,004. The reader most likely to add that column is a chartered
 * accountant, on the page that exists to convince them. Fixing it introduced a
 * second, smaller version of the same fault: TCS stated as ₹21,290 when 0.5% of
 * ₹42,58,120 is ₹21,290.6.
 *
 * Neither is visible by reading. Both are trivial to check.
 *
 *     pnpm check:figures
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Read from the dictionary rather than the components: every user-visible
 * string now lives there, so this checks the text that actually renders.
 */
const dict = JSON.parse(readFileSync(join(root, 'src/i18n/locales/en-US.json'), 'utf8'));

/** "₹42,58,120" or "−₹6,31,004" → 4258120 / 631004. Lakh grouping, so no parseInt. */
const rupees = (text: string) => Number(String(text).replace(/[^\d]/g, ''));

const GROSS = rupees(dict.mockup.tiles.grossValue);
const FEES = rupees(dict.mockup.tiles.feesValue);
const RETURNS = rupees(dict.mockup.amounts.returns);
const REIMBURSEMENTS = rupees(dict.mockup.amounts.reimbursements);

/** A labelled figure, the shape most of the dictionary's number rows share. */
interface Field {
  label: string;
  value: string;
}

const failures: string[] = [];
const check = (label: string, actual: number, expected: number) => {
  if (actual !== expected) {
    failures.push(
      `${label}: computes ${actual.toLocaleString('en-IN')}, site says ${expected.toLocaleString('en-IN')}`,
    );
  }
};

// 1. Ask Cosmo's fee breakdown must sum to the fees total it quotes.
const components = (dict.askCosmo.facts as { value: string }[]).map((f) => rupees(f.value));
check('fee components sum', components.reduce((a, b) => a + b, 0), FEES);

// 2. The stated fee percentage must be what the two figures produce.
const statedPct = String(dict.mockup.tiles.feesNote).match(/([\d.]+)%/)?.[1];
const computedPct = ((FEES / GROSS) * 100).toFixed(1);
if (statedPct !== computedPct) {
  failures.push(`fees as % of gross: computes ${computedPct}%, site says ${statedPct}%`);
}

// 3. Withholding is a rate applied to gross, so it has one correct value each.
const complyRows = dict.pillars.comply.rows as { title: string; amount: string }[];
const rowAmount = (needle: string) =>
  rupees(complyRows.find((r) => r.title.includes(needle))?.amount ?? '0');
const tcs = Math.round(GROSS * 0.005);
const tds = Math.round(GROSS * 0.001);
check('TCS at 0.5% of gross', tcs, rowAmount('TCS u/s 52'));
check('TDS at 0.1% of gross', tds, rowAmount('TDS u/s 194-O'));

// 4. The waterfall's withholding line is the two of them together, and the
//    Comply panel's footer states the same total.
check('withholding line', tcs + tds, rupees(dict.mockup.amounts.withheld));
check('Comply footer total', tcs + tds, rupees(String(dict.pillars.comply.footer).match(/₹[\d,]+/)?.[0] ?? '0'));

// 5. Gross to net must actually be gross to net, in both places it appears.
const net = GROSS - FEES - RETURNS - (tcs + tds) + REIMBURSEMENTS;
check('gross to net (tile)', net, rupees(dict.mockup.tiles.netValue));
check('gross to net (waterfall)', net, rupees(dict.mockup.amounts.net));

// 6. The Recover panel states its own subtotal; it must be the rows shown.
const recoverRows = (dict.pillars.recover.rows as { amount: string }[]).map((r) => rupees(r.amount));
const statedSubtotal = rupees(String(dict.pillars.recover.footer).match(/₹[\d,]+/)?.[0] ?? '0');
check('Recover rows subtotal', recoverRows.reduce((a, b) => a + b, 0), statedSubtotal);

/*
  7. The Automate panel is a day's journal, so its rows are independent entries
     rather than lines of one voucher. They still have to agree with each other,
     because of what sits next to what: "TCS withheld u/s 52" renders directly
     under the settlement it says it is matched to, and 0.5% of a number on the
     line above is a division the reader will do. It shipped at ₹3,932 against a
     ₹2,54,228 settlement, implying a base three times too large.

     Nothing about the layout stops that figure drifting again, so it is pinned
     to the row it claims to match.
*/
const automateRows = dict.pillars.automate.rows as { title: string; amount: string }[];
const automateAmount = (needle: string) =>
  rupees(automateRows.find((r) => r.title.includes(needle))?.amount ?? '0');

const SETTLEMENT = automateAmount('Amazon settlement');
check('Automate TCS at 0.5% of the settlement it is matched to', Math.round(SETTLEMENT * 0.005), automateAmount('TCS withheld'));

// Cost of goods above the revenue on the same day's journal would read as a
// loss-making business on the page arguing the books are trustworthy.
if (automateAmount('COGS') >= SETTLEMENT) {
  failures.push(
    `Automate COGS ${automateAmount('COGS').toLocaleString('en-IN')} is not below the settlement ${SETTLEMENT.toLocaleString('en-IN')}`,
  );
}

/*
  8. The trace section: one settlement line, the referral-fee rule that fires on
     it, and the entry it posts.

     This one is checked harder than the rest because it is the section that
     invites arithmetic. It shows its own working — a rate, a second rate, and
     the difference between them — so a reader who disagrees with any figure can
     say so, and a wrong one discredits the whole page rather than just itself.

     The rule mirrors reconciliation/domain/leakage-rules.ts: a referral fee
     charged more than half a point above the rate card is an overcharge, and
     the claim is the difference. Note what the entry does NOT do: it posts the
     ₹1,020 actually charged, not the ₹840 owed. The gap is a claim, not a
     posting. That distinction is the section's argument, so it is asserted.
*/
const trace = dict.trace;
const traceField = (fields: Field[], label: string) =>
  rupees(fields.find((f) => f.label === label)?.value ?? '0');
const tracePct = (rows: Field[], label: string) =>
  Number(String(rows.find((r) => r.label === label)?.value ?? '0').replace('%', ''));

const sourceFields = trace.source.fields as Field[];
const ruleRows = trace.rule.rows as Field[];

const PRINCIPAL = traceField(sourceFields, 'Item price');
const CHARGED = traceField(sourceFields, 'Commission');
const cardPct = tracePct(ruleRows, 'Your rate card');
const chargedPct = tracePct(ruleRows, 'Actually charged');

check('trace: fee on the line is the charged rate', Math.round((PRINCIPAL * chargedPct) / 100), CHARGED);
check('trace: fee at the rate card', Math.round((PRINCIPAL * cardPct) / 100), traceField(ruleRows, 'Fee at your rate'));
check('trace: rule panel agrees with the line', CHARGED, traceField(ruleRows, 'Fee on the line'));
check('trace: claim is the difference', CHARGED - traceField(ruleRows, 'Fee at your rate'), rupees(trace.rule.claimValue));

// The rule only fires beyond the half-point tolerance it states.
if (chargedPct <= cardPct + 0.5) {
  failures.push(`trace: ${chargedPct}% is within tolerance of ${cardPct}%, so this finding would not fire`);
}

const entryLines = trace.entry.lines as { key: string; side: string; amount: string }[];
const sideTotal = (side: string) =>
  entryLines.filter((l) => l.side === side).reduce((a, l) => a + rupees(l.amount), 0);
const debits = sideTotal(trace.entry.debitLabel);
const credits = sideTotal(trace.entry.creditLabel);
const lineAmount = (key: string) => rupees(entryLines.find((l) => l.key === key)?.amount ?? '0');

check('trace: entry balances', debits, credits);
check('trace: stated debit total', debits, rupees(trace.entry.debitTotalValue));
check('trace: stated credit total', credits, rupees(trace.entry.creditTotalValue));
check('trace: revenue is the full item price', PRINCIPAL, lineAmount('revenue.marketplace'));
check('trace: clearing is item price less the fee', PRINCIPAL - CHARGED, lineAmount('clearing.amazon'));
check('trace: the fee posted is the fee charged, not the fee owed', CHARGED, lineAmount('fee.commission'));

if (failures.length > 0) {
  console.error(`\nfigures do not reconcile (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  console.error('\nAll of these live in src/i18n/locales/en-US.json.\n');
  process.exit(1);
}

console.log('check:figures — fee breakdown, withholding, gross-to-net and subtotals all reconcile');
