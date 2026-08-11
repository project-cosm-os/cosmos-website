import React from 'react';

import SEO, { SOFTWARE_SCHEMA, faqSchema } from '../components/shared/SEO';
import { useList } from '../i18n/useList';
import TrackedSection from '../components/shared/TrackedSection';
import Hero from '../components/sections/Hero';
import Connects from '../components/sections/Connects';
import Pillars from '../components/sections/Pillars';
import Deployment from '../components/sections/Deployment';
import AskCosmo from '../components/sections/AskCosmo';
import Flow from '../components/sections/Flow';
import Trace from '../components/sections/Trace';
import Trust from '../components/sections/Trust';
import FAQ from '../components/sections/FAQ';
import CTASection from '../components/sections/CTASection';

/**
 * The home page.
 *
 * ── THE ORDER IS THE ARGUMENT ─────────────────────────────────────────────
 *
 * Show the product (hero), prove it reads real sources (connects), then make
 * the four claims in the order the customer experiences them:
 *
 *   Recover  — money back first, because that is what pays for the software in
 *              month one and it is the reason anyone takes the call.
 *   Automate — then the accounting, because that is what keeps them past it.
 *   Comply   — then GST, TDS and TCS. For an Indian seller this is not a
 *              feature, it is the deadline that arrives every month whether or
 *              not the books are ready. Leaving it off the home page was the
 *              single biggest hole in the first draft.
 *   Own      — then the ledger, because that is the endgame and the thing no
 *              reconciliation tool can follow us into.
 *
 * Deployment sits immediately after the four, because that is where the
 * objection lands. Somebody who has just read what the product does is
 * thinking "and how would my own fee structures ever get into it", not "tell
 * me more features". It is also the answer to the quieter question a buyer has
 * about any young product: who makes this work for me.
 *
 * Ask Cosmo comes after that, deliberately. Led with, it reads as another
 * chat box bolted to a dashboard; read after the ledger exists, it is obvious
 * why its answers can be trusted.
 *
 * Then the mechanism (flow), and immediately the proof of it (trace). Flow
 * claims a four-step loop ending in a journal entry; trace walks one real
 * settlement line through it and lands a balanced entry. Claim then evidence,
 * in that order, because the evidence is unreadable before the claim and the
 * claim is unbelievable without it.
 *
 * Then the CA's real question (trust), the objections they would otherwise
 * raise on the call (FAQ), and one ask (CTA).
 */
const Home: React.FC = () => {
  /*
    The FAQ block is offered to search as a FAQPage, built from the same
    dictionary entries the section renders. Generating it from the copy rather
    than duplicating it is the point: Google penalises structured data that
    does not match the visible page, and a hand-kept second copy would drift on
    the first edit.
  */
  const faqItems = useList<{ question: string; answer: string }>('faq.items');

  return (
    <>
    <SEO path="/" jsonLd={[SOFTWARE_SCHEMA, faqSchema(faqItems)]} />
    <TrackedSection name="hero"><Hero /></TrackedSection>
    <TrackedSection name="connects"><Connects /></TrackedSection>
    <TrackedSection name="pillars"><Pillars /></TrackedSection>
    <TrackedSection name="deployment"><Deployment /></TrackedSection>
    <TrackedSection name="ask-cosmo"><AskCosmo /></TrackedSection>
    <TrackedSection name="flow"><Flow /></TrackedSection>
    <TrackedSection name="trace"><Trace /></TrackedSection>
    <TrackedSection name="trust"><Trust /></TrackedSection>
    <TrackedSection name="faq"><FAQ /></TrackedSection>
    <TrackedSection name="cta"><CTASection /></TrackedSection>
    </>
  );
};

export default Home;
