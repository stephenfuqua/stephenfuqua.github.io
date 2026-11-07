# Round 25 — Opus 5.5 (Claude Code), team-pr-review

## Prompt

> /team-pr-review PR 1420 at commit `01222687f0acc7be5bff159867aae1b956d4208a`. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./reviews/round-25-opus-cc.md. Do not post to GitHub.

## Method

- Detached worktree at `01222687f`, diffed against merge-base `7b007ca52` (62 files, +10,519 / −731).
- The PR description was used as the requirements source.
- Five specialist reviewers ran in parallel: Security, Functionality, Maintainability, Usability and Test Coverage. Each checked its findings against the worktree.
- The main thread spot-checked a few claims:
  - `COALESCE(..., true)` in `ReadStoredClientStateSql`.
  - The CS-AUTH line saying "`keycloak` mode is unchanged".
  - The feature file has 6 scenarios.
  - PostgreSQL catches only `LockNotAvailable`.
  - Commit `403e4f4d4` touches vendor-delete deadlock mapping and `RedemptionDate` UTC.
- Duplicate findings were merged and carry several reviewer labels.

Paths are relative to the repository root. `…/Postgresql` and `…/Mssql` abbreviate `src/config/backend/EdFi.DmsConfigurationService.Backend.{Postgresql,Mssql}`.

---

# PR #1420 Review — [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval
>
> Requirements: PR description (DMS-1493)
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> Commit reviewed: `01222687f` (the later head commit `403e4f4d4` was not reviewed, except where noted)

---

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

- **[Functionality · Usability · Maintainability]** The PR description and CS-AUTH say "`keycloak` mode is unchanged", but vendor deletion now deletes identity-provider clients in both modes. The vendor-delete work is not described at all.
  - `VendorModule.Delete` (`src/config/frontend/.../Modules/VendorModule.cs:906-1036`) calls `IIdentityProviderRepository.DeleteClientAsync` for every client of the vendor, then runs the guarded `DeleteVendor(id, cleanedClients)`. That call returns `FailureClientsChanged` → 409.
  - This adds new failure modes to `DELETE /v3/vendors/{id}`: a 502 when the provider is unreachable, a retriable 409, and a partial state where the provider clients are gone but the database rows survive.
  - On a Keycloak retry, `KeycloakClientRepository.DeleteClientAsync:572` logs a 404 at Error with a stack trace before it is treated as already absent.
  - The change itself is a security improvement, and OWASP-AUTH-COVERAGE and CS-AUTH §501-529 describe it accurately.
  - The PR body says the E2E feature has five scenarios; it has six. Scenario 06 is the vendor delete.
  - Fix: Add a vendor-delete bullet to the PR description. Reword `reference/design/configuration-service/CS-AUTH.md:448` to say Keycloak mode revokes no tokens but vendor deletion now deletes Keycloak clients and needs Keycloak to be reachable. Downgrade the Keycloak 404 delete log to Information without the exception. Fix the scenario count.

- **[Functionality · Usability · Test Coverage]** Deadlocks outside the SQL Server grant path answer a generic 500 instead of the retriable 409. No test exercises the case where the lifecycle side loses the deadlock.
  - PostgreSQL grants catch only `LockNotAvailable` (`…/Postgresql/OpenIddict/Repositories/OpenIddictDataRepository.cs:607`), so `40P01` becomes `500 server_error` and an Error log. This is documented, but the fix is a one-line filter.
  - On SQL Server, the reset, delete and un-approval transactions catch everything as `FailureUnknown`, and so did vendor delete at `…/Mssql/Repositories/VendorRepository.cs:491`. The new revoke-all `UPDATE` and the expired-token sweep take locks in opposite orders, so a deadlock is plausible, though nobody reproduced one.
  - The only vendor-delete deadlock fixture forces the other session to lose: `SET DEADLOCK_PRIORITY LOW` in `…/Mssql.Tests.Integration/VendorTests.cs:1116`.
  - Head commit `403e4f4d4` fixes the vendor-delete case only.
  - Fix: Map PostgreSQL `40P01` and SQL Server 1205 to the retriable 409 on the grant path and on every lifecycle path. Add fixtures where the lifecycle transaction is the deadlock victim, and assert 409 at the module layer.

- **[Maintainability]** The re-validation logic is copied word for word into both engine repositories.
  - `RefusalReason` and `StoredClientState` are identical in `…/Postgresql/.../OpenIddictDataRepository.cs:622-635` and `…/Mssql/.../OpenIddictDataRepository.cs:654-667`. So is the read, refuse, log and map block in `StoreTokenAsync`.
  - The outcome is decided twice: once through `"missing"`, and again through `storedState is null ? ClientNotFound : ClientChanged`.
  - Fix: Move the decision into one helper in `Backend.OpenIddict`, for example `StoredClientStateValidator.Evaluate(state, expectedSecret)`. Keep only the SQL engine-specific.

