# Changelog (`0.9.41 -> 0.9.42`)

Release date: 2026-10-29

## Major Highlights

- Clear stale cloud authentication state when a session refresh is rejected.
- Make production security auditing a blocking CI gate and run it before slower local checks.
- Replace the Logics skills submodule with the packaged Logics manager CLI.

## Version 0.9.42

### Cloud authentication

- Clear stored access and CSRF tokens after refresh responses with HTTP 401 or 403, with regression coverage for rejected refreshes (`e183ffb`).

### CI and development tooling

- Make the scheduled production audit enforce the same policy as local CI, run the local audit first even in fast mode, and remove stale advisory exemptions (`09c5c17`).
- Replace the Logics skills submodule with `@grifhinz/logics-manager`, update CLI gates, and pin Python 3.12 for its wrapper (`4297e5c`).
- Add the curated production audit helper, refresh CI scripts and dependencies, and refine smoke checks (`5a31649`, `219ec3f`).
- Refresh environment examples and project configuration, ignore generated `AGENTS.md` and `LOGICS.md`, and synchronize the main branch changes (`d3829ac`, `ed9aed7`, `8de6a80`).
- Normalize GitHub repository links to the lowercase `sentry` slug (`91a208c`).

### Maintenance

- Bump `qs` from 6.16.0 to 6.17.0 (#10).
- Restore CI on Ubuntu 24.04 runners and stabilize affected application tests (#9, `7d8fdc4`).
- Use `vi.doUnmock` to undo runtime `vi.doMock` calls correctly (`532d156`).
- Move GitHub Actions dependencies off deprecated Node 20 runtimes (`c8c213a`).
- Update dependencies to address blocking production security advisories (`46de48b`).
- Stabilize smoke startup by dismissing intro onboarding and retrying overlay dismissal, with further smoke test fixes (`1aa5e5f`, `7bf4b3c`, `70028f1`).
- Close abandoned Logics workflow documents and refresh planning, wiki navigation guidance, and historical skills kit references (`362221d`, `ccccc99`, `81fe5f7`, `43571df`, `0486a52`, `9e13b53`).

## Validation

- Prepared from main commit `2693829173247f237d59637d550c97c404fc55c5`.
- Passed offline: `npm run release:changelog:validate`.
- Unavailable without installed project dependencies: `npm run lint` (global ESLint 6.4.0 cannot load the project configuration), `npm run typecheck` and `npm run typecheck:tests` (`tsc` missing), `npm run test:ci` and `npm run coverage:ci` (`vitest` missing), and `npm run build` (`vite` missing).
- Logics doc lint and bundle budgets remain unverified: the project dependencies and a successful build are required. Full release workflow validation is required before publication.
