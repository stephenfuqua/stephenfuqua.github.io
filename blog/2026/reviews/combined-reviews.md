# Combined Review: PR #1420 (DMS-1493, token revocation in self-contained mode)

## Scope

- Source files: six team PR reviews in `reviews/`, merged and deduplicated.
- Reviewed commit: `01222687f0acc7be5bff159867aae1b956d4208a`. The live PR head had moved to `eb1774b399e7c51ba19c3665bc616072aff3244e` when round 3 ran. Findings refer to the reviewed commit.
- Each finding lists every source that contains it, with that source's rating. Where sources disagree, the highest rating is the heading tier, and every rating is kept in the Sources column.
- Totals: 47 unique findings. High 2, Medium 10, Low 29, Nit 6.

## Source files

| On-disk file | Internal label in file | Specialist model | Notes |
|---|---|---|---|
| `round-1-sonnet55.md` | Round 1 | claude-sonnet-5.5 | Most findings on lock handling, logging and tests |
| `round-2-sol61.md` | Final Review | gpt-6.1-sol | Static review only (`dotnet` unavailable) |
| `round-3-luna6.md` | PR #1420 Review | gpt-6-luna | Static review only (`dotnet` unavailable). Written as this session's review |
| `round-4-astra.md` | "round-10-astra" | GPT-6 Astra | Internal label does not match the file name |
| `round-5-opus.md` | "round-11-opus" | Claude Opus 5.5 | Largest source; most test-coverage gaps |
| `round-6-haiku55.md` | "round-12-haiku55" | claude-haiku-5.5 | Only source with the High findings |

## Coverage caveats

- `round-6-haiku55.md`: its security specialist did not review the MSSQL token store or the `UpdateApiClient` wiring.
- `round-2-sol61.md` and `round-3-luna6.md`: `dotnet` was unavailable, so their findings come from static reading only.
- Internal round labels differ from the file names in `round-4-astra.md`, `round-5-opus.md` and `round-6-haiku55.md`. This report cites file names only.

## Verification of citations

Checked against `git show 01222687f:<path>`:

- `IdentityModule.cs:408`: the fallback 500 `server_error` branch. Confirmed (C18 context).
- `OpenIddictDataRepository.cs:606-613` (PostgreSQL): the `LockNotAvailable` (55P03) catch is at lines 606-607 and the deadlock comment is above it. Confirmed.
- `VendorModule.cs:962-967`: the "nothing was deleted" warning message is at line 964. Confirmed.
- `OpenIddictDataRepositoryTests.cs:4523`: the MSSQL deadlock-victim fixture class. Confirmed.
- Not verified: `round-6-haiku55.md` citations for the PostgreSQL timestamp inconsistency (C45) and for the residual-window wording in `CS-AUTH.md:642` and `OWASP-AUTH-COVERAGE.md:193` (C43). The source file itself marks these as not independently verified.

## Findings: High

| ID | Finding | Sources (rating) |
|---|---|---|
| C2 | Vendor-delete rework is undocumented. The PR description omits it, it changes Keycloak behavior, adds 409 and 502 responses, and changes `IVendorRepository.DeleteVendor`. | `round-1-sonnet55.md` (Medium); `round-5-opus.md` (Medium); `round-6-haiku55.md` (High) |
| C8 | The MSSQL deadlock-victim test does not prove a deadlock. A lock timeout produces the same outcome, so the test passes either way (`OpenIddictDataRepositoryTests.cs:4523-4600`). | `round-6-haiku55.md` (High) |

## Findings: Medium

