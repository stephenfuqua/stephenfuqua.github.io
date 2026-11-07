# Review Prompt

The user explicitly invoked `/team-pr-review` with these arguments:

> PR 1420 checked out at commit `01222687f0acc7be5bff159867aae1b956d4208a`. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./round-24-astra6-medium.md. Do not post to GitHub.

Review instructions: launch five specialist reviewers in parallel (Security,
Functionality, Maintainability, Usability, and Test Coverage). Use the PR description
as the requirements. Review the full diff and surrounding code at the specified
commit. Rate actionable findings Critical, High, Medium, Low, or Nit; cite locations
and suggest concrete fixes. Consolidate duplicate findings with all relevant
reviewer labels, retain empty severity tiers, and include specialist verdicts and
a summary. Keep the report local; do not post or request permission to post.

# PR #1420 Review - [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval

> Requirements: PR description; no Jira or GitHub issue consulted.
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> Target: `01222687f0acc7be5bff159867aae1b956d4208a`
> Base: `7b007ca527ddfd6e9c3c6cd505cc76ffc97130b4`

The review used an isolated worktree at the requested commit, not the original
working tree or the current remote PR head. The live PR description includes
validation claims concerning other revisions; those claims were not treated as
verification of this commit.

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

1. **[Test Coverage] The SQL Server concurrency fixture does not protect the approval-read lock order.**

   Location: `src\config\backend\EdFi.DmsConfigurationService.Backend.Mssql.Tests.Integration\OpenIddictDataRepositoryTests.cs:3799-3824`
   (`Given_A_Grant_Committed_While_The_Un_Approval_Waits`).

   The simulated grant locks `OpenIddictApplication`, waits until un-approval is
   blocked, then inserts a token directly without reading `ApiClient.IsApproved`.
   Production grants read approval while holding that provider lock. Moving the
   update's `ApiClient` XLOCK ahead of the revocation participant would therefore
   leave this fixture passing while introducing a grant/update deadlock cycle.
   The current production ordering is correct; this is a regression-coverage gap,
   not a demonstrated production failure.

   Supporting locations:
   `src\config\backend\EdFi.DmsConfigurationService.Backend.Mssql\Repositories\ApiClientRepository.cs:572-591`
   and
   `src\config\backend\EdFi.DmsConfigurationService.Backend.Mssql\OpenIddict\Repositories\OpenIddictDataRepository.cs:587-608`.
   The reverse-interleaving fixture starts its grant after the provider lock is
   held, so it does not protect this ordering either.

   **Fix:** After deterministically observing the blocked update, make the
   simulated grant read approval through its lock-holding transaction before
   inserting the token. Assert successful completion so moving the XLOCK ahead
   of the participant causes the regression test to fail. Do not coordinate
   using arbitrary delays.

## 🔵 Low

1. **[Maintainability, Usability] A partial vendor deletion is logged as no deletion.**

   Location: `src\config\frontend\EdFi.DmsConfigurationService.Frontend.AspNetCore\Modules\VendorModule.cs:962-967`.

   The warning says "nothing was deleted" when a newly added client prevents the
   final vendor cascade. However, the preceding loop has already deleted the
   original provider clients; in self-contained mode their token revocations
   have also committed. An administrator investigating clients that stopped
   authenticating receives a misleading description of the partial outcome.

   **Fix:** State that the CMS vendor/application/client rows were retained but
   provider-client cleanup may already have completed, and advise retrying.

## ⚪ Nit

None found.

## Security Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| - | - | - | - | No vulnerabilities found | - |

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | No introduced vulnerabilities found in the reviewed changes. |
| Functionality | COMPLETE - no actionable correctness defect found in lifecycle atomicity, grant revalidation, lock ordering, or provider behavior. |
| Maintainability | Clear transaction boundaries and justified abstractions; one minor diagnostic correction. |
| Usability | No blocker; the partial-deletion warning should accurately describe completed provider cleanup. |
| Test Coverage | ADEQUATE - extensive cross-engine lifecycle, rollback, and E2E coverage; one important lock-order regression remains unprotected. |

## Verification

All five specialist reviews completed. Focused tests were run against the exact
target in the isolated worktree:

| Suite | Selection | Passed | Failed | Skipped |
|-------|-----------|--------|--------|---------|
| Backend unit | `OpenIddictClientRepositoryTests`, `OpenIddictUnapprovalTokenRevocationTests`, `OpenIddictTokenManagerTests`, `OpenIddictServiceCollectionExtensionsTests`, `KeycloakServiceExtensionsTests` | 726 | 0 | 0 |
| Frontend unit | `TokenRevocationStartupTests`, `ApiClientModuleTests`, `VendorModuleTests` | 910 | 0 | 0 |

Database integration and Docker E2E suites were reviewed statically, not executed.
The lock-order finding is supported by static mutation reasoning, not an executed
mutation test. No production code was changed.

## Summary

No merge-blocking findings were identified at the requested commit. Add the
SQL Server approval-read regression check and correct the misleading
partial-deletion warning; the implementation otherwise has coherent transactional
boundaries and substantial lifecycle coverage. This report remains local and was
not posted to GitHub.

## Usage

AI Credits 2532.66 (19m 37s)
Tokens     ↑ 12.6m (11.8m cached, 845.0k written) • ↓ 60.0k (11.9k reasoning)
  GitHub Copilot • GPT-6 Astra ↑ 12.6m (11.8m cached, 845.0k written) • ↓ 60.0k (11.9k reasoning) •
2532.66 AIC

Note: this was _outside_ the sandbox. Medium effort.

Extra skills:

- skill(code-review-and-quality)