- **[Maintainability]** The three lifecycle paths take the application lock in different ways, and only comments enforce the order.
  - Un-approval calls `LockApplicationAsync` explicitly (`OpenIddictUnapprovalTokenRevocation.cs:28`).
  - Reset and delete rely on their first DML statement taking the lock (`OpenIddictClientRepository.cs:459`, `:507`). Adding a statement before it would silently lose the lock.
  - `StoreTokenAsync` also runs `LockApplicationSql` inline instead of calling the new `LockApplicationAsync`.
  - Fix: Call `LockApplicationAsync` first on every path, or share one `LockAndRevokeAsync(applicationId, conn, tx)` helper. Have `StoreTokenAsync` reuse it.

- **[Maintainability]** The vendor delete adds a third copy of the `ClientDeleteResult` → HTTP mapping.
  - The copies are in `VendorModule.cs:979` (`DeleteProviderClientAsync`), `ApiClientModule.cs:~1734` and `ApplicationModule.cs:~1353`, and their log text and mapping already differ slightly.
  - Fix: Extract one shared frontend helper, for example `ProviderClientDeletion.ToFailureResult(...)`.

- **[Maintainability]** The un-approval block makes the ~300-line `UpdateApiClient` longer on both engines.
  - The new `ClientUuid` read and not-found check (PG `ApiClientRepository.cs:539-560`, MSSQL `:558-579`) runs on every update and duplicates the later locked not-found check.
  - The lock-order rule ("after the Application locks, before the ApiClient row lock") lives only in comments, and the two engines word them differently.
  - Fix: Extract a private `RevokeTokensIfUnapprovingAsync` per engine, or a shared step. Keep one reference comment that points to CS-AUTH.

- **[Maintainability · Usability · Security]** Revocations and `ClientChanged` refusals are hard to trace in production logs.
  - `OpenIddictTokenManager.cs:328` returns `invalid_client` for `ClientChanged` without logging anything. The only trace is a repository `LogDebug` keyed by application id. Every other refusal in that method logs at Warning.
  - Reset (`OpenIddictClientRepository.cs:528`) and delete (`:472`) log the identical text "Revoked {Count} outstanding tokens for client {ClientUuid}", and un-approval uses a third wording.
  - The count includes expired rows that have not been swept, so "outstanding" can overstate the exposure.
  - No line records who made the change (the audit user or trace id).
  - Identifiers vary between lines: `ClientUuid`, `ClientId`, numeric `Id` and `ApplicationId`.
  - Fix:
    - Log `ClientChanged` at Warning, with the sanitized client id and the category (`secret` or `approval`).
    - Use one revocation template with a `{LifecycleOperation}` field, and include the audit user and `ClientId`.
    - Drop the word "outstanding", or count only unexpired rows.

- **[Usability]** No changelog entry covers the behaviour changes integrators and operators will notice.
  - `docs/changelog/8.1.0.md` has entries for the sibling DMS-14xx tickets but not this one.
  - Missing changes:
    - CMS now answers 401 to tokens after a reset, delete or un-approval.
    - Every grant now takes the per-client lock, so unlimited and exempt clients can also get a 409.
    - Vendor delete now deletes provider clients.
  - Missing upgrade caveats: tokens issued before deployment, and clients orphaned by earlier vendor deletions.
  - Fix: Add a "behavior changes" entry that links to CS-AUTH §Lifecycle revocation.

- **[Usability]** The admin guide still suggests that un-approval or deletion cuts off access immediately.
  - `docs/API-CLIENT-AND-INSTANCE-CONFIGURATION.md:257-259` says "disable it … or delete it", and `:369-370` says "the old one stops working".
  - Neither says that DMS keeps accepting existing tokens until `exp` + `ClockSkewSeconds` (30m30s by default).
  - Neither says that Keycloak mode revokes nothing, that re-approval does not revive tokens, or that retrying a reset rotates the secret again.
  - Fix: Add a short paragraph at both places that links to CS-AUTH §Confirming a lifecycle revocation.

- **[Usability]** The docs disclose live orphaned credentials but give operators no way to find or remediate them.
  - OWASP-AUTH-COVERAGE.md:211-217 and CS-AUTH.md:663-668 say clients orphaned by earlier vendor deletions "can keep obtaining new tokens" and that "this version provides no cleanup".
  - These clients are not obvious to find, because the exempt admin and bootstrap clients also have no `ApiClient` row.
  - Fix: Document a query that lists `OpenIddictApplication` rows with no matching `ApiClient.ClientUuid`, excluding admin-scope clients, plus a remediation step.

