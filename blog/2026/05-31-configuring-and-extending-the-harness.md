---
title: Configuring and Extending AI Coding Harnesses
---

These notes are roughly adapted from a lunch-and-learn at the office, intended
to socialize terminology and some lessons learned in recent months.

:::warning

This field is moving so fast, that these notes will surely be stale in six
months.

:::

<!-- truncate -->

## Glossary

- **AI Coding Harness**: LLM + specialized instructions, procedures, and
  behaviors. _GitHub Copilot, Claude Code, Cursor, etc._.
- **Instructions**: Standing context &mdash; project overview, conventions,
  rules. _Loaded automatically at session start_.
- **Skills**: Procedural knowledge for specific tasks. _Matched to user requests
  automatically._
- **Hooks**: Unconditional automation at workflow events. _Triggered by the
  harness at defined lifecycle points._
- **Agents**: Autonomous workers. _Explicitly invoked by the user or an
  orchestrating skill_.

## Instructions

### Instruction Files

Instruction files &mdash; "AGENTS.md" and the like - are always loaded at
startup. They should contain instruction that the coding agent won't discover on
its own or that would be expensive to rediscover each time. Keep the file small!
Ideally, each line is based on a real failure that you want to avoid in the
future.

| Harness / File | copilot-instructions.md | CLAUDE.md | AGENTS.md |
| -- | -- | -- | -- |
| GitHub Copilot | X | X | X |
| Claude Code | | X | X |
| Open AI Codex | | | X |
| Gemini | Customizable | Customizable | Customizable |
| Cursor | | | X |

`/init` can create a file for you, but it is verbose; you should refine to
simplify it and add what the agent cannot figure out on its own. Better yet:
write it based on actual experience of missteps taken by the agent(s). When
using multiple tools, you may need different instructions for each tool

:::tip

Update October 2026: Claude Code now reads AGENTS.md!

:::

### Config and Instruction Locations

Each tool has its own customization. GitHub Copilot has the most overlap with
other tools, but even there it has limitations. For example, Copilot reads a
root CLAUDE.md file, but not one in a sub-directory &mdash; but it _will_ read
AGENTS.md in a sub-directory.

```plaintext
├─ ~/.claude/                 # Copilot does not read, use ~/.copilot
| ├── <same as below>
└── <your-repo>/
  ├── .claude/
  │ ├── agents/               # Copilot reads
  │ ├── rules/                # Copilot reads
  │ │ ├── coding-style.md
  │ │ ├── testing.md
  │ │ └── ...
  │ ├── skills/               # Copilot reads
  │ ├── CLAUDE.md             # Copilot reads
  │ ├── settings.json         # No copilot
  │ └── settings.local.json   # No copilot; gitignore it
  ├── src/
  │ ├── AGENTS.md             # Copilot will load this
  │ ├── CLAUDE.md             # Copilot ignores
  │ ├── CLAUDE.local.md       # No copilot; gitignore it
  │ └── .claude/              # No copilot
  │ └── <etc>
  ├── CLAUDE.md               # Copilot reads
  └── CLAUDE.local.md         # Copilot reads; gitignore it
```

### Example: Adding a License Header

At work we have VS Code instructions that automatically add a license header on
new files, but the coding harnesses ignore that.

~~~plaintext
When creating a new JavaScript file, always start with the following license header, or equivalent if the file is YAML or Dockerfile.

```javascript
// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.
```
~~~

In retrospect, the `javascript` language marker is a waste of a few tokens.

:::warning

That license header seemed valuable when we first went open source. But now
every single file has about 59 tokens of boilerplate before getting to the real
file text. Small change, but every bit counts? May need to rethink this.

:::

### Example: The Agent Would Never Guess This

This comes from a TypeScript project. The agent is safe to run `eslint` and
`jest` without wasting time on expensive transpilation.

```plaintext
NEVER run npm run build, it transpiles which is only needed for package publishing.
```

### Example: An Early Effort

With continued advancement of the tools, these instructions are probably not
necessary any more. Except perhaps the `.editorconfig` setting.

```plaintext
## General

* Make only high confidence suggestions when reviewing code changes.
* Never change pyproject.toml or poetry.lock files unless explicitly asked to.

## Formatting

* Apply code-formatting style defined in `.editorconfig`.
* Do not change the formatting of code unless explicitly asked to.
```

### Denying Access to .env Files

It is a good idea to keep your coding agent away from sensitive data.

And this can be very hard to do.

Adding an instruction to "NEVER READ .env" is insufficient; remember, the agents
follows these instructions probabilistically. Furthermore, merely denying access
to read the file does not mean the agent won't act on your behalf: it could run
the code that uses the .env file, which might not be what you want.

Instead of denying read access this way, try using available settings and hooks,
or run your agent in a worktree that does not have your environment
configuration file(s).

### Next Steps for Instructions

Standardize and continue learning.

Encourage dev teams to standardize their practices and share with each other.
Continue reading best practice guidance from your products' documentation.
Experiment by simplifying and running A/B comparisons, if you have the tokens to
spare for such.

## Agent Skills

:::tip

When building an agent skill, ask your agent to help you. It probably has a
built-in skill for building skills!

:::

### Frontmatter

Each skill declares itself via a YAML frontmatter block at the top of its
`SKILL.md`. Example, with added comments

