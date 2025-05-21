---
layout: page
title: Initial Experiments with GitHub Copilot in Agent Mode
date: 2025-05-20
comments: true
tags:
- programming
- architecture
- dotnet
sharing: true
excerpt_separator: <!--more-->
---

GitHub CoPilot recently (last week?) brought Agent mode as a full feature
(WHEN?). Reading the blogosphere, I see that plenty of people still think that
other coding assistants are better. But this is the one I have, and I know
Microsoft is innovating rapidly - seeing that first hand at Microsoft Build even
as I type this. So in recent days I've performed three initial experiments that
I want to share. Not because I'm doing anything brilliant: just trying to find
tasks that might be a good fit, learn how to interact with the tool, and share a
bit to help others in my proximity.

Lesson: be patient. Not just waiting for it to finish (might take several
minutes), but also in getting the right results. I remarked on a failure (below)
to my colleague Jason Hoekstra; he suggested that I simply undo and try again.
It was the right advice.

Below I describe three experiments and outcomes.

<!--more-->

## Converting JSON to YAML

I had a giant Open API Specification file in JSON. Originally close to 4 MB. I
wrote some regular expressions to remove all unnecessary spaces; this brought it
down to 2.8 MB. Good savings. I probably shrank it faster than CoPilot.

But then I wondered, what would this be like in YAML? Some spaces would come
back, but some quotation marks might be removed. Prompt, in Agent mode:

> Convert this JSON file to YAML

Result: it tried to run a PowerShell command. It failed, saying that
`ConvertTo-Yaml` doesn't exist. I suspected that I needed to install from the
PowerShell Gallery. Tried that - manually; I didn't yet have the presence of
mind to ask CoPilot to fix it for me. I found it in the Gallery, installed,
re-ran the command, and it worked.

New file size: something like 3.1 MB. Much smaller than original JSON, but
larger than my "compressed" file.

Verdict: it found a simple set of commands to run in PowerShell. I gave no
instructions on how to solve this. Pretty cool that it picked PowerShell on its
own.

## Replace log4net with Serilog

Several years ago I decided that I like Serilog better than log4net as a .NET
logging framework. I liked ths structured logging. Our Admin API application has
log4net, and I've been wanting to see it upgraded. But this bit of tech debt was
a low priority for the development team.

This morning...💡see what GitHub CoPilot can do in Agent mode:

> Please convert this application from using log4net to using serilog.

Couple of minutes later... success... of a sort. Reviewing the changes, I see
that it removed all calls to the logger!

The chat window shows me the steps it took. I see that the first step was to
remove log4net. It seems to have been overzealous about that removal. Probably
removed those lines because the logger was missing, the code couldn't build, and
it automatically adjusted to fix the code.

I committed this change anyway, and then reverted the commit. This way I can
show off how it went too far.

Next, I copied the `dotnet add` commands that installed Serilog (found in the
chat window) and then reran them. Then I took a smaller step, with something
like this:

> Add serilog initialization and configuration to this solution.

This was basically the second step that CoPilot ran before. Note that I didn't
tell it to remove log4net. But, it was in the same chat history, so CoPilot had
a memory of removing log4net in the past. It went ahead and removed log4net
_after_ installing Serilog. There was one place where is still removed something
that I wanted, so I asked it:

> Write a WARNING message to the log when CORS is not enabled.

That worked... but it inefficiently called the ASP.NET builder to create a
`LoggerFactory`, then use that factor to create a `Logger`. Next:

> Refactor so that the logger factory is injected into the method signature.

Done. It helpfully asks me if it should update any call sites.

> Yes, update the call sites to pass an ILoggerFactory.

Done. After this, I entered additional prompts to help convert
the log4net format to a serilog template and to finally remove log4net.

Verdict: small bites helped. But I might have just tried the original request
with slightly more useful instructions, and it may have gotten there on its own.
Maybe I should have described what the problem was and asked CoPilot to write a
better prompt for me 😁.

## Fix a warning

While testing the log response, I noticed a Warning that occurs on startup. Hey GitHub CoPilot...

> My application logs the following warning at runtime. Can you help me solve it?
>
> \```
> WARNING Microsoft.EntityFrameworkCore.Query [(null)] - Compiling a query which loads related collections for more than one collection navigation, either via 'Include' or through projection, but no 'QuerySplittingBehavior' has been configured. By default, Entity Framework will use 'QuerySplittingBehavior.SingleQuery', which can potentially result in slow query performance. See https://go.microsoft.com/fwlink/?linkid=2134277 for more information. To identify the query that's triggering this warning call 'ConfigureWarnings(w => w.Throw(RelationalEventId.MultipleCollectionIncludeWarning))
> \```

A short time later, the problem was fixed. The chat told me about how it setup
"query splitting" behavior in Entity Framework. I wondered to myself, "why isn;t
this the default? Is it safe?" So I asked GitHub CoPilot:

> are there any downsides to switching to this query splitting behavior?

The answer provided me with pros and cons, and a summary of why it feels that
this is safe "for most cases." This application does not have heavy load and I
agree that this looks safe, so I kept the changes.

Verdict: Thanks, CoPilot! Another bit of tech debt quickly solved.
