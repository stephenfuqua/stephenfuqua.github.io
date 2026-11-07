---
title: GitHub Copilot Coding Agent vs. Claude Code on the Web, Round 1
date: 2026-09-13
tags:
- programming
- technology
---

## A Mistake

Being on a $20 plan, typically I use Sonnet 5 for implementation in Claude Code - but accidentally left it on Opus 5 in this situation, whereas GitHub Copilot was running Sonnet 5. As a head-to-head comparison, this is not entirely fair.

## Reviewer's Comparison

In GitHub Copilot with GPT-5.6, I directed the system to build a plan for comparing the two pull requests and making a recommendation on which to move forward with. The plan-for-comparison was sound, and it produced the following analysis:

> | Category | #1232 | #1236 |
> | -- | -- | -- |
> | Correctness | 2/5 | 5/5 |
> | Tests | 3/5 | 5/5 |
> | Architectural fit | 4/5 | 3/5 |
> | Scope/reviewability | 1/5 | 2/5 |
> | Regression risk | 2/5 | 4/5 |
> | Merge readiness | 2/5 | 3/5 |
>
> Both PRs implement the same correlation-ID normalization feature; #1236 (2553 additions vs 1218) is bigger but closes real correctness gaps #1232 leaves open:
>
> - Empty-after-normalization fallback: #1236 normalizes before choosing the client header, so an all-control-char header correctly falls back to the server trace ID. #1232 doesn't — a client can still blank the identifier.
> - Surrogate-pair-safe truncation: #1236's `CorrelationIdNormalizer` backs the cut off a split UTF-16 surrogate pair; #1232 does a raw slice that can corrupt output.
> - 502 OAuth parity: #1236 fixes a log/body mismatch in `OAuthManager.cs` (logs struct vs. value) that #1232 still has.
> - Test breadth: #1236's parity tests cover 401/403/404/429 plus hostile-vs-clean-status parity; #1232 covers only 401/404/429.
>
> PR # 1232 wins on architecture (shared `Sanitize()` helper vs. #1236's duplicated two-pass logic + a somewhat redundant new `CorrelationIdNormalizer` class), and its self-review notes (`tasks/review-round-5.md`) are more damning — it admits convergence was declared prematurely.
>
> Blocker for both: neither PR should merge with the `tasks/review-round-*.md` self-review artifacts committed to the repo — those should be stripped before merge.
>
> Carryover from #1232 into #1236: refactor its `LogSanitizer` to share the single-pass helper pattern; consider porting the  `Given_CorrelationIdNormalization_Parity.cs` integration fixture as an extra guardrail.
