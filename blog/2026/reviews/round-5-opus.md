# Prompt

> /team-pr-review PR 1420. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./round-11-opus.md. Do not post to GitHub.

---

# PR #1420 Review — [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval
>
> Requirements: the PR description (no linked issue was used)
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> Head reviewed: `01222687f` (Merge origin/main into DMS-1493), checked out in a detached worktree

---

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

- **[Security · Usability · Functionality]** Provider clients orphaned by vendor deletions made before this PR can still get new tokens indefinitely.
  Before this PR, `DELETE /v3/vendors/{id}` left the `dmscs.OpenIddictApplication` row in place. A client with no `dmscs.ApiClient` row counts as approved: `COALESCE(..., true)` in the authentication read (PG `OpenIddictDataRepository.cs:380`) and in the new re-check under the lock (`ReadStoredClientStateSql`, PG `:70-75`, MSSQL `:85-90`). CS-AUTH.md admits that "no CMS API reaches it, and this version provides no cleanup", so operators have no detection or remediation path.
  Fix: Ship a one-time cleanup (a migration or admin job) that revokes or deletes `OpenIddictApplication` rows with no `ApiClient` row and no system/admin role. Alternatively, stop treating "no ApiClient rows" as approved for API-client-role clients. At minimum, document a detection query and link a follow-up ticket.
- **[Functionality · Maintainability · Test Coverage]** The vendor-deletion rework is missing from the PR description, and it changes Keycloak mode even though the description says "keycloak mode is unchanged".
  Commit `3c5302cf2` makes these changes:
  - `VendorModule.Delete` (`VendorModule.cs:927-1036`) now takes application locks and calls `IIdentityProviderRepository.DeleteClientAsync` for every client, in Keycloak mode too.
  - It adds `VendorDeleteResult.FailureClientsChanged`, which answers `409`, and answers `502` on a provider failure.
  - It changes the public `IVendorRepository.DeleteVendor` contract.

  As a result, a Keycloak outage now blocks vendor deletes that used to succeed. The description and CS-AUTH.md:448 also say there are five E2E scenarios; the feature has six, because of scenario 06 (vendor delete, `@MssqlRepresentative`).
  Fix: Update the PR description and CS-AUTH.md:448 to cover the vendor-delete scope, its Keycloak effect, the new `409`/`502` outcomes and the interface change. Consider splitting it into its own PR.
- **[Maintainability]** The security-critical re-validation logic is duplicated word for word across the two engines.
  `RefusalReason`, `StoredClientState` and the refuse, roll back, log and choose-outcome block appear in both PG `OpenIddictDataRepository.cs:572-590,622-635` and MSSQL `:603-621,654-667`. If one copy changes without the other, the engines diverge on `ClientNotFound` vs `ClientChanged`.
  Fix: Move the refusal decision, the record and the outcome mapping into a shared internal helper in `Backend.OpenIddict`. Keep only the SQL per engine.
- **[Maintainability]** The approval-subquery SQL now exists twice per engine, four copies in total.
  `ReadStoredClientStateSql` (PG `:70-80`, MSSQL `:85-93`) repeats the approval expression from `GetClientCredentialAsync`. If they drift, the check before the lock and the check under the lock will disagree.
  Fix: Keep one SQL fragment constant per engine and use it in both queries.
- **[Usability]** No `docs/changelog` entry covers the behavior changes admins and integrators will notice.
  The changes:
  - Vendor delete now depends on the identity provider and can answer `409` or `502`.
  - `/connect/token` can now answer `409` for limit-disabled and limit-exempt clients.
  - Reset, delete and un-approval now revoke tokens, subject to the residual DMS window.
  - Re-approval does not revive revoked tokens.

  Fix: Add Breaking/behavior entries for these, plus the orphaned-client caveat.
- **[Test Coverage]** No test pits un-approval against a real grant's `ApiClient` read, so a lock-order deadlock would go unnoticed.
  `It_calls_the_participant_before_the_un_approval_is_written` checks only `ApprovedWhenCalled`, which would still pass if the participant moved after the `ApiClient` XLOCK. In `Given_A_Grant_Committed_While_The_Un_Approval_Waits`, the holder only inserts a token and never runs `ReadStoredClientStateSql`.
  Fix: On both engines, have the holder also run the grant's approval read once the update is observed blocked. Assert no 1205/40P01, a successful un-approval, and the token revoked.

## 🔵 Low

- **[Security]** In Keycloak mode, reset, delete and un-approval still revoke nothing (`NoOpUnapprovalTokenRevocation.cs:17-23`). CMS accepts old tokens until `exp` plus skew. This is documented and out of scope.
  Fix: Track a follow-up to revoke Keycloak sessions, using logout-all or a not-before policy.
