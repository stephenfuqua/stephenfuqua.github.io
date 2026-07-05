---
title: Performance Tuning with Opus
tags:
  - AI
  - ed-fi
  - technology
  - testing
---

Outline:

- prompt-as-problem statement
- analysis:
  - review and annotate output with a clear context (pure source code)
  - review again, comparing to design documents
  - highest priority item - describe it. the architecture is described, but not the rationale (which is unusual in this code base)
  - have claude code generate proposed solutions
  - turn the proposed solutions and analysis thus far into a draft ADR
  - dig in, over the course of several days, by poking holes
    - try to infer the intention behind the code
    - talk to the development manager / SME about requirements
    - review legacy behavior
    - personally read the specs for etag and "discuss" with Claude Code to confirm and refine the proposal in the ADR
    - get buy in from key engineer
- work on it: have superpowers turn the ADR into a detailed implementation plan, which it created with 7 concrete tasks
  - did not think to time the effort - but it stretched many hours over the course of three days, minimum 12 hours of development
  - never hit usage limits on basic plan, probably helped by the work on different days
  - one instruction I had to add: only run new or modified integration tests, not the full suite. Full suite takes too long.
  - forgot to instruct for a subagent approach, and surprised that Claude Code didn't do so automatically; at one point I was worried about context having reached over 50%. I told it to pause execution, then write a checkpoint file that could be used to restart the process. Also shut down for the night. Started back up nicely.
  - I must have told it to start back with a subagent approach. All remaining tasks were auto-assigned to sub-agents, and I noticed that the sub-agent would often be in Sonnet instead of Opus (main agent). This was useful and surely helped me avoid the token limit.
  - Should also note that I set the main thread to high effort and large 1m context
- initial Copilot code review:
  - 1 medium, 2 low findings: fixed them
  - initial run had build failures - some caused by dependency vulnerability that had been fixed in `main`, but I forgot to rebase. Interestingly, some integration tests failed that presumably ran locally with success. First things I reviewed appeared to be due to a double-quoting problem in the etag generation - which was in fact Copilot review's medium finding.
- Should include some metrics
  - data load time
  - number unit tests
  - number integration tests

---

One of the development teams at work is in the final stages of preparing a major
software release for July. As former architect for the project, now department
director, I wanted to "poke" at the solution - both to offer a positive
contribution, and to feel more personally confident. So I started up a coding
session to analyze the performance of the application:

> You are an expert in analyzing performance bottlenecks in C# and SQL code.
> Deeply review this application to identify and prioritize likely
> bottlenecks for throughput when the API is receiving a large number of POST
> requests at the same time — for example, when an API client application is
> performing a full synchronization by sending over tens of thousands of
> requests to the Students and StudentSchoolAssociation endpoints.

(Tool usage: started in GitHub Copilot CLI with Claude Opus 4, high effort, and
1m context. Was using up AI credits in June. Later switched to Claude Code CLI
with Opus 4; it was more or less an arbitrary decision, as I have been bouncing
back and forth between the two tools lately).

TL;DR:

- 17 items identified, 8 auto-prioritized.
- I dug into the highest priority with continued conversation with Opus to validate the finding, develop a
proposed solution, and then execute on it.
- End result: ___.
- Now need to look into the other issues, or pass them on to the dev team to do so.
- Verdict: Using Copilot / Claude Code with Opus was a clear win and contributed
  meaningfully to polishing a high quality release.

NOTE: look for updates to agents/claude - namely run integration tests and starting up containers

<!-- truncate -->
