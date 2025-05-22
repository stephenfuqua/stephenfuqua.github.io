---
layout: page
title: 'The Mythical Man-Month: Conceptual Integrity'
date: '2011-11-20 10:30:21 -0600'
basename: mythical_man-month_conceptual_integrity
tags:
- tech
- programming
- books
excerpt_separator: <!-- truncate -->
---

Part two in a series about Dr. Frederick Brooks Jr.'s _The Mythical Man-Month_:
 [1](/archive/2011/11/10/review_and_reflection_on_the_mythical_man-month_by_frederick_p_brooks_jr/),
 [2](/archive/2011/11/20/mythical_man-month_conceptual_integrity/),
 [3](/archive/2011/11/26/the_mythical_man-month_wiki_and_customer_service/),
 [4](/archive/2011/12/11/mythical_man-month_planning_for_change/),
 [5](/archive/2012/01/08/mythical_man-month_code_reuse_and_discoverability/)
{: .card .bg-light .card-bare }

Aside from being a fascinating inside-look at some of the challenges faced by
the mainframe programmers of the sixties, _The Mythical Man-Month_ presents many
lessons-learned that are no less applicable today. This is the second article in
a series exploring some of these lessons, in particular: conceptual integrity.

<!-- truncate -->

"Conceptual integrity" is one of the most important concepts in the book. Many
of Dr. Brooks's recommendations throughout the book are predicated on the
importance of ensuring a system's coherence, from the project management to user
interface, from documentation to memory management optimizations. Brooks

> "contend[s] that conceptual integrity is _the_ most important consideration in
> system design. It is better to have a system omit certain anomalous features
> and improvements, but to reflect one set of design ideas, than to have one
> that contains many good but independent and uncoordinated ideas." (p42)

Brooks talks about simplicity being more valuable than diversity of function
&mdash;  because it is easier to construct and utilize a coherent, slightly
simpler system than to create and use a complex one. How often have any of us
opted for the simpler device rather than the gadget with all the bells and
whistles, simply because we were concerned that the extras would break, or would
be hard to learn? The same goes with software systems: keep the design simple.
Only add as much diversity and complexity as are needed to get the job done. I
suspect that this approach was influential in the formation of [Agile
principle](https://agilemanifesto.org/principles.html) number 10: "_Simplicity
&mdash; the art of maximizing the amount of work not done &mdash; is
essential._"

I think the author would agree that this principle is to be applied to the
system generally, and must be applied very carefully when looking at individual
components. As I read this section, I reflected back on mistakes made a few
years before, when I first came onto a project in a file-processing environment.
I couldn't articulate a significant problem until reading this: none of the .Net
developers involved understood the system architecture, and therefore our
solutions were incoherent. We had diverse ways of reporting errors (if any), of
accepting input parameters, of creating output data.

Even as some of the individual lessons were learned, the bigger picture was not
realized. Only after reading this book did I realize why some people have been
less-than-thrilled about our use of Reporting Services for some new reports,
instead of plain text, and I just installed a new application that does the
same. We did so in order to have an easier time designing the report, and to
have better looking output (simpler for the programmers). That's nice, but not
at all what our users are used to, expected, or wanted.

What they want is something that prints the same way as all of the existing
file-based reports. They want to be able to find the file on the system and
reprint it when the existing paper copy gets chewed up. They don't want to learn
how to go to Reporting Services to print the report; plus, we made the mistake
of using the .Net version (RDLC). If reprints are needed, we'll have to either
output a permanent PDF, or support two versions &mdash;  the other loaded into
SQL Server's Report Manager. Further, I've realized that testing is simplified
when the report is in text: then it is easy to regression test the application,
using a file diff tool to compare the output before and after an update.

We were the new kids on the architecture block, and we didn't get it. Sometimes
we still don't. Brooks makes an analogy about ancient cathedrals. That RDLC
report &mdash; it's like repairing a section of a Gothic cathedral by building a
cantilevered steel-and glass structure. It might technically fit the need, but
it probably won't be what anybody wanted.