- **[Security · Maintainability]** Every grant, including limit-exempt and limit-disabled clients, now holds a pooled connection for up to 5 s while waiting on the per-client lock. A single valid credential can therefore tie up connections, and grants can now wait behind a whole `UpdateApiClient` transaction. `LockTimeoutMilliseconds = "5000"` is defined per engine (PG `:33`, MSSQL `:34`).
  Fix: Add per-client rate limiting on `/connect/token` or a try-lock that answers `409`. Define the timeout once in shared code or bind it to configuration, and document the blocking bound.
- **[Functionality · Usability]** The new "revocation unconfirmed" branch for a repeated un-approval answers a generic `500` (`ApiClientModule.cs:1338-1351`), where the same case used to answer `204`. The "safe to retry" advice appears only in the log. The branch also runs in Keycloak mode, where nothing is revoked.
  Fix: Apply the branch only when the participant actually revokes, for example with a capability flag. Return problem details saying the outcome is unconfirmed and a retry is safe.
- **[Functionality]** On SQL Server, reset and delete revocation can deadlock with the expired-token sweep. The bulk `UPDATE … WHERE ApplicationId` (MSSQL `:737`) uses the access order that the existing comment at `:44-50` flags. The result is `FailureUnknown`, which answers `500`. The transaction rolls back, so this is safe.
  Fix: Retry briefly on 1205 in `ResetCredentialsAsync`/`DeleteClientAsync`, or document the `500` as retriable.
- **[Usability · Test Coverage]** On PostgreSQL a deadlocked grant answers `500 server_error`, while SQL Server answers `409`. PG catches only `55P03` (`OpenIddictDataRepository.cs:606-607`). More grants can now hit this because every grant takes the lock, and no test pins the PG behavior.
  Fix: Add `PostgresErrorCodes.DeadlockDetected` to the catch filter and map it to `LockTimeout`, so both engines answer `409`. Then add a test for it.
- **[Usability · Maintainability]** Operators will struggle to answer "why did my token stop working?" from the logs:
  - A refused stale grant is logged only at Debug (PG `:582`, MSSQL `:614`).
  - Reset and delete log the identical text "Revoked {Count} outstanding tokens…" (`OpenIddictClientRepository.cs:472,528`).
  - Un-approval says "Marked {Count}…" and emits two Information lines when the application is missing (`OpenIddictUnapprovalTokenRevocation.cs:50,56`).
  - Identifiers are mixed: `ClientId` in some messages, `ClientUuid`/`ApplicationId` in others.

  Fix: Log the refusal at Information, name the operation in each revocation message, use one template, and include both `ClientId` and `ClientUuid`.
- **[Usability]** The vendor-delete `502` ("Identity provider error during client deletion", `VendorModule.cs:1015-1018`) doesn't say that some clients may already be removed or that a retry is safe.
  Fix: Add that guidance to the `detail`.
- **[Usability]** Admins get no sign of the residual DMS acceptance window (`exp` + `ClockSkewSeconds`) when reset, delete or un-approve succeeds.
  Fix: State the window in the Management API's OpenAPI descriptions for these endpoints.
- **[Maintainability]** `VendorModule.DeleteProviderClientAsync` (`:979-1035`) copies `ApplicationModule.cs:1329-1388`'s `ClientDeleteResult` → `IResult` mapping.
  Fix: Extract a shared helper.
- **[Maintainability]** `DeleteApplicationByIdAsync` and `RevokeTokensForApplicationAsync` still accept `transaction = null` (`IOpenIddictDataRepository.cs:85,208`), even though they are only correct inside the caller's transaction.
  Fix: Make the transaction parameter required.
- **[Maintainability]** The three operations take the row lock three different ways:
  - Reset takes it implicitly through the `UPDATE`.
  - Delete takes it implicitly through the `DELETE`.
  - Un-approval calls `LockApplicationAsync` explicitly.

  `StoreTokenAsync` also runs the lock SQL inline. Reset and delete stay correct only because of statement order, which only a comment enforces.
  Fix: Call `LockApplicationAsync` explicitly everywhere.
- **[Maintainability]** `IUnapprovalTokenRevocation` lives in a `Repositories` namespace and takes raw `IDbConnection`/`IDbTransaction`, so it assumes the identity provider shares the CMS database.
  Fix: Move it to `Services` and document that assumption.
- **[Maintainability]** About 3,000 lines of integration fixtures are copied between PG and MSSQL. This matches the existing per-engine pattern.
  Fix: Over time, move engine-neutral scenarios into a shared abstract base.
