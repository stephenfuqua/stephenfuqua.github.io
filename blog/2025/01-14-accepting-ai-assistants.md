---
title: Grudgingly Accepting AI Coding Assistants
date: 2025-01-14
tags:
- programming
- tech
---

As a software engineering director building open source products, I have
prohibited my teams from using AI coding assistants due to concerns about
intellectual property and questions about the risks and real world effectiveness
of AI coding assistants. It is now time to allow and even encourage AI coding
assistants, with guardrails.

<div class="image">
![Balcones National Wildlife Refuge, by Stephen A. Fuqua](/img/panoramic_balcones_nwr.webp)

Balcones National Wildlife Refuge, December 2024, by Stephen A. Fuqua
</div>

<!-- truncate -->

## Intellectual Property

My fundamental argument against LLM-based coding assistants was this:

1. These LLMs are trained on open source software.
2. That training and/or the use of code created from that trained model may be a
   violation of their license agreements.
3. My teams build open source software and we do not want our license violated.
4. Golden rule: do unto others as you would have them do unto you.
5. Ergo, do not use coding assistants.

Not surprisingly, many others feel the same, as noted in [_The
Register_](https://www.theregister.com/2023/05/12/github_microsoft_openai_copilot/)
(2023-05-12):

> Software developers have bristled that Codex and Copilot were created from
> their code, and sometimes reproduce it, without explicit permission or concern
> for the terms under which they licensed their work. And some of them have sued
> over it.

But [the developers suing over GitHub Copilot got dealt a major blow in
court](https://www.theverge.com/2024/7/9/24195233/github-ai-copyright-coding-lawsuit-microsoft-openai)
(_The Verge_, 2024-07-09) &mdash; although the open source license violation is
still an open question.

At least two coding assistants, [Tabnine](https://www.tabnine.com/) and [Amazon
Q Developer](https://aws.amazon.com/q/developer/) (fka Code Whisperer), offer up
attributions that you can paste into your open source notifications. GitHub has
also added public code filtering and now [reference
links](https://docs.github.com/en/copilot/using-github-copilot/finding-public-code-that-matches-github-copilot-suggestions)
when public code filtering is off, which may satisfy the attribution /
notification problem. Whether the _training_ is fully legal given the open
source licenses remains as an open risk. However, I do not seriously believe that the
court system will strike down LLMs on the basis of being trained on others'
intellectual property.

With multiple free and low-cost tools available, and no way to police individual
usage, it has long been a moot point. People are probably using these tools
already, unbeknownst to me, even though I've asked them not to. Time for me to
stop fighting this and focus on safe and effective usage.

## Effectiveness

Are these tools effective? There's the marketing, and then there's real world
experience. The articles I've been reading suggest both sides of things: that
the code produced by AI assistants can be garbage, and that it can be helpful.
The code likely will require judicious editing from a trained and talented
engineer. And, that engineer will need to be talented not only in the faculty of
understanding the code, but also in learning how to [provide meaningful
instructions](https://medium.com/@tsecretdeveloper/the-real-reason-we-still-need-software-developers-in-the-world-of-ai-a2dd42afcaeb)
to the AI assistant.

As many other writers have noted, a world of AI coding assistants could lead to a
world where junior developers never learn to code well and thus have trouble
improving the code produced by the assistant. Or have trouble recognizing major
security flaws in the code ([Predictions 2024: Security And Risk Pros Will Apply
Guardrails Beyond Regulatory
Mandates](https://www.forrester.com/blogs/predictions-2024-security-and-risk/)
from Forrester). Even seasoned veterans can easily overlook security problems
if they review too quickly.

Last fall, I installed Amazon Q Developer and asked it to help me write
additional unit tests for a C# class that had been neglected. It helped me
uncover several important edge cases around null handling. I failed to tell it that
I wanted my tests in NUnit and that I prefer use of FluentAssertions; it gave me
XUnit that I then converted to NUnit (admittedly I cannot remember if a
limitation prevented me from tuning my request, or if I was just annoyed and
wanted to limit my interactions).

Overall, I estimate it saved me about 20 minutes time on that task. And it
helped find a low probability bug in the system-under-test that I may have
missed. That was useful.

## Guardrails

We will continue to enforce existing practices:

1. Use of linters (JavaScript, Python, PowerShell) and
   [Roslyn-based](https://learn.microsoft.com/en-us/visualstudio/code-quality/roslyn-analyzers-overview?view=vs-2022)
   code analyzers for C# (tip:
   [Sonarlint](https://www.sonarsource.com/products/sonarlint/) and
   [sonar-dotnet](https://github.com/SonarSource/sonar-dotnet)).
2. Use of static application security tools (e.g. CodeQL) on all contributions
   to our open source code, whether made by staff, contractors, or the public.
3. Mandatory peer review and merge process into the protected `main` branch that
   generates our binary releases.

To complement these, we must encourage and support developers to strengthen
their own habits as well as their abilities to sniff out and question
potentially harmful or simply dodgy code. And we should encourage a community of
practice where developers on different teams freely share about their
experiences.

:::danger

Those who are working with closed source applications will want to read the fine
print to understand the privacy and security implications of your use of an AI
coding assistant. For example, [GitHub
says](https://github.com/features/copilot): "GitHub does not use either Copilot
Business or Enterprise data to train its models.". This seems to imply that it
_does use_ data from Free and Pro.

:::

:::tip

Also see [GitHub Copilot Security and
Privacy Concerns: Understanding the Risks and Best
Practices](https://blog.gitguardian.com/github-copilot-security-and-privacy/)
for more detailed security tips.

:::

## Personal Plans

Two weeks into the new year, I have yet to write a line of code. Unless you
consider Markdown files and Mermaid diagrams "documentation as code". At some
point, once the new year kickoff tasks are complete, I hope to jump into the
fray and complete a few programming tasks. When I do, I plan to continue
evaluating Amazon Q and may try out GitHub Copilot and Tabnine out of
curiosity. (Only tools that support VS Code make it on my evaluation list).

Depending on the task at hand, I would like to experiment with these uses:

1. Generating unit tests. I practice and encourage [Test Driven
   Development](/best-practices-tdd-oo). But not everyone does.
   Low-hanging fruit for me to contribute, without distracting the team: help
   them beef up the code coverage. (Moral Hazard Warning: only cover older code
   or expand existing tests. Don't let this be an excuse for not testing!).
2. Asking the assistant to review my code. [Amazon
   Q](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/start-review.html),
   [GitHub
   Copilot](https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review),
   [Tabnine](https://www.tabnine.com/blog/unveiling-tabnines-code-review-agent/).
3. Generating boilerplate code. Although this is a popular usage, we have
   little boilerplate code left to write. Our applications are at the stage of
   needing real thought and design in order to grow into the next user story.

## Parting Words

To all of the developers I work with: go forth and write quality
code, with or without an AI assistant.
