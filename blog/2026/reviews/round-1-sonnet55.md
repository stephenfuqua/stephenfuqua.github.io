# Round 1 (Sonnet 5.5) — Prompt and Review

## Prompt

> /team-pr-review — PR 1420 checked out at commit `01222687f0acc7be5bff159867aae1b956d4208a`. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./round-1-sonnet55.md. Do not post to GitHub. Use the same model for subagents.

Method: five parallel specialists (Security, Functionality, Maintainability, Usability, Test Coverage), all `claude-sonnet-5.5`. They read the PR description and the diff (merge-base `7b007ca52`..`01222687f`) in a read-only worktree at the requested commit. The primary checkout was at `403e4f4d4`, a descendant of the requested commit, so a separate worktree was used. No tests were run by the reviewers.

---

# PR #1420 Review — [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval
>
> Requirements: PR description (no issue)
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

- **[Security · Usability · Maintainability]** Reset, delete and un-approval lock waits have no lock timeout; grants get 5 s.
  `SET LOCAL lock_timeout` / `SET LOCK_TIMEOUT` is set only in `StoreTokenAsync`. `UpdateClientSecretAsync`, `DeleteApplicationByIdAsync` and the un-approval `LockApplicationAsync` wait indefinitely (up to the command/HTTP timeout) and may hold earlier locks, such as the Application locks. Failures surface as a generic 500 (`FailureUnknown`).
  Fix: apply the same bounded timeout in the lifecycle transactions and map it to the retriable 409.
- **[Security]** On SQL Server, revocation can deadlock with the expired-token sweep (`DeleteExpiredTokensAsync`). The lock orders differ (index key vs clustered row). The victim becomes a 500 in `DeleteClientAsync`/`ResetCredentialsAsync`. Fail-closed, but an operator-visible flake.
  Fix: retry once on error 1205, or align the lock order.
- **[Usability · Test Coverage]** A PostgreSQL deadlock (40P01) answers 500, but SQL Server answers 409. This is deliberate, but unprotected: only MSSQL has a deadlock-victim fixture (`Given_A_Grant_Chosen_As_A_Deadlock_Victim`). A victim is safe to retry, so 500 invites false 5xx alerting.
  Fix: map 40P01 to `LockTimeout` (409). If the 500 is intentional, add a PG test or unit test that pins it and say so in CS-AUTH.md.
- **[Usability · Maintainability]** The vendor-delete rewrite is not in the PR description. `DeleteVendor` changes signature and gains `FailureClientsChanged`. `VendorModule.Delete` takes aggregate locks, deletes provider clients first, and can now return 409, 502 or 500. The docs and E2E 06 cover it, but the description and the API contract do not.
  Fix: add it to the description, and note the new statuses and retry semantics in the API docs/OpenAPI.
- **[Maintainability]** PG and MSSQL `OpenIddictDataRepository` and `VendorRepository` are near-verbatim copies. `RefusalReason` (security-relevant ordinal comparison), `StoredClientState`, the 5000 ms constant and the lock/revoke/delete logic are duplicated, so a fix to one can miss the other.
  Fix: move the engine-independent pieces to the shared OpenIddict project.
- **[Maintainability]** `StoreTokenAsync` mixes parameter building, lock timeout, lock, re-validation, insert selection and outcome mapping in one flag-driven method.
  Fix: extract `LockAndRevalidate` and `InsertToken` helpers.

## 🔵 Low