- **[Test Coverage]** No test covers the un-approval lock order the merge chose against a concurrent DMS-1625 claim-set rename or Application update.
  - The merge's lock order, at `…/Mssql/Repositories/ApiClientRepository.cs:~549-580` and CS-AUTH:532-541, is justified only by comments.
  - Fix: On both engines, hold an uncommitted rename, start an un-approval, and use the existing blocking probe to show it waits. Then commit, and assert there is no deadlock, the tokens are revoked, and `IsApproved` is false.

## 🔵 Low

- **[Security]** The re-check under the lock treats a client with no `ApiClient` row as approved, which fails open.
  - `ReadStoredClientStateSql` uses `COALESCE(BOOL_AND/MIN(IsApproved), true)` (`…/Postgresql/.../OpenIddictDataRepository.cs:70-78`; MSSQL `:85-92`). This is inherited from `GetClientCredentialAsync`.
  - Today's flows remove the provider client first, but a future database-first delete or a manual cleanup would re-enable a client that had been un-approved.
  - Fix: Document the default in CS-AUTH. Better, flag the clients that legitimately have no `ApiClient` row, and treat a missing row as not approved for everyone else.

- **[Security]** Un-approval revokes tokens for a `ClientUuid` it read before locking the `ApiClient` row.
  - The read is at PG `ApiClientRepository.cs:539` and MSSQL `:558`.
  - A concurrent `SyncApiClientUuid` swap could make it revoke the wrong application's tokens. This is not reachable in self-contained mode today.
  - Fix: After the `FOR UPDATE` / `XLOCK` read, check that `ClientUuid` is unchanged; roll back with a 409 if it changed.

- **[Functionality · Maintainability]** At this commit, PostgreSQL `/connect/revoke` writes `RedemptionDate = CURRENT_TIMESTAMP` in session-local time (`…/Postgresql/.../OpenIddictDataRepository.cs:665`). The new bulk revoke writes UTC (`:683`), so it does not behave "as `/connect/revoke` does".
  - This is copy-paste drift, and the `'valid'` / `'revoked'` literals are repeated in the same way.
  - Fix: Confirm `403e4f4d4` merges with this PR. Share the SET clause and status literals as constants.

- **[Functionality]** `docs/CONFIGURATION.md:1421` and `docs/DOCKER.md:128` still say a limit below 1 "disables enforcement". They don't say that grants for one client still serialize and can answer 409 after waiting 5 s for the lock.
  - Fix: Add one sentence to both.

- **[Maintainability · Security]** The 5-second lock timeout applies only to grants.
  - `LockApplicationAsync`, reset, delete and un-approval wait until the command timeout. CS-AUTH doesn't say so.
  - The constant is duplicated per engine (PG `:33-35`, MSSQL `:34-36`).
  - Fix: Either document the asymmetry, or share the constant and apply it on the lifecycle side, mapping a timeout to 409.

- **[Maintainability]** The contract says these methods run "inside the caller's transaction", yet `RevokeTokensForApplicationAsync` and `DeleteApplicationByIdAsync` accept `IDbTransaction? transaction = null` (`IOpenIddictDataRepository.cs:~245`, `~368`). Calling them without a transaction skips the lock.
  - Fix: Make the parameter required, as it already is on `LockApplicationAsync`.

- **[Maintainability]** `IUnapprovalTokenRevocation` is a transaction participant, but it lives in the `Repositories` namespace.
  - It also assumes, without saying so, that the caller's connection reaches the `dmscs.OpenIddict*` tables.
  - Fix: Move it to `Backend.Services` or `Backend.Identity`, and document the shared-database assumption.

- **[Maintainability]** About 3.2k lines of integration fixtures are mirrored by hand per engine.
  - Fix: Not blocking. Later, consider a shared abstract fixture base with engine-specific probes.

- **[Usability]** The 409 description blames only "concurrent requests for the same client" (`IdentityModule.cs:622-623`, CS-AUTH.md:124).
  - A grant can also wait behind a reset, delete or un-approval, or behind the SQL Server sweep. After such a wait, the retry gets `invalid_client`.
  - Fix: Reword: "…the client is being modified or has concurrent token requests. Retry; if it then fails with invalid_client, the client's credentials or approval changed."

- **[Usability]** An ambiguous un-approval failure returns a generic 500 to the admin, and the retry advice exists only in the server log (`ApiClientModule.cs:1338-1351`).
  - Fix: Put the retry advice in the problem-details `detail`, or return the retriable 409.

- **[Test Coverage]** C-2 for reset and delete hand-runs the repository statements instead of the production `ResetCredentialsAsync` / `DeleteClientAsync` (PG `OpenIddictDataRepositoryTests.cs:2597`, MSSQL `:2663`).
  - Fix: Copy the un-approval pattern: wrap the real data repository, block inside `RevokeTokensForApplicationAsync`, and drive `OpenIddictClientRepository`.

