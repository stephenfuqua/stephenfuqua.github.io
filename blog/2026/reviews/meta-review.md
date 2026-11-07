# Meta-Review: Severity Re-assessment of PR #1420 Findings

## Scope

- Input: `reviews/combined-reviews.md` (47 findings, C1-C47) for PR #1420 (DMS-1493, token revocation in self-contained mode), reviewed commit `01222687f`.
- Method: nine Sonnet 5.5 subagents each re-verified a group of findings against a worktree of the reviewed commit and re-rated severity. C2 and C4 were skipped by the first agent and re-run separately.
- Caveat: C28, C29, C30, C35 and C39 were only spot-checked, and C15 and C33 were not inspected in detail. Their ratings rest partly on the source reviews.

## Summary

- No finding is a blocker.
- Both High findings are downgraded: C8 to Low, C2 to Medium.
- Cheap fixes for this PR: C1, C2, C3, C42.
- Needs a product decision: C18.

## Re-assessed severity

| ID | Original | Reassessed | Verified | Rationale | Fix in this PR? |
| --- | --- | --- | --- | --- | --- |
| C1 | Low | Low | Yes | "Nothing was deleted" log and XML doc are wrong: provider clients are already deleted when `FailureClientsChanged` fires (`VendorModule.cs:~943-967`). The 502 gives no retry hint. | Yes (wording) |
| C2 | High | **Medium** | Yes | Vendor-delete rework is real (502/409, `cleanedClients` in `IVendorRepository.cs:18-30`) and documented in `CS-AUTH.md:506-571`, but missing from the PR description, which also wrongly says keycloak is unchanged. Documentation gap, not a defect. | Yes (PR body, changelog) |
| C3 | Low | Nit | Yes | PR body says five scenarios; the feature has six. `@MssqlRepresentative` is on 01-03 and 06, not 04-05. | Edit PR description |
| C4 | Medium | Medium | Yes | Pre-PR vendor deletes left provider clients that can still get tokens. Already disclosed (`OWASP-AUTH-COVERAGE.md:211-218`); PR does not worsen it. | No; file follow-up, note to operators |
| C5 | Low | No-action | Yes | `NoOpUnapprovalTokenRevocation` is by design; Keycloak tokens expire on their own. | No |
| C6 | Medium | Low | Partly | PG grant takes a single lock, so 40P01 is very unlikely. Intentional and documented (`OWASP-AUTH-COVERAGE.md:240`). One-line catch change if wanted. | Optional |
| C7 | Medium | Low | Yes (gap) | Only needed if C6 is fixed. | Pair with C6 |
| C8 | High | **Low** | Partly | Test cannot distinguish a deadlock from a 5 s lock timeout. Setup is deterministic; risk is a missed regression, not flakiness. Assert elapsed time well under 5 s. | Optional |
| C9 | Medium | Low | Partly | Possible MSSQL deadlock with the expired-token sweep; rare, retriable, fails closed. | No (follow-up) |
| C10 | Medium | Low-Medium | Yes | Lock timeout is set only in `StoreTokenAsync`. Needs a stuck transaction to matter. Design improvement. | No |
| C11 | Low | Low | Yes | 5000 ms hard-coded; ignores `ApplicationLockSettings:AcquireTimeout`. Only matters if overridden. | No |
| C12 | Low | Low | Partly | Wait is bounded by the 5 s lock timeout. General pooling concern. | No |
| C13 | Medium | Low | Yes | Duplication across engines; SQL differs, so some is inherent. Refactor, not a defect. | No |
| C14 | Medium | Low | Yes | Approval subquery repeated; drift risk only. | No |
| C15 | Medium | Nit | Not checked | Style suggestion (extract helpers). | No |
| C16 | Low | Nit | Yes | Nullable transaction matches the rest of the interface. | No |
| C17 | Low | Nit | Partly | `Status` has `DEFAULT 'valid'`; NULL not realistic. | No |
| C18 | Low | Low | Yes | Repeat un-approval returning 500 is deliberate and fails safe (the retry re-runs revocation). Noisy in Keycloak mode. **Product decision.** | No |
| C19 | Low | Nit | Yes | 409 is deliberate (`IdentityModule.cs:394-401`); no `Retry-After` anywhere in the module. | Optional |
| C20 | Low | Invalid | No | `ex.Message` is logged after sanitizing; clients get only the trace ID (`FailureResults.cs:19`). Existing pattern. | No |
| C21 | Low | Nit-Low | Partly | Cosmetic logging items. Cheapest useful one: warn on grant lock timeout. | Optional |
| C22 | Nit | Nit | Yes | Same `SanitizeForLog(x.ToString())` convention used repo-wide. | No |
| C23 | Low | Low | Partly | No backend vendor-delete revocation fixture; app-delete and E2E cover revocation. | No |
| C24 | Low | Nit | Yes | Reset and delete already represented in the MSSQL lane by 01, 02 and 06. | No |
| C25 | Medium | Low | Partly | Lock order is consistent by design; another fixture pins the opposite direction. | No |
| C26 | Low | Low | Yes | Missing 0 and -1 limit cases; cheap parameterization. | Optional |
| C27 | Low | Nit | Partly | Only the un-approval statement is raw SQL; deliberate lock-order fixture. | No |
| C28 | Low | Low | Partly | Cross-tenant recording-participant test. Not fully checked. | Optional |
| C29 | Low | Low | Partly | Ambiguous un-approval assertions not audited. | Optional |
| C30 | Low | Low | Partly | Module-level result handling is covered; repository failure paths not checked. | Defer |
| C31 | Low | Low | Yes | No test for null `ClientSecret` (`?? string.Empty`). | Defer |
| C32 | Nit | Nit | Yes | Observation timeouts are only waits to see a block. Do not fix by lengthening delays. | No |
| C33 | Low | No-action | Not checked | Polling loops accepted. | No |
| C34 | Nit | Nit | Yes | Deliberate, commented, no defect. | No |
| C35 | Low | Low | Partly | Style consistency only. | No |
| C36 | Low | Low | Yes | Speculative design concern. | No |
| C37 | Low | Nit | Yes | `lockedState!` is safe (early return on `lockFailure`). | No |
| C38 | Low | Nit | Yes | Per-engine registrations follow the existing pattern. | No |
| C39 | Nit | Nit | Partly | Sync `Commit`/`Rollback` appears pre-existing. | No |
| C40 | Low | Low | Yes | Mild duplication of `ClientDeleteResult` mapping. | No |
| C41 | Low | No-action | Yes | Matches the existing fixture pattern. | No |
| C42 | Medium | Low-Medium | Partly | `docs/changelog/8.1.0.md` has no entry for revocation on delete, reset or vendor-delete, or for the 409. | Yes (short entry) |
| C43 | Low | Low | Partly | Wording differs between `CS-AUTH.md` and `OWASP-AUTH-COVERAGE.md` but is not contradictory. | Optional |
| C44 | Low | Low | Yes | Doc comment is accurate; rename costs more than it gains. | No |
| C45 | Low | Nit | Yes | `RevokeTokenAsync` uses plain `CURRENT_TIMESTAMP` (`:665`); the application-wide path uses `AT TIME ZONE 'UTC'` (`:683`). Only wrong if the session time zone is not UTC. | Optional |
| C46 | Nit | No-action | Yes | Fixed fragment, parameterized values; no injection path. | No |
| C47 | Nit | Nit | n/a | Documentation suggestion. | Follow-up |

## Recommended actions

1. **In this PR:** correct the "nothing was deleted" wording and add retry guidance to the 502 (C1); update the PR description for vendor-delete, the keycloak claim and the E2E inventory (C2, C3); add an 8.1.0 changelog entry (C42).
2. **Optional hardening:** assert elapsed time in the MSSQL deadlock test (C8); add `Retry-After` (C19); warn on grant lock timeout (C21); align the timestamp (C45); add 40P01 handling and its test (C6, C7).
3. **Follow-up issue:** reconcile provider clients orphaned by pre-PR vendor deletions (C4), and mention it to operators.
4. **Decision needed:** keep or soften the 500 on repeat un-approval (C18).
