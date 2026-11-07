# Review prompt

The user explicitly invoked the `/team-pr-review` skill.

> PR 1420. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./round-23-astra6-high.md. Do not post to GitHub.

## Requested review workflow

Five specialists review the pull request in parallel: Security, Functionality,
Maintainability, Usability, and Test Coverage. Each receives the complete PR diff,
changed-file list, PR description as the requirements, and an isolated checkout.
Findings are consolidated by severity, with duplicate findings reported once and
credited to the relevant reviewers. Every finding must include a concrete fix.

| Severity | Meaning |
| ---------- | --------- |
| Critical | Blocks merge; immediate fix required. |
| High | Significant problem; should fix before merge. |
| Medium | Real issue, but not merge-blocking if tracked. |
| Low | Minor issue; fix if cheap, otherwise defer. |
| Nit | Inconsequential; the author may ignore it. |

The final report must retain all five severity tiers, including empty tiers,
provide a verdict from each specialist, and summarize the important findings.
The user's explicit instructions override the skill's default issue lookup and
offer to post: use the PR description and keep the report local.

# PR #1420 Review - [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval

> Requirements: PR description; no Jira or GitHub issue consulted.
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> Reviewed head: `eb1774b399e7c51ba19c3665bc616072aff3244e`
> Review date: 2026-11-07. The PR was already merged on 2026-11-03.
> Scope: complete final diff and isolated head checkout, including the later vendor-deletion changes.

---

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

### 1. [Test Coverage] Cover replacement of a vendor client's UUID without changing its row ID

**Locations:**

- [`src/config/backend/EdFi.DmsConfigurationService.Backend.Postgresql.Tests.Integration/VendorTests.cs:1025-1047`](https://github.com/Ed-Fi-Alliance-OSS/Data-Management-Service/blob/eb1774b399e7c51ba19c3665bc616072aff3244e/src/config/backend/EdFi.DmsConfigurationService.Backend.Postgresql.Tests.Integration/VendorTests.cs#L1025-L1047)
- [`src/config/backend/EdFi.DmsConfigurationService.Backend.Mssql.Tests.Integration/VendorTests.cs:1016-1038`](https://github.com/Ed-Fi-Alliance-OSS/Data-Management-Service/blob/eb1774b399e7c51ba19c3665bc616072aff3244e/src/config/backend/EdFi.DmsConfigurationService.Backend.Mssql.Tests.Integration/VendorTests.cs#L1016-L1038)

**Detail:** The new guarded vendor cascade correctly compares both `Id` and
`ClientUuid` against the provider clients already cleaned up. Both engines test
newly inserted clients, but neither tests replacing the UUID of an existing
client after the cleanup snapshot while preserving its row ID. An accidental
change to compare only IDs would therefore leave those tests green while
allowing the CMS cascade to discard the retry work-list row for a replacement
provider client that was never cleaned up.

UUID replacement is supported repository behavior: PostgreSQL
`ApiClientTests.cs:1695-1727` tests such an update. The guards being protected are
PostgreSQL `Repositories/VendorRepository.cs:453-472` and SQL Server
`Repositories/VendorRepository.cs:465-486`, within their respective backend
projects. This is a regression-coverage gap, **not a defect in the current guard**.

**Fix:** Add one deterministic fixture per engine: capture `(Id, oldUuid)`,
update that same row to `newUuid`, and call guarded `DeleteVendor` with the old
snapshot. Assert `FailureClientsChanged`, preservation of the vendor, and
preservation of the client with `newUuid`. Retry with the refreshed pair and
assert success. The refusal assertion must fail if UUID comparison is removed;
no timing delay is needed.

**Confidence:** 9/10. Static test/implementation inspection; the proposed
mutation was not executed. Nonblocking.

## 🔵 Low

None found.

## ⚪ Nit

None found.

---

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | No supported new vulnerability or security blocker found; transactional revocation, stale-grant refusal, CMS token-status enforcement, and vendor cascade safeguards are supported by static inspection. |
| Functionality | **COMPLETE** - The described self-contained lifecycle guarantees are implemented, including disabled/exempt token-limit paths, rollback, orphan convergence, and both engines' store-lock outcomes. No confirmed introduced correctness defect found. |
| Maintainability | Acceptable within established patterns; transaction ownership, provider boundaries, and partial-operation recovery are explicit, with no substantiated new maintenance defect. |
| Usability | No confirmed new usability defect; lifecycle error handling and recovery guidance are coherent. The five-second store-lock timeout is not an end-to-end HTTP deadline. |
| Test Coverage | **STRONG** - Substantive real-engine concurrency, rollback, lifecycle, registration, and HTTP coverage, with the single vendor-identity regression gap above. |

## Scope and evidence

All five specialists completed their reviews. Duplicate or unsupported concerns
were excluded. In particular, a proposed SQL Server grant-latency finding was
withdrawn after checking the actual timeout contract and pre-existing locking
behavior; it did not establish a new contract violation.

The final diff includes vendor deletion and a sixth lifecycle E2E scenario beyond
the older PR description. Its blanket statement that Keycloak mode is unchanged
should be read narrowly: token-revocation semantics remain unchanged, but vendor
deletion now cleans up Keycloak clients and depends on provider availability.
The final authentication documentation explicitly acknowledges that behavior;
it was not treated as an accidental correctness regression.

The accepted DMS stateless token-lifetime window, pre-deployment orphan
limitations, and documented partial multi-client cleanup are not findings.

## Verification and limitations

The archived GitHub diff was verified against the exact isolated head checkout
with `git apply --reverse --check`. No product source changes were made.

[Config CI run 41559315790](https://github.com/Ed-Fi-Alliance-OSS/Data-Management-Service/actions/runs/41559315790)
reports success for this exact head. Its unit, integration, and self-contained
and Keycloak E2E jobs report success. These are inspected CI results, not tests
independently reproduced during this review.

A targeted backend unit run was attempted using the available .NET 10 SDK Docker
image because the host has no `dotnet` executable. It stopped during NuGet restore
with `NU1301`: the container could not resolve `api.nuget.org`, and a separate
host feed probe returned HTTP 403. No local tests executed, and no live database
concurrency reproduction or mutation test was completed. Findings and verdicts
therefore rest on source analysis plus the separately verified CI evidence.

## Summary

No Critical or High findings were identified; the implementation substantially
strengthens lifecycle revocation and protects the important concurrency paths.
The one Medium finding is a narrowly scoped regression-test gap for replacing
a vendor client's provider UUID without changing its CMS row ID, suitable for
a follow-up to this already-merged PR.

This report is local only. Nothing was posted to GitHub.

## Usage

AI Credits 2240.67 (19m 24s)
Tokens     ↑ 10.8m (10.0m cached, 732.4k written) • ↓ 64.5k (18.6k reasoning)
  GitHub Copilot • GPT-6 Astra ↑ 10.8m (10.0m cached, 732.4k written) • ↓ 64.5k (18.6k reasoning) •
2240.67 AIC

Extra skills:

- skill(using-agent-skills)
- skill(code-review-and-quality)
- skill(graphify)
