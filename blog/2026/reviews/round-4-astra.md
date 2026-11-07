# Review Prompt

Skill: `/team-pr-review`

> PR 1420. The PR description describes the task; no need to read Jira or a GitHub Issue. Save this prompt and your final review as ./round-10-astra.md. Do not post to GitHub.

The requested review uses five parallel specialists: Security, Functionality,
Maintainability, Usability, and Test Coverage. Findings use the skill's
Critical / High / Medium / Low / Nit rubric, include concrete fixes, and are
consolidated by severity with a verdict from each specialist.

---

# PR #1420 Review — [DMS-1493] Revoke self-contained tokens on credential reset, client deletion and un-approval

> Requirements: PR description, as requested; no Jira or GitHub issue consulted.
> Reviewed by: Security · Functionality · Maintainability · Usability · Test Coverage
> Reviewed head: `01222687f0acc7be5bff159867aae1b956d4208a`
> Base: `7b007ca527ddfd6e9c3c6cd505cc76ffc97130b4`
> Method: Five parallel specialists, with the full diff and an isolated checkout.

---

## 🔴 Critical

None found.

## 🟠 High

None found.

## 🟡 Medium

None found.

## 🔵 Low

1. **[Maintainability, Usability] Misleading warning after partially completed vendor deletion**

   Location: `src/config/frontend/EdFi.DmsConfigurationService.Frontend.AspNetCore/Modules/VendorModule.cs:962–967`

   When concurrent client creation causes `FailureClientsChanged`, the warning
   says “nothing was deleted.” The preceding loop has already committed
   provider-client deletions and, in self-contained mode, their token revocations.
   Only the CMS cascade is rolled back. Operators investigating authentication
   failures after the unsuccessful vendor deletion therefore receive an
   incorrect account of what survived. The concurrent-client fixture exercises
   this partial-completion path.

   **Fix:** Say that CMS rows were retained, previously processed provider
   clients remain deleted, and the operation must be retried to complete
   cleanup. Correct the matching method comment as well.

   **Confidence:** 10/10.

## ⚪ Nit

None found.

---

## Specialist Verdicts

| Reviewer | Verdict |
| ---------- | --------- |
| Security | No demonstrated security blocker. Lifecycle locking, credential revalidation, transactional revocation, and CMS token-status checks strengthen revocation guarantees. |
| Functionality | COMPLETE — inspected paths implement atomic reset/delete/unapproval revocation and revoke-or-refuse behavior for racing grants, with rollback and retry handling. |
| Maintainability | Coherent transaction boundaries and ordering tests; correct the misleading partial-deletion diagnostic. |
| Usability | No blocking issue found. Recovery documentation and OAuth handling are clear apart from the partial-deletion warning. |
| Test Coverage | STRONG — mirrored engine coverage includes rollback, orphan convergence, re-approval, ordinal credential comparison, disabled limits, bystander preservation, deterministic lock-wait fixtures, and provider registration. |

## Review Limitations

This was a static review with test inspection. Local .NET execution was not
possible because `dotnet` is unavailable. GitHub reported all completed,
non-skipped checks passing, including the Config CI gate, unit and integration
tests, and self-contained/Keycloak E2E lanes on both engines; those results were
not reproduced locally. The PR diff passed `git diff --check`.

The documented stateless DMS acceptance window is intentional and is not
reported as a defect. No application code was changed and nothing was posted
to GitHub.

## Summary

No merge-blocking findings were identified. Correct the low-severity vendor
deletion warning so operators can distinguish retained CMS rows from already
deleted provider clients. The implementation has strong transactional and
concurrency regression coverage across both database engines.

## Usage

AI Credits: 1126.19

Tokens:     ↑ 5.4m (5.0m cached, 397.9k written) • ↓ 24.8k (3.2k reasoning)
  GitHub Copilot • GPT-6 Astra ↑ 5.4m (5.0m cached, 397.9k written) • ↓ 24.8k (3.2k reasoning)

Extra skills used:

- skill(code-review-and-quality)
