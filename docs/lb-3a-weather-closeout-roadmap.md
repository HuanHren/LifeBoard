# LB-3A Weather Closeout Roadmap

Recommended next stage: LB-3C.

LB-3B is skipped because LB-3A found no P0 blocker. Weather should not enter freeze yet because P1 items remain.

## LB-3C: Approved P1 Closeout

Goal: make the current weather module truthful, complete enough and freezeable without starting a new renderer migration.

Allowed scope:

- Fix or formally accept the partly-cloudy-day runtime/documentation mismatch.
- Add visibility end to end, or explicitly remove it from the freeze checklist.
- Clarify or improve weather alert provider coverage.
- Add one reusable no-dependency browser/state QA harness for location denied, search empty/error, air-quality failure, long-range unsupported/empty, stale cache and storage unavailable.

Exit criteria:

- P1 count is zero or explicitly accepted.
- Architecture docs match browser evidence.
- Existing LB-2A through LB-3A validation stays green.
- No Xiaomi reverse engineering is required.

## LB-3D: Freeze Verification

Goal: verify the final weather product surface after LB-3C without broadening scope.

Allowed scope:

- Run build and all weather validation scripts.
- Run the browser matrix across desktop, tablet, mobile, reduced motion, stale cache and route leave/return.
- Record the final freeze evidence in docs.
- Fix only regressions introduced by LB-3C.

Exit criteria:

- No P0/P1 open items.
- No unexpected browser console errors.
- No horizontal overflow in the required viewport matrix.
- Route lifecycle does not accumulate canvases.

## Weather Freeze Commit

Goal: mark the weather module complete under the mixed renderer architecture.

Allowed scope:

- Freeze note, final evidence, and any small validation script updates.
- No new scene migration.
- No provider-response modification.
- No dependency install.
- No push unless separately requested.

Exit criteria:

- Weather Definition of Done is satisfied.
- Commit message is agreed before staging.
- Only approved weather closeout files are staged.

## Explicitly Not Planned

- No LB-2F clear-day migration.
- No full renderer unification.
- No broad Xiaomi Weather reverse pass.
- No thunder/rain/snow particle tuning unless later product QA creates a concrete P1.
- No app-wide bundle work as part of weather closeout.
