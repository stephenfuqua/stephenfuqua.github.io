---
title: From Ad-Hoc Prompts to a Repeatable Agentic PR Review Workflow
date: 2026-08-13
tags:
- programming
- technology
---

From time to time I pop in to peek at one of the dozens of pull requests that come through my mailbox daily, furthering the work of the Ed-Fi Alliance to help connect student data. What feature, improvement, or bug fix are the teams working on? How has this engineer approached a given problem, what tests have they written, what documentation have they provided, are the I/O seams sufficiently fault tolerant? Did they run the GitHub Copilot Code Review Agent, and fix the issues detected there?

:::tip

**TL;DR** Created a team of specialist reviewers [skill](https://github.com/Ed-Fi-Alliance-OSS/AI-Tools-for-Ed-Fi-SDLC/blob/main/skills/team-pr-review/SKILL.md) and use it on anything non-trivial. After its analysis, it offers to post a nicely-formatted review comment on the PR. I then go back and edit that review comments, to avoid slop and/or excessive cognitive load.

:::

<!-- truncate -->

As a product manager &mdash; barely a part-time engineer &mdash; there is little time for this. And there is a lot to review, given that agentic coding work shifts the bottleneck from coding to review and test. So here too I have tried to use my coding harnesses well.

The Copilot code review helps, but it is insufficient. I see it as a minimum bar: once that review has been cleared, the pull request (PR) is ready for another look. I scan with my own eyes, sampling bits of code to see the null and exception handling, log messages (and levels), and database connectivity. Only then (ideally) do I ask my coding harness (Claude Code, GitHub Copilot, etc.) to review the PR.

It started simply: switch to the repo's local directory, open coding harness, and prompt "review PR 123 and post your comments back to the PR." So far so good. Run it again: different results each time. OK, how can I be a bit more thorough? Specialization and subagents: "review PR 123 with parallel agents covering security, coding quality, and maintainability. Summarize the subagents and report results back to me."

After a few times of this, it had grown to five agents: security, functionality (with a Jira ticket to read), maintainability, usability, and test coverage. Five &mdash; if I remembered to use all of them. And how do we remember to use the same instructions? **[A skill](https://agentskills.io/home)!** So I turned to the [Superpowers](https://github.com/obra/superpowers) skill-building skill to capture more detailed notes on my Team of Specialists, creating: [team-pr-review](https://github.com/Ed-Fi-Alliance-OSS/AI-Tools-for-Ed-Fi-SDLC/blob/main/skills/team-pr-review/SKILL.md).

```yml
---
description: Launches a fleet of five specialist subagents to deeply review a pull request across security, functionality, maintainability, usability, and test coverage. Provide the PR number and related Issue number to get a severity-ranked summary of all findings.
name: team-pr-review
---
```

The harness and I had a conversation to fill in additional repeatable detail. It came up with a summary format to my liking. We added yet more detail on each specialist. I refined it a few times, most notably telling it to post the comment using a markdown file (`gh pr comment -F <file>`) instead of posting the comment inline (`gh pr comment -b "<comment>"`) &mdash; this resolved an issue where the harness kept escaping the backtick character incorrectly, leading to slightly malformed comments.

And this is working well. But it risks throwing slop back at the programmer.

There are typically 10+ review comments, especially on AI-produced commits that were very good, but not quite perfect. Occasionally I disagree with the severity or even the finding. So I began editing the review, _after_ posting it. I don't want to waste tokens on the edits, so I do this by hand. I move items around in severity assessment, delete them or offer additional commentary, and now completely remove the "nits" section or bump those items up to low severity if I want to see them be resolved. And I add a note at the top mentioning that I have reviewed and edited the agent's review, so that the reader will know that I am not (one hopes!) forcing them to spend time analyzing something that I was unwilling to analyze myself.

And if I'm really smart, I might ask the coding harness to look at the PR for updates to make to `AGENTS.md`. But be careful with that: you don't want to overwhelm that file.

:::tip

Wait until you have performed several detailed reviews this way. Then start a coding session with something like this prompt:

> Review the past 5 pull requests and look for patterns in the review comments.
>
> When you find a repeated pattern, draft a proposed update to `AGENTS.md`. Do not immediately edit the file; present the recommendation to me with an offer to edit the file.

:::

---

_AI usage disclosure: GitHub Copilot improved the title and provided a few editorial tips on writing clarity and grammar. In other words, the text is all mine._