- **[Usability]** The 409 `temporarily_unavailable` has no `Retry-After`. Consider `Retry-After: 1` and document it.
- **[Usability]** The 5 s timeout is a hard-coded constant, not in `IdentityOptions`. Operators with high same-client concurrency see new 409s and cannot tune them. Expose it or document the limit. Grant lock timeouts also have no dedicated sanitized warning log.
- **[Functionality]** Revocation uses `Status <> 'revoked'`, which skips NULL statuses (the column is nullable). The store path always writes `'valid'`, so this only affects rows inserted elsewhere. Fix: `IS DISTINCT FROM` (PG) / `(Status IS NULL OR Status <> 'revoked')` (MSSQL).
- **[Functionality]** A repeat un-approval whose first attempt already committed still answers 500, and the retry is needed. Intentional and documented.
- **[Security]** `FailureUnknown(ex.Message)` in the reset/delete paths could leak DB error text if any caller returns it to the client. Confirm modules return generic bodies.
- **[Maintainability]** The `ClientNotFound`-after-lock branch is effectively unreachable but is not labelled as a defensive guard.
- **[Maintainability]** Logging: "Revoked {Count} outstanding tokens" is logged at Information even for count 0 or an absent row. The un-approval participant logs "Marked … revoked" before commit, which can mislead after a rollback. Two duplicated message literals.
- **[Maintainability]** `DeleteApplicationByIdAsync` and `RevokeTokensForApplicationAsync` take a nullable transaction. A null silently reverts to autocommit and defeats the lock-ordering guarantee. Make it non-nullable on the changed methods.
- **[Maintainability]** The `IUnapprovalTokenRevocation` registration is repeated in four places. A comment pointing to `TokenRevocationStartupTests` would help.
- **[Maintainability]** The PR body says five E2E scenarios; the feature has six (01–06), with `@MssqlRepresentative` on 01–03 and 06. The PG/MSSQL `ApiClientRepository` comment blocks have drifted.
- **[Test Coverage]** There is no backend integration test for vendor-delete or application-delete revocation. They are covered only by E2E (05 on PG only, 06 on MSSQL).
- **[Test Coverage]** E2E scenarios 04 and 05 are not tagged `@MssqlRepresentative`. Backend integration tests cover them on both engines.
- **[Test Coverage]** The polling `Task.Delay` loops in the integration tests (20–50 ms, with a 60 s bound) poll real lock-wait state. They are acceptable, with only residual CI-load risk.

## ⚪ Nit

- Synchronous `transaction.Commit()` and `Rollback()` in async methods in `OpenIddictClientRepository`. This is consistent with the file.
- The un-approval failure returns generic `FailureResults.Unknown` with no retry hint visible to the client.
- Success is logged after `Commit()` inside the `try`. A logging throw would misreport a committed operation.

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | Sound. Lock-then-revalidate is correct on both engines, nothing fails open, and error mapping and logging are safe. Only contention and timeout hardening remain. |
| Functionality | COMPLETE — every requirement is implemented with consistent transaction ordering on PG and MSSQL. Only two Low findings remain. |
| Maintainability | Design is sound and the docs match the code. Held back by the undisclosed vendor-delete rewrite, PG/MSSQL duplication and an overgrown `StoreTokenAsync`. |
| Usability | Good: strong docs and consistent `invalid_client`. Close the PG/MSSQL deadlock mismatch and the missing lifecycle lock timeout. |
| Test Coverage | STRONG — lock, revocation, rollback, orphan and concurrency behaviours are tested deterministically and mirrored across engines. The gap is a PG deadlock-victim fixture. |

## Summary

No merge blockers. The core guarantee (lock, re-validate, revoke in the same transaction) is correct and well tested on both engines. Before merging, add a lock timeout (and a 409 mapping) to the reset, delete and un-approval lock waits, settle the PG deadlock status (409 vs 500) and pin it with a test, and describe the vendor-delete behaviour change in the PR. The PG/MSSQL duplication and `StoreTokenAsync` size are worth tracking.

## Usage

AI Credits 173.72 (6m 7s)
Tokens     ↑ 3.6m (3.2m cached, 418.1k written) • ↓ 37.3k (8.2k reasoning)
  GitHub Copilot • Claude Sonnet 5.5 ↑ 3.6m (3.2m cached, 418.1k written) • ↓ 37.3k (8.2k reasoning) • 173.72 AIC

Extra skills used: none
