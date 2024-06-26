---
layout: page
title: 'Mythical Man-Month: Planning for Change'
date: '2011-12-11 11:17:59 -0600'
basename: mythical_man-month_planning_for_change
tags:
- tech
- programming
- books
- agile
excerpt_separator: <!--more-->
---

Part four in a series about Dr. Frederick Brooks Jr.'s _The Mythical Man-Month_:
[1](/archive/2011/11/10/review_and_reflection_on_the_mythical_man-month_by_frederick_p_brooks_jr/),
[2](/archive/2011/11/20/mythical_man-month_conceptual_integrity/),
[3](/archive/2011/11/26/the_mythical_man-month_wiki_and_customer_service/), 4,
[5](/archive/2012/01/08/mythical_man-month_code_reuse_and_discoverability/)
{: .card .bg-light .card-bare }

In the chapter titled "Plan the System for Change," Dr. Brooks
again lays out the foundations for Agile software development. His was an era of
dumb-terminals and highly scheduled availability. And yet, here he is saying,
"plan to throw one away; you will, anyhow." When RAM wasn't cheap, and good
programmers even more rare than today, how does a project manager or architect
justify throwing out the first design _on purpose_? By recognizing that "[t]he
only question is whether to plan in advance to build a throwaway, or to promise
to deliver the throwaway to customers."

<!--more-->

This followed an analogy to the creation of a physical pilot plant for testing
out a proposed manufacturing design. That sounds to me like a prototype. Spend
an early iteration on a quick-and-dirty prototype of your design, run it by the
users, and incorporate the feedback into a fresh implementation. But it does
seem to miss the beauty of refactoring: get it working, then clean it up.
Perhaps the refactoring concept did not work as well in those green-screen,
procedural days, before you could re-compile every few minutes.

It is not sufficient, Brooks posits, to expect changing requirements and hope
for the best. Thus he goes on to advocate that the software development group be
organized for success in a changing environment. But he also makes the assertion
that software needs more control, not less, which on the surface seems to be a
call for a strict waterfall. He doesn't want tentative plans.

One of the signs of true genius is recognizing new data, accepting that a former
conclusion might be wrong, and moving forward with the new premise. In new
chapter "The Mythical Man-Month after 20 Years," Brooks accepts that "[t]he
biggest mistake in the "Build one to throw away" concept is that it implicitly
assumes the classical sequential or waterfall model of software construction."
Thus in 1995 his vision of software development was updated to include the
reality of incremental and iterative design. His 1986 paper, "No Silver Bullet"
(ch 16) actually spelled out the need to "[utilize] rapid prototyping" and
"[grow] software organically." A common misconception about Agile development is
that it is uncontrolled. In the context of the whole, Brooks is calling for
careful governance without the stultifying commitment to tollgates and a
single-pass design that are called for by waterfall.
