# Round 12: team-pr-review of PR 1420 (Haiku 5.5)

## Prompt

Invoked skill: `team-pr-review`

ARGUMENTS: PR 1420 checked out at commit `01222687f0acc7be5bff159867aae1b956d4208a`. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./round-12-haiku55.md. Do not post to GitHub. Use the same model for subagents.

Execution notes:

- Reviewed commit: `01222687f` (user-specified), in detached worktree `/tmp/pr1420-wt`. Diff: `7b007ca5...01222687f` (62 files, about 660 KB), saved to `/tmp/pr1420-cmd.diff`, read by specialists in chunks rather than injected inline.
- Five specialists ran in parallel with `claude-haiku-5.5` (agent type `explore`, read-only): Security, Functionality, Maintainability, Usability, Test Coverage. Each received the PR description via `gh pr view 1420`, the severity rubric from the skill, and the skill's per-lens prompt.

## Context caveats

- The GitHub PR head is `eb1774b39`, which is not present locally. Local HEAD is `403e4f4d4`, one commit past the requested `01222687f`. Findings apply to `01222687f`. Some may already be addressed in later commits.
- A sixth agent was launched by mistake. It returned `PLACEHOLDER` and was ignored.
- The Security specialist did not review the MSSQL token-store statement or the `ApiClientRepository.UpdateApiClient` wiring. Those paths are not covered by the security findings below.

# PR #1420 Review: [DMS-1493] Lifecycle token revocation (self-contained mode)
>
> Requirements: PR description (DMS-1493). No separate issue.
> Reviewed commit: 01222687f
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> Model: claude-haiku-5.5 (all specialists)

---

## 🔴 Critical

None found.

## 🟠 High

- **[Functionality]** Undocumented vendor-deletion behavior change. Commit `3c5302cf`, included in `01222687f`, changes `VendorRepository.DeleteVendor` on both engines (+70 / +69 lines), `IVendorRepository`, and `VendorModule.cs` (+130). Vendor deletion now removes each vendor client from the identity provider before the database cascade, and adds a new `FailureClientsChanged` result. The PR description never mentions vendors (verified with `gh pr view`).
  Fix: Add a requirement, tests, and documentation for this behavior to the PR description, or split it into its own PR.

- **[Test Coverage]** The MSSQL deadlock-victim test does not prove a deadlock occurred. `Given_A_Grant_Chosen_As_A_Deadlock_Victim` (`src/config/backend/EdFi.DmsConfigurationService.Backend.Mssql.Tests.Integration/OpenIddictDataRepositoryTests.cs:4523-4600`) asserts only `TokenStoreOutcome.LockTimeout` and the row count. Without a deadlock, the grant also times out after 5 s and gets the same outcome. The 1205 → `LockTimeout` mapping is therefore effectively untested.
  Fix: Assert that the grant returned before the lock timeout elapsed (stopwatch bound), or assert the deadlock-specific warning. Add a unit test for the `SqlException` 1205 classification, separate from the 1222 timeout path.

## 🟡 Medium

- **[Test Coverage]** No PostgreSQL deadlock test exists, so the 500 mapping is unasserted. Verified: the PostgreSQL integration test file contains no `Deadlock` fixture.
  Fix: Add a PostgreSQL deadlock-victim test that pins the documented outcome.

- **[Usability]** Deadlock outcomes diverge by engine: `409` on SQL Server and `500` on PostgreSQL for the same condition. The divergence is documented (`reference/design/configuration-service/CS-AUTH.md:459-460`), and the commit message says lifecycle deadlock-to-409 mapping is deferred. API clients need engine-specific retry logic.
  Fix: Decide on one contract, or at minimum add the divergence to the token-endpoint error table so clients can handle it.

- **[Usability]** Vendor-deletion orphaned clients are documented but not surfaced to operators. Clients removed by a pre-change vendor deletion keep credentials and tokens and can keep obtaining tokens. Nothing at runtime tells an operator these clients exist.
  Fix: Add a startup warning, admin-visible list, or runbook query for clients without an `ApiClient` row, linked from CS-AUTH.md.

- **[Maintainability]** Engine-duplicated control flow. `LockApplicationAsync` and `RevokeTokensForApplicationAsync` exist in both `OpenIddictDataRepository.cs` files, with the same lock-failure-to-outcome branching. The 5000 ms lock timeout is also duplicated as `LockTimeoutMilliseconds` in both engines (Mssql line 34, PostgreSQL line 33). Only a comment ties it to `ApplicationLockOptions.AcquireTimeout`.
  Fix: Move the outcome mapping and the timeout constant into Backend.OpenIddict. Add a unit test asserting the timeout matches `ApplicationLockOptions.AcquireTimeout`.

## 🔵 Low

