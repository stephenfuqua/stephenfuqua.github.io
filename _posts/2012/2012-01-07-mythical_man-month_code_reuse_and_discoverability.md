---
layout: page
title: 'Mythical Man-Month: Code Reuse and Discoverability'
date: '2012-01-07 20:09:21 -0600'
basename: mythical_man-month_code_reuse_and_discoverability
tags:
- tech
- programming
- books
- dotnet
excerpt_separator: <!--more-->
---


Part five in a series about Dr. Frederick Brooks Jr.'s _The Mythical Man-Month_:
[1](/archive/2011/11/10/review_and_reflection_on_the_mythical_man-month_by_frederick_p_brooks_jr/), \
[2](/archive/2011/11/20/mythical_man-month_conceptual_integrity/), \
[3](/archive/2011/11/26/the_mythical_man-month_wiki_and_customer_service/), \
[4](/archive/2011/12/11/mythical_man-month_planning_for_change/), \
[5](/archive/2012/01/08/mythical_man-month_code_reuse_and_discoverability/)
{: .card .bg-light .card-bare }

"The best way to attack the essence of building software," Dr. Brooks writes,
"is not to build it at all." (p222). With this he introduces a brief discussion
of the importance of code reuse, and of its challenges.

<!--more-->

Building software for reuse is expensive: it requires greater attention to
architecture and more hardening. Perhaps more importantly, it is difficult to
user and learn. Code intended for general use often must be more flexible, with
a greater number of parameters, which makes it harder to understand. The biggest
problem of all I call discoverability; that is, how does anyone know what code
is available for reuse?

There are many tools and methods available to help software developers today.
Brooks himself refers to the power of object orientation, inheritance and
polymorphism for enabling reuse.
[Refactoring](https://martinfowler.com/refactoring/), combined with a complete
set of automated [unit tests](https://xunitpatterns.com), should significantly
reduce the up-front cost of developing for reusability. Language features such
as [Generics](https://en.wikipedia.org/wiki/Generic_programming) and [Anonymous
Delegate](https://en.wikipedia.org/wiki/Anonymous_delegate) allow for a great
deal of flexibility in reusable code.

[Static code analysis](https://en.wikipedia.org/wiki/Static_program_analysis)
tools can help spot common flaws in security, design, naming, and more &mdash;
thereby helping to improve not only the maintainability but also the discovery
of functionality. For the .Net developer,
[Pex's](/archive/2010/02/10/exploring_net_c/) automatic discovery of unhandled
exceptions can do much to improve, quickly, the code hardening efforts.

[XML code comments](https://msdn.microsoft.com/en-us/magazine/cc302121.aspx),
which can be enforced in static analysis, are quite helpful in explaining the
purpose of a class and its methods. Brooks mentions the importance of code
samples, beyond general documentation, for explaining complex reusable code.
These can be embedded in the Remarks section of an XML comment. For the .Net
developer, these comments can be compiled into web pages using
[Sandcastle](https://learn.microsoft.com/en-us/archive/blogs/sandcastle/). Load
these pages into IIS. Perhaps configure a search engine. Take a suggestion from
Brooks by publishing a weekly summary of the new/updated documentation.

For all that, the human touch is probably the most potent approach; [peer review
and pair
programming](http://stackoverflow.com/questions/23935/peer-reviews-or-pair-programming-or-both)
provide ample opportunity for sharing about available components and modules.

With all these advantages today, the only excuse for not building your code to
be reusable is that you know it won't be reused. In that case, don't waste your
time. Refactor later if you were wrong.