| ID | Finding | Sources (rating) |
|---|---|---|
| C4 | Clients orphaned by vendor deletions made before this PR can still obtain tokens. No cleanup or detection path exists. | `round-5-opus.md` (Medium); `round-6-haiku55.md` (Medium) |
| C6 | PostgreSQL deadlock (40P01) returns 500 `server_error`. SQL Server returns 409. The PostgreSQL catch handles only 55P03 (`OpenIddictDataRepository.cs:606-613`). | `round-1-sonnet55.md` (Medium); `round-3-luna6.md` (Low); `round-5-opus.md` (Low); `round-6-haiku55.md` (Medium) |
| C7 | No PostgreSQL deadlock-victim integration test. | `round-1-sonnet55.md` (Medium); `round-3-luna6.md` (Low); `round-6-haiku55.md` (Medium) |
| C9 | On SQL Server, reset and delete can deadlock with the expired-token sweep, and the deadlock returns 500. | `round-1-sonnet55.md` (Medium); `round-5-opus.md` (Low) |
| C10 | Reset, delete and un-approval lock waits have no lock timeout. Failures become a generic 500. | `round-1-sonnet55.md` (Medium) |
| C13 | Engine-duplicated lock, refusal and outcome logic: `RefusalReason`, `StoredClientState`, revalidation, `LockApplicationAsync`, revoke, and the 5000 ms constant. `VendorRepository` is included. | `round-1-sonnet55.md` (Medium); `round-5-opus.md` (Medium); `round-6-haiku55.md` (Medium) |
| C14 | The approval subquery is duplicated four times across engines. | `round-5-opus.md` (Medium) |
| C15 | `StoreTokenAsync` mixes too many concerns. Extract helpers. | `round-1-sonnet55.md` (Medium) |
| C25 | No test for un-approval racing a grant's `ApiClient` read. Lock-order deadlock risk is untested. | `round-5-opus.md` (Medium) |
| C42 | No changelog entry for admin-visible behavior changes. | `round-5-opus.md` (Medium) |

## Findings: Low

| ID | Finding | Sources (rating) |
|---|---|---|
| C1 | Partial vendor deletion: the "nothing was deleted" warning and documentation are wrong. The 502 detail gives no partial-state or retry guidance (`VendorModule.cs:962-967`, `1015-1018`). | `round-2-sol61.md` (Low); `round-4-astra.md` (Low); `round-5-opus.md` (Low) |
| C3 | The PR description's E2E inventory is wrong: 5 scenarios where 6 exist, and the SQL Server lane tagging for scenarios 01-03 and 06 is incorrect. | `round-1-sonnet55.md` (Low); `round-5-opus.md` (Nit); `round-6-haiku55.md` (Low) |
| C5 | Keycloak mode revokes nothing (`NoOpUnapprovalTokenRevocation.cs:17-23`). | `round-5-opus.md` (Low) |
| C11 | The 5000 ms grant lock timeout is hard-coded. It is not configurable and ignores `ApplicationLockSettings:AcquireTimeout`. | `round-1-sonnet55.md` (Low); `round-6-haiku55.md` (Low) |
| C12 | Every grant holds a pooled connection for up to 5 s. There is no rate limit or try-lock. | `round-5-opus.md` (Low) |
| C16 | `DeleteApplicationByIdAsync` and `RevokeTokensForApplicationAsync` accept a nullable transaction (`IOpenIddictDataRepository.cs:85-89`, `208-212`). | `round-1-sonnet55.md` (Low); `round-3-luna6.md` (Low); `round-5-opus.md` (Low) |
| C17 | Revocation uses `Status <> 'revoked'`, which skips NULL status. | `round-1-sonnet55.md` (Low) |
| C18 | A repeat un-approval after a committed first attempt answers 500 "revocation unconfirmed", including in Keycloak mode (`ApiClientModule.cs:1338-1351`). **Sources disagree on intent.** | `round-1-sonnet55.md` (Low, intentional); `round-5-opus.md` (Low, regression) |
| C19 | 409 `temporarily_unavailable` has no `Retry-After`. The description blames only concurrency. The 409 versus RFC 503 choice is deliberate. Un-approval failure gives no retry hint. | `round-1-sonnet55.md` (Low); `round-5-opus.md` (Nit); `round-6-haiku55.md` (Low) |
| C20 | `FailureUnknown(ex.Message)` could leak database error text if it reaches clients. | `round-1-sonnet55.md` (Low) |
| C21 | Logging: count-0 is logged at Info; un-approval logs before commit and emits duplicate lines; refusal is logged at Debug; reset and delete share identical text; identifiers are mixed; no grant-lock timeout warning. | `round-1-sonnet55.md` (Low); `round-5-opus.md` (Low); `round-6-haiku55.md` (Low) |
| C23 | No backend integration test for vendor-delete or application-delete revocation. Coverage is E2E only. | `round-1-sonnet55.md` (Low) |
| C24 | E2E scenarios 04 and 05 are not tagged `@MssqlRepresentative`. | `round-1-sonnet55.md` (Low) |
| C26 | The lock-timeout fixture lacks the 0 and -1 limit cases. | `round-5-opus.md` (Low) |
| C27 | `Given_A_Grant_Blocked_By_A_Lifecycle_Transaction` hand-writes SQL instead of calling production repositories. | `round-5-opus.md` (Low) |
| C28 | No cross-tenant un-approval test with a recording participant. | `round-5-opus.md` (Low) |
| C29 | The ambiguous un-approval module test has weak assertions. | `round-5-opus.md` (Low) |
| C30 | `VendorRepository.DeleteVendor` exception, rollback and `FailureUnknown` paths are untested. | `round-5-opus.md` (Low) |
| C31 | The null stored `ClientSecret` path is untested. | `round-5-opus.md` (Low) |
| C33 | Polling `Task.Delay` loops are acceptable. Residual CI-load risk only. **No action.** | `round-1-sonnet55.md` (Low) |
| C35 | Three different lock-acquisition styles across reset, delete and un-approval. | `round-5-opus.md` (Low) |
| C36 | `IUnapprovalTokenRevocation` lives in the Repositories namespace and assumes a shared database. | `round-5-opus.md` (Low) |
| C37 | Unreachable `ClientNotFound` and null branches are not labelled as defensive. `lockedState!` uses a null-forgiving operator. | `round-1-sonnet55.md` (Low); `round-5-opus.md` (Nit) |
| C38 | The `IUnapprovalTokenRevocation` registration is repeated in four places. | `round-1-sonnet55.md` (Low) |
| C40 | `VendorModule.DeleteProviderClientAsync` duplicates `ApplicationModule`'s result mapping. | `round-5-opus.md` (Low) |
| C41 | About 3,000 lines of integration fixtures are duplicated across engines. This matches the existing pattern. | `round-5-opus.md` (Low) |
| C43 | Residual stateless window (expiry plus clock skew) is not in the OpenAPI spec. The wording differs between `CS-AUTH.md` and `OWASP-AUTH-COVERAGE.md`. | `round-5-opus.md` (Low); `round-6-haiku55.md` (Low) |
| C44 | `TokenStoreOutcome.LockTimeout` also covers deadlock victims. The name misstates the meaning. | `round-6-haiku55.md` (Low) |
| C45 | PostgreSQL `RevokeTokensForApplicationAsync` uses `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`, while `RevokeTokenAsync` does not. **Not independently verified** by the source. | `round-6-haiku55.md` (Low) |

