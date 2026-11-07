# PR #1420 review

## Prompt

```text
Provide a code review of  PR 1420 checked out at commit `01222687f0acc7be5bff159867aae1b956d4208a` focused on correctness and simplicity. Check for duplicated and dead
  code. Ensure the code provides the simplest responsible solution. Check for scope creep. Do not run tests. Save this prompt and your final review as ./reviews/round-22-astra6-high.md. Do not post to GitHub.
```

## Review basis

Reviewed `01222687f0acc7be5bff159867aae1b956d4208a` against its main-branch parent, `7b007ca527ddfd6e9c3c6cd505cc76ffc97130b4`. The working checkout was actually `403e4f4d48d60d67e110084ac1d0ddf79097ebfc`, so the review used an isolated worktree at the requested commit. All locations below refer to that pinned commit, not subsequent fixes.

Static review only; no tests or builds were run. Nothing was posted to GitHub.

## Findings

**Request changes: two correctness findings in vendor deletion.**

### 1. P2: Handle the vendor delete being selected as the SQL Server deadlock victim

**Location:** `src/config/backend/EdFi.DmsConfigurationService.Backend.Mssql/Repositories/VendorRepository.cs:491-495`.

The new guarded delete can deadlock with a concurrent application/client creation: deletion holds the parent lock while creation has written a child row and waits for its foreign-key check; deletion then needs that child row. SQL Server can choose either transaction as the victim. If it chooses deletion, error 1205 enters this generic catch, becomes `FailureUnknown`, and the endpoint returns `500` instead of the documented retriable `409`.

The added integration fixture masks this outcome by executing `SET DEADLOCK_PRIORITY LOW` on the creator (`src/config/backend/EdFi.DmsConfigurationService.Backend.Mssql.Tests.Integration/VendorTests.cs:1115-1118`). It verifies only the creator-victim outcome, not the production case where deletion loses. Previously completed provider deletions remain committed even when the vendor transaction rolls back, so correctly identifying the retryable conflict matters.

**Requested change:** Handle error 1205 specifically and route it to the existing retriable conflict response, leaving unrelated exceptions as failures. Add a deterministic counterpart that selects deletion as the victim and verifies the retained CMS rows and retry outcome. Do not add an unbounded retry loop.

### 2. P2: Do not claim that a conflicted vendor deletion deleted nothing

**Location:** `src/config/frontend/EdFi.DmsConfigurationService.Frontend.AspNetCore/Modules/VendorModule.cs:962-966`.

Before reaching this warning, lines 947-953 have already deleted every client in the snapshot from the identity provider. In self-contained mode, those separate transactions also committed token revocation. A newly discovered client makes the final CMS cascade roll back, but it does not restore the provider clients.

The warning, `"nothing was deleted"`, therefore gives operators the wrong account of a partially completed destructive operation. Existing clients can no longer authenticate even though their CMS rows survive. The corresponding test repeats the misleading claim: `It_deletes_nothing_on_the_first_attempt` only asserts that the event list lacks `"vendor"`, ignoring the provider-deletion events (`src/config/frontend/EdFi.DmsConfigurationService.Frontend.AspNetCore.Tests.Unit/Modules/VendorModuleTests.cs:4038-4040`).

**Requested change:** Say that the vendor transaction was rolled back and earlier provider deletions remain committed. Align the adjacent comments/documentation and rename or strengthen the assertion to distinguish retained CMS rows from deleted provider clients.

## Simplicity, duplication, and dead code

**Optional: avoid the extra lookup on approved updates.** Both `ApiClientRepository` implementations now read `ClientUuid` before checking `!command.IsApproved`, although only the revocation participant needs it. The following locked read already handles a missing API client. Move the new lookup and its not-found handling inside the un-approval branch, preserving the existing lock order. Locations: PostgreSQL `Repositories/ApiClientRepository.cs:539-559`; SQL Server `Repositories/ApiClientRepository.cs:558-578`, under their respective backend projects.

**Optional: remove the unreachable second missing-application path.** After a successful application-row lock, that row cannot disappear before the subsequent state read in the same transaction. The nullable state, `"missing"` refusal reason, and second `ClientNotFound` return therefore describe an unreachable normal outcome. A required single-row read would express the invariant more directly and expose an unexpected violation rather than treating it as invalid credentials. Locations: PostgreSQL `OpenIddict/Repositories/OpenIddictDataRepository.cs:572-589,622-635`; SQL Server equivalent `:603-620,654-667`.

The two engines also duplicate `RefusalReason` and `StoredClientState`, and token storage repeats the locking query already wrapped by `LockApplicationAsync`. These are small consolidation opportunities, not justification for a generic transaction framework. I found no newly introduced orphaned service or unused registration; the Keycloak no-op is intentional provider-specific behavior, not dead code.

## Overall assessment and scope

The core solution is appropriately narrow: reuse one per-client database lock, re-read credentials and approval after acquiring it, and commit lifecycle changes with revocation. The separate PostgreSQL statement is necessary for a fresh snapshot; simplifying it into the locking statement would be incorrect. The un-approval participant is justified because revocation must share the CMS update's transaction.

Vendor cleanup is a justified extension: otherwise deleting a vendor bypasses the lifecycle guarantee through cascading CMS deletion. It does, however, change Keycloak vendor deletion too; claims that "Keycloak mode is unchanged" should be limited to token-revocation semantics. No unrelated schema, dependency, configuration, or DMS runtime changes were found. The mirrored database coverage is substantial but relevant to the engine-specific concurrency behavior; the SQL Server victim-selection gap above remains.

## Usage

AI Credits 471.93 (38m 3s)
Tokens     ↑ 2.3m (2.2m cached, 158.5k written) • ↓ 11.4k (3.7k reasoning)
  GitHub Copilot • GPT-6 Astra ↑ 2.3m (2.2m cached, 158.5k written) • ↓ 11.4k (3.7k reasoning) •
471.93 AIC

Extra skills:

- skill(using-agent-skills)
- skill(code-review-and-quality)
- skill(code-simplification)
- skill(graphify)