- **[Test Coverage]** No lock-timeout test covers a disabled (0) or exempt (-1) limit. These paths can newly answer `409`.
  Fix: Parameterize the lock-timeout fixture with `[TestCase(5)][TestCase(0)][TestCase(-1)]` on both engines.
- **[Test Coverage]** `Given_A_Grant_Blocked_By_A_Lifecycle_Transaction.ApplyChangeAsync` hand-writes the lifecycle SQL instead of calling the production repositories, so it would still pass if the production statements drifted.
  Fix: Call `OpenIddictClientRepository`/`ApiClientRepository` with a gated transaction.
- **[Test Coverage]** No test covers cross-tenant un-approval with a participant that records calls; the tenant fixtures use the NoOp.
  Fix: Add a tenant-mismatch fixture asserting "not found" and zero participant calls.
- **[Test Coverage]** The ambiguous-un-approval module test makes weak assertions: `HaveCount(1)` with no UUID or argument check, no log assertion, and no negative control.
  Fix: Assert the exact UUID and arguments and the log message, and add a fixture where the state differs.
- **[Test Coverage]** No test covers `VendorRepository.DeleteVendor`'s exception → rollback → `FailureUnknown` path on either engine.
  Fix: Add an integration fixture where a client cascade throws mid-delete.
- **[Test Coverage]** No test covers a null stored `ClientSecret`, which goes through `?? string.Empty` and `COALESCE(..., '')`.
  Fix: Add a store test on each engine and a manager unit test.

## ⚪ Nit

- **[Functionality]** Un-approval reads `ClientUuid` before taking the `ApiClient` row lock (MSSQL `ApiClientRepository.cs:556-563`, PG `:539-546`). This can't cause a problem today; optionally re-check the UUID under the lock.
- **[Maintainability]** `SanitizeForLog(applicationId.ToString())` sanitizes a Guid; log the Guid directly.
- **[Maintainability]** The `null => "missing"` branch in `StoreTokenAsync` is effectively unreachable after the lock. Add a comment saying it is defensive.
- **[Maintainability]** `lockedState!` uses a null-forgiving operator (`VendorModule.cs:947`). Return a discriminated result instead.
- **[Usability]** The token-endpoint `409` has no `Retry-After` header, and its description blames only "concurrent requests for the same client" (`IdentityModule.cs:622-623`).
- **[Usability]** The PR description says scenarios 01–03 run in the SQL Server lane; OWASP-AUTH-COVERAGE.md says 01–03 and 06.
- **[Usability]** The CS-AUTH "Lifecycle revocation" section is dense. Put a short operator checklist (confirm, retry, DMS window) at the top.
- **[Test Coverage]** The concurrency fixtures' 3 s and 4 s blocked-observation timeouts leave little room under the 5 s grant lock timeout on starved CI runners. Consider a longer lock timeout in those fixtures.

---

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | Closes the stated revocation gaps with no exploitable flaw in the locking; the main remaining risk is the documented, unremediated set of clients orphaned by earlier vendor deletions. |
| Functionality | COMPLETE — Every stated requirement is implemented, and the transactional guarantees, lock ordering and outcome matrix hold in the code; the PR description omits the vendor-delete and Keycloak-impacting change. |
| Maintainability | Carefully reasoned and well documented, but correctness-critical re-validation and approval logic is duplicated across engines and modules, and the vendor-delete scope is undeclared. |
| Usability | Consistent and safe for API consumers and thoroughly documented; admin error bodies, the changelog and operator logs need work. |
| Test Coverage | STRONG — Every requirement has mirrored PG/MSSQL integration, unit and E2E coverage, with deterministic concurrency fixtures; the gaps are narrow edge orderings and error paths. |

---

## Summary

No Critical or High issues were found. The core guarantee (revoke inside the same transaction, plus a locked, re-validated grant) holds on both engines and is well tested. Before merging:

- Update the PR description, CS-AUTH.md and the changelog for the undeclared vendor-deletion rework and its effect in Keycloak mode.
- Decide on remediation for clients orphaned by earlier vendor deletions.
- Consider consolidating the duplicated cross-engine re-validation logic.

Making PostgreSQL deadlocks answer `409` like SQL Server is a cheap consistency win.

## usage

AI Credits 848.05 (Time: 35m 1s)

Tokens     ↑ 13.7m (12.9m cached, 758.1k written) • ↓ 105.3k (48.4k reasoning)
  GitHub Copilot • Claude Opus 5.5 ↑ 13.7m (12.9m cached, 758.1k written) • ↓ 105.3k (48.4k reasoning)

Extra skills used: none