## Findings: Nit

| ID | Finding | Sources (rating) |
|---|---|---|
| C22 | Sanitization is inconsistent: `SanitizeForLog` is applied to a Guid, and there is a private helper versus a direct call. | `round-5-opus.md` (Nit); `round-6-haiku55.md` (Nit) |
| C32 | The concurrency fixture's 3 s and 4 s observation timeouts are tight against the 5 s lock timeout. | `round-5-opus.md` (Nit) |
| C34 | Un-approval reads `ClientUuid` before taking the `ApiClient` lock. No current defect. | `round-5-opus.md` (Nit) |
| C39 | Synchronous `Commit`/`Rollback` in async methods. Success is logged inside the try block after commit. | `round-1-sonnet55.md` (Nit) |
| C46 | The vendor SQL interpolates a fixed `TenantWhereClause` fragment. There is no injection path. **No action.** | `round-6-haiku55.md` (Nit) |
| C47 | The CS-AUTH lifecycle section is dense. Add an operator checklist. | `round-5-opus.md` (Nit) |

## Conflicts that need a decision

- **C2, vendor-delete scope:** Medium in round 1 and round 5, High in round 6. Heading tier is High (highest reported).
- **C6, PostgreSQL deadlock response:** Medium in round 1 and round 6, Low in round 3 and round 5. Heading tier is Medium.
- **C18, repeat un-approval 500:** Round 1 calls it intentional. Round 5 calls it a regression. Both are rated Low. This needs a product decision, not a severity call.
- **C8, MSSQL deadlock test:** High in round 6 only, with no other source. The other sources do not review this test.
- **C19, Retry-After on 409:** Round 5 rates it Nit; rounds 1 and 6 rate it Low.

## Coverage notes

- The round 6 security specialist did not review the MSSQL token store or the `UpdateApiClient` wiring. Findings for those areas may be missing.
- Rounds 2 and 3 have no runtime results because `dotnet` was unavailable.
- Round 1 used `claude-sonnet-5.5`, not one of the later models. The model choices across rounds differ, so ratings are not directly comparable.
