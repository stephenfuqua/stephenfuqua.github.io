# PR #1420 Review — [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval

> Requirement context: DMS-1493, using the PR description (no GitHub issue body supplied).
> Reviewed commit: `01222687f0acc7be5bff159867aae1b956d4208a` (requested). The live PR head has since advanced to `eb1774b399e7c51ba19c3665bc616072aff3244e`; findings below were checked against the requested commit.
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> GitHub posting: Not posted, per request.

## Review prompt

Review PR #1420 at commit `01222687f0acc7be5bff159867aae1b956d4208a`. Treat the PR description as the requirements; no Jira or GitHub issue lookup is needed. Use five specialist reviews—security, functionality, maintainability, usability, and test coverage—with the same model. Group findings by severity, cite the affected files and lines, provide concrete fixes, and include each specialist's verdict. Save this prompt and the final review in `./reviews/round-3-luna6.md`. Do not post to GitHub.

The PR's stated contract is to revoke all stored self-contained tokens transactionally on credential reset, client deletion, and un-approval; serialize token issuance per client and revalidate the secret and approval under the lock; preserve the documented engine-specific timeout/deadlock responses and Keycloak behavior; and cover lifecycle, concurrency, rollback, and orphan-token cases.

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

None found.

## 🔵 Low

- **[Maintainability]** The new transaction-sensitive repository methods allow callers to omit the transaction — `src/config/backend/EdFi.DmsConfigurationService.Backend.OpenIddict/Repositories/IOpenIddictDataRepository.cs:85-89, 208-212`. Both methods document that deletion/revocation occurs inside the caller's transaction, but accept a nullable transaction with a default of `null`; Dapper will then execute outside that transaction, undermining the atomicity invariant if a future caller omits it. Require a transaction for these methods (or provide a separately named non-transactional operation if one is needed).
- **[Usability]** A PostgreSQL deadlock surfaces as a generic server error instead of the retryable contention response used for timeouts and SQL Server deadlocks — `src/config/backend/EdFi.DmsConfigurationService.Backend.Postgresql/OpenIddict/Repositories/OpenIddictDataRepository.cs:606-613`; the token endpoint's fallback is `src/config/frontend/EdFi.DmsConfigurationService.Frontend.AspNetCore/Modules/IdentityModule.cs:408-412`. A client cannot reliably distinguish transient contention from a server fault and may not retry. The PR documents this engine difference; if consistent client recovery is desired, map PostgreSQL SQLSTATE `40P01` to the existing retryable outcome and align the documentation.
- **[Test Coverage]** The PostgreSQL integration tests exercise lock timeout but do not cover the documented deadlock-victim response — `src/config/backend/EdFi.DmsConfigurationService.Backend.Postgresql.Tests.Integration/OpenIddictDataRepositoryTests.cs:4280-4316` tests timeout only, while the repository catches only `LockNotAvailable` at `src/config/backend/EdFi.DmsConfigurationService.Backend.Postgresql/OpenIddict/Repositories/OpenIddictDataRepository.cs:606-613`. Add a deterministic PostgreSQL deadlock fixture that asserts the intended error response and that the grant stores no token.

## ⚪ Nit

None found.

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | No actionable vulnerabilities identified in the changed code. |
| Functionality | **COMPLETE** — The lifecycle revocation, per-client locking and revalidation, engine-specific behavior, Keycloak no-op, and registration requirements match the PR's stated contract. |
| Maintainability | The lifecycle flow is documented, but the repository interface does not enforce its transaction invariant. |
| Usability | Lifecycle behavior and recovery are documented; PostgreSQL's generic deadlock error is a minor client-facing recovery gap. |
| Test Coverage | **ADEQUATE** — Coverage is broad and behavior-focused, with PostgreSQL deadlock handling the notable untested path. |

## Summary

The PR provides broad coverage for lifecycle revocation, concurrent grants, rollback, orphan tokens, and provider registration, and no security or functional blockers were identified. Before merging, consider enforcing the transaction requirement at the repository boundary and decide whether PostgreSQL deadlocks should share the retryable response; add a focused test for whichever behavior is intended.

## Usage

Changes    +49 -0
AI Credits 14.63 (6m 55s)
Tokens     ↑ 5.9m (5.5m cached, 421.1k written) • ↓ 77.4k (48.1k reasoning)
  GitHub Copilot • GPT-6 Luna ↑ 5.9m (5.5m cached, 421.1k written) • ↓ 77.4k (48.1k reasoning) • 14.63 AIC

Extra skills used: none