- **[Test Coverage]** The lock-timeout and SQL Server deadlock-victim tests use a limit of 5 only, so the new behaviour with enforcement disabled has no regression test.
  - Fix: Turn both into `[TestCase(5)] [TestCase(EnforcementDisabled)]`.

- **[Test Coverage]** The cross-tenant un-approval test uses `NoOpUnapprovalTokenRevocation` (PG `ApiClientTests.cs:436`, MSSQL `:555`), so it cannot detect a revocation attempt against another tenant.
  - Fix: Use the recording participant, and assert it was never called.

- **[Test Coverage]** The ambiguous un-approval branch has only its positive test (`ApiClientModuleTests.cs:3847`).
  - Fix: Add an approved → unapproved committed case (expect 204) and an approved-repeat case (expect the branch not taken). Assert the "retry" log line.

- **[Test Coverage]** The vendor-delete module tests skip lock-acquisition failure and a lock-time pre-read returning NotFound or Unknown on `DELETE /v3/vendors/{id}`.
  - Fix: Add one fixture for each.

- **[Test Coverage]** The C-3 probe budget is 3 s against the grant's 5 s lock timeout (`OpenIddictDataRepositoryTests.cs:44`, both engines). That is tight on a loaded CI host; a failure would be loud, not a false pass.
  - Fix: Shorten the probe budget to 2 s, or lengthen the lock timeout in the test configuration.

## ⚪ Nit

- **[Security]** The revocation log lines don't name who made the change. This is covered by the Medium logging item above.
- **[Usability]** The docs don't tie "retries are safe" to "a retried delete answers 404 once the first delete committed" (CS-AUTH:574-591). Add one sentence.
- **[Test Coverage]** E2E scenarios 04 and 05 (application reset and delete) are not in the SQL Server lane. Tag 04 `@MssqlRepresentative` if the lane's budget allows.
- **[Test Coverage]** `TokenRevocationStartupTests.ParticipantHeldBy` reads a compiler-generated primary-constructor field through reflection (`:176-179`). It is brittle; consider dropping it in favour of the resolution tests.
- **[Maintainability]** The reset and delete catch blocks (`OpenIddictClientRepository.cs:486`, `:536`) don't log the client id. Add the sanitized `ClientUuid`.

---

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | Sound to merge. The lock, ordinal re-check and in-transaction revocation close all three claimed windows on both engines. The two Low items are hardening. |
| Functionality | **COMPLETE** — every described requirement is implemented with engine parity and a safe lock order, but the description is out of date: it omits the vendor-delete work and its Keycloak behaviour change. |
| Maintainability | Careful and well commented, but lock-order rules that live only in comments, plus logic copied between engines and lifecycle paths, will make changes costly. Pull them into shared helpers. |
| Usability | Runtime errors are mostly consistent and recoverable. Operator and admin facts (the DMS window, re-approval semantics, vendor-delete and Keycloak changes, upgrade caveats) appear only in dense design and security docs, not in the changelog or the admin guide. |
| Test Coverage | **STRONG** — real-database fixtures on both engines, confirmed by blocking probes, prove that a racing grant's token is either stored then revoked or never stored. The gaps are the lifecycle-side deadlock answer and the un-approval vs. rename lock order. |

---

## Summary

No Critical or High findings. All five reviewers agree that the core guarantee holds on PostgreSQL and SQL Server and is well tested: a racing grant's token is either stored and then revoked, or never stored.

Before merging, the most important fixes are:

1. Update the PR description and CS-AUTH for the vendor-delete work, which also changes Keycloak-mode behaviour.
2. Map deadlocks on PostgreSQL and on the lifecycle paths to the retriable 409, and test it.
3. Add the changelog entry and admin-guide notes, so operators learn about the DMS acceptance window and the upgrade caveats.

Also make sure head commit `403e4f4d4`, which fixes the `RedemptionDate` UTC drift and part of the deadlock mapping, merges with this PR.

## Usage

 Session

   Total cost:            $11.18
   Total duration (API):  26m 26s
   Total duration (wall): 11m 24s
   Total code changes:    201 lines added, 0 lines removed
   Usage by model:
        claude-opus-5-5:  103.3k input, 129.6k output, 22.0m cache read, 710.8k cache write ($11.18)
   Prompt cache (main):   13 requests · 93% of input tokens from cache · no misses · warm (1h TTL, last activity 37s ago)

   Current session
   ████████████████▌                                  33% used
   Resets 10:30pm (UTC)

   Current week (all models)
   ██▌                                                5% used
   Resets Nov 12, 3pm (UTC)
