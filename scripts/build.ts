/**
 * Production build.
 *
 * ── WHY THIS IS NOT JUST `vite build` ─────────────────────────────────────
 *
 * `vite build` finishes its work in about three seconds and then never exits.
 * A probe of the process after the build completes reports four live handles:
 * one ChildProcess and three Sockets, which is esbuild's long-running service
 * and its IPC. No timers, nothing of this app's own, and nothing still writing.
 * The output is fully on disk by the time `build()` resolves.
 *
 * Locally that reads as "the build is slow". In CI it is a job that hangs until
 * the runner's timeout, which for GitHub Actions defaults to six hours. The
 * deploy workflow runs `pnpm build`, so this had to be fixed before the site
 * could ship from EC2 or from Actions at all.
 *
 * So: run the build through vite's API, and once it resolves, exit. The
 * explicit exit code is the point of the file.
 */
import { build } from 'vite';

try {
  await build();
} catch (error) {
  console.error(error);
  process.exit(1);
}

// esbuild's service process and its sockets are still open here and will never
// close on their own. Everything this build had to produce is already written.
process.exit(0);