- **[Security]** The PostgreSQL token-store lock timeout is hard-coded to 5000 ms (`src/config/backend/EdFi.DmsConfigurationService.Backend.Postgresql/OpenIddict/Repositories/OpenIddictDataRepository.cs:33-35`) and ignores the `ApplicationLockSettings:AcquireTimeout` operator setting. This is a configuration gap, not a bypass.
  Fix: Read the timeout from the same setting as the other lock path, or document the mismatch.

- **[Security]** Revoked tokens remain usable until `exp + JwtAuthentication:ClockSkewSeconds` because DMS validates statelessly. This residual window is documented in the PR.
  Fix: Keep the documented window. Consider shorter token lifetimes for high-risk operations, and add an operator-facing note.

- **[Maintainability]** `TokenStoreOutcome.LockTimeout` also covers SQL Server deadlock victims, so the name misstates the meaning. The meaning lives only in the XML doc.
  Fix: Rename to a contention-oriented name such as `LockContention`.

- **[Maintainability]** `OpenIddictUnapprovalTokenRevocation.cs:50-60` logs two near-duplicate Information messages with long repeated phrasing.
  Fix: Log one structured message with the count and an `applicationExists` flag.

- **[Test Coverage]** The E2E feature file has six scenarios (`src/config/tests/EdFi.DmsConfigurationService.Tests.E2E/Features/ClientLifecycleRevocation.feature`, scenarios at lines 64, 106, 126, 187, 218, 252). The PR description says five.
  Fix: Correct the PR description, or confirm scenario 06 is intentional.

- **[Usability]** `409` with `temporarily_unavailable` looks inconsistent with RFC 6749's suggested `503`. This is a deliberate, documented choice (CS-AUTH.md:137-138, because the DMS `/oauth/token` proxy recognizes the condition by status). Downgraded from the reviewer's High.
  Fix: No change required. Keep the rationale visible in the error table.

- **[Functionality]** Timestamp inconsistency on the PostgreSQL side. The new `RevokeTokensForApplicationAsync` uses `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`, but the pre-existing `RevokeTokenAsync` still uses bare `CURRENT_TIMESTAMP`. Reported by the reviewer; not independently verified.
  Fix: Leave a note on `RevokeTokenAsync`, or align both methods.

- **[Usability]** The residual-window wording differs between documents. CS-AUTH.md:642 gives the default ClockSkewSeconds (30 s), and OWASP-AUTH-COVERAGE.md:193 omits it. Reported by the reviewer; not independently verified.
  Fix: State the window once, with a worked example, and reuse the wording in both files.

## ⚪ Nit

- **[Security]** Vendor-delete SQL is built with `$"""..."""` interpolation of `TenantContext.TenantWhereClause()`. The fragment is fixed, not user input, and the IDs are bound as parameters. No injection path found.
  Fix: No change required. A comment that the fragment is trusted would help.

- **[Maintainability]** Sanitization is applied inconsistently. `VendorModule.cs` wraps `LoggingUtility.SanitizeForLog` in a private helper (line 904), while `OpenIddictUnapprovalTokenRevocation.cs:52,59` calls it directly on a `Guid`, where it is redundant but harmless.
  Fix: Use one convention across modules.

---

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | No Critical or High issues in the reviewed paths (PostgreSQL token store, reset/delete/un-approval, vendor SQL). MSSQL token store and `UpdateApiClient` wiring were not reviewed. |
| Functionality | COMPLETE: every numbered requirement in the PR description is implemented. The undocumented vendor-deletion change is a scope gap, not a missing requirement. |
| Maintainability | Lock and revoke logic is well commented, but duplicated engine constants and the `LockTimeout` naming will need coordinated edits later. |
| Usability | Retry contract needs a decision on the deadlock 409/500 split. No direct UI impact; API and operator changes only. |
| Test Coverage | ADEQUATE: happy paths, rollback, lock timeout, and DI registration are well covered, and concurrency tests use deterministic blocking probes. Deadlock-victim behavior is untested in a meaningful way on either engine. |

---

## Summary

Before merging, add the vendor-deletion change to the PR description or split it out, and fix the MSSQL deadlock test so it actually proves a deadlock occurred. Add a PostgreSQL deadlock test, and decide whether the deadlock 409/500 split is the intended client contract. Strengths: the lock-and-revalidate design is consistent across both engines on the paths reviewed, and the concurrency tests use deterministic blocking-session probes instead of fixed sleeps.

## Usage

AI Credits 7.26 (22m 48s)
Tokens     ↑ 1.7m (1.4m cached, 262.4k written) • ↓ 51.4k (15.7k reasoning)
  GitHub Copilot • Claude Haiku 5.5 ↑ 1.7m (1.4m cached, 262.4k written) • ↓ 51.4k (15.7k reasoning) • 7.26 AIC

Extra skills used: none
