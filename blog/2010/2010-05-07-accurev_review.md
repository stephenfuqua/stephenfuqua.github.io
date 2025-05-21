---
layout: page
title: AccuRev - Review and Practices
date: '2010-05-07 20:27:24 -0500'
basename: accurev_review
tags:
- tech
- sdlc
excerpt_separator: <!--more-->
---

I've been using <a href="http://www.accurev.com">AccuRev</a>, including
AccuBridge integration in Visual Studio, for close on two years now. And I like
it. I don't know anything about the licensing fees, but for the enterprise that
is interested in spending some money, it is certainly a good option. So, for
anyone considering using AccuRev for source code control, and who happens to
stumble across this site, here are a few points to consider:

<!--more-->

## Positives

<ol>
<li>No need to "check out" code &mdash; you just work on it as needed, and Keep it when ready.</li>
<li>Keeping allows a developer to store partially-complete code on the server, without polluting the full code base (that doesn't happen unless you promote from your workspace to a stream)</li>
<li>When I've needed help with an issue, I quickly received correct advice through their user support forum.</li>
<li>AccuBridge integration in Visual Studio is very easy to use, and very effective. I rarely have to open the AccuRev gui anymore.</li>
<li>It promotes very agile behavior, in terms of branching and linking code to different stages of the software lifecycle (more on that below).</li>
<li>It can be integrated with continuous-build environments.</li>
</ol>

## Negatives

<ol>
<li>Grokking the stream-based architecture, and the Keep vs. Check-in change from other source control management tools, can be challenging for some. Frankly, having used Visual Source Safe and Subversion as well, I find AccuRev to be in the middle in terms of learning curve; I actually have more trouble with Subversion than AccuRev.</li>
<li>Sometimes files are accidentally recognized as binary instead of plain text; I suspect that this is when they are Unicode but the bytemark is corrupt. I don't believe these can be changed to plain text. This means no diff/merge process.</li>
<li>Missing some keyboard shortcuts - i.e. F3 to search for a stream only works after having once gone to through the menus to get to the search.</li>
<li>Its not free.</li>
</ol>

## Practices

<ol>
<li>
It seems natural to setup <a
href="http://www.accurev.com/whitepaper/stream_based_architecture.htm">streams</a>
that follow a typical development lifecycle, i.e. a Development stream linked to
a QA stream, perhaps to an Acceptance stream and then to Production. This way
you can always get a snapshot of the code as it exists in your different
environments. Solves a problem like: a release has been in testing for two
months, still waiting for the users to have sufficient time to evaluate.
Development on new features has continued in the meantime. Finally users can
test, and they find a minor bug. Where do you fix the problem? Perhaps at the
Acceptance stream, so you don't have to push the development work forward. And
the fix will flow back "downstream" to the development stage.
</li>
<li>Be generous with setting up streams to suite the way your teams work. For instance, in the structure above, if you have a couple of different teams working, then further split the Development stream into Team streams (or something equivalent), which will help the team members integrate their code without affecting the other team (until the code is promoted from the TeamX to Dev stream).</li>
<li>I suppose this goes for all source control tools: do not keep/check-in Visual Studio's .user and .suo files. These change with every user session, and they are user-dependent. Putting them into the depot will simply cause team members to be constantly messing up each other's Visual Studio history and settings.</li>
<li>Don't be afraid to split a stream to support different projects that need the same code. For instance, I have a single stream that holds all database files. When I get a new large project, I will create a project sub-stream off the Development database stream, so that I can separate these files from other projects. Helps keep from unexpected integration problems, very similar to the Team split advocated above.</li>
</ol>