```plaintext
---
name: jira                     # Unique identifier
description: >                 # Natural-language trigger — the AI reads this
  Use when working with Jira via the acli jira CLI — viewing, creating,
  editing, transitioning, searching, and commenting on issues. Triggers on tasks
  like "create a Jira issue", "transition ticket to In Progress", "search Jira
  for open bugs", "add a comment to PROJ-123".
allowed-tools:                 # Optional: restrict which tools the skill may use
  - Bash(acli jira *)
---

<body of the skill>

```

The `allowed-tools` above works in Claude Code, not in GitHub Copilot. The
latter does support the `allowed-tools` key, but the command list is very
different.

Note that the description always loads into context on every session. Therefore
it is important to keep the description short but sufficient to the task. And it
needs clear trigger keywords.

:::tip

This and other custom skills developed by my team is available in
[AI-Tools-for-Ed-Fi-SDLC](https://github.com/Ed-Fi-Alliance-OSS/AI-Tools-for-Ed-Fi-SDLC)

:::

### Sample Prompt Invoking the Jira Skill

```plaintext
Review https://github.com/Ed-Fi-Alliance-OSS/ed-fi-alliance-oss.github.io/security/dependabot/96 then create a Jira issue for it in the DOCS project
```

### Superpowers

> “An agentic skills framework & software development methodology that works.”

[obra/superpowers](https://github.com/obra/superpowers) is a collection of
skills that aid in planning and executing development tasks. They work with most
coding harnesses.

- **Philosophy**: test-driven, systematic, aims for simplicity, verification of
output
- **Skills**: brainstorming, writing-plans, executing-plans, writing-skills, and
much more

Also, I’m eager to compare Addy Osmani’s newer
[agent-skills](https://github.com/addyosmani/agent-skills).

### Thoughts on Unit Tests

Superpowers follows a test-driven approach &mdash; even when using it to write
new skills! it has an "Iron Law": `NO PRODUCTION CODE WITHOUT A FAILING TEST
FIRST`. I like this philosophy. Although I admit that I go back and forth in
using true test-driven development, because sometimes I need to explore what I
am trying to achieve before I know how to write a test for it.

In my experience, this iron law means that Superpowers appears to consume more
tokens. In theory, it also means it will do a better job of getting to done.

### Next Steps for Agent Skills

Same word: standardize. Build some re-usable skills, and/or install some
third-party skills. If using online agents, add the skills directly to the
repository. This also makes them available to everyone else using the
repository, so you may want to discuss as a team before committing.

What about standardization across teams? I recommend socializing the practices,
but avoiding mandate which skills to adopt until they have proven absolute value
over other options.

## Hooks

Hooks are defined in a settings file, which means they are unique to the coding
agent. These hooks define _deterministic actions_ that will take place at
certain times in the lifecycle of work.

### Example: Markdown Linting

This example is from Claude Code. It runs a `markdownlint-cli2` and `prettier`
both on writing (new) or editing (existing) file. Assumes that these tools, and
`jq`, are available on the path.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path // empty' | { read -r f || exit 0; case \"$f\" in *.md) npx markdownlint-cli2 --fix \"$f\" 2>/dev/null || true ;; *.mdx) npx prettier --write \"$f\" 2>/dev/null || true ;; esac; }",
            "timeout": 30,
            "statusMessage": "Linting markdown..."
          }
        ]
      }
    ]
  }
}
```

### GitHub Copilot Version

Copilot docs say that Claude Code hooks will work, but GitHub Copilot CLI tells
me that it needs a different format. Interestingly, the hook works in the VS
Code extension for GitHub Copilot.

At this time, I have not been successful adapting the hook above to work in
GitHub Copilot CLI, and I did not test in Cloud Agent.

### Next Steps for Hooks

This is still quite the new area for me. The linter idea is useful in many
languages. One could add test execution, but in practice the coding agents are
already pretty good at running appropriate tests.

Dev teams should look at their workflows and brainstorm appropriate hooks for
their repositories.

## Custom Agents

An agent is similar to a skill &mdash; and in fact can use skills. A custom
subagent is useful when you need to run the same task frequently; it runs in
its own context with its own allowed tooling.

I am even newer to agents (or subagents?) than hooks. The syntax is not as
standardized across tools as Agent Skills, which is frustrating.

Below is a first attempt at a subagent for Claude Code; I do not think it is a
_good_ agent. This is better as a Skill. But it was a useful trial run for
learning the syntax.

```plaintext
---
name: update-dependencies
description: >
  Autonomously update package dependencies in .NET, Python, or JavaScript
  projects. Requires a mode: --security-only, --minor, or --all.
permissionMode: bypassPermissions   # Agent acts without per-action approval
tools:                              # Explicit allowlist of permitted tools
  - Bash(npm *)
  - Bash(dotnet *)
  - Bash(git *)
  - Bash(gh *)
  - Read
  - Write
  - Edit
skills:
  - update-dependencies             # Skills to load into the agent''s context
---

<agent body – similar to a skill>
```

GitHub Copilot has a different tools list. Being able to assign a GitHub Issue
directly to a subagent seems appealing. I should try that one of these days.

```plaintext
---
name: update-dependencies
description: >
  Autonomously update package dependencies in .NET, Python, or JavaScript
  projects. Requires a mode: --security-only, --minor, or --all.
tools: ["execute", "read", "edit", "search"]
---

<agent body – almost identical to Claude Code version>
```

The real value here might be when running on the cloud and auto-assigning work.
For example, one could setup a trigger process to look for new GitHub Issues and
assign them to a "Triage Agent." If the agent determines that the issue (a) is
a bug and (b) is legitimate, it could then call the "Bugfix Agent."
