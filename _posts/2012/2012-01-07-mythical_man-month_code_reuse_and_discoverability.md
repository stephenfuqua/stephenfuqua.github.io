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

Fifth and final <a
href="http://www.safnet.com/fcgi-bin/mt/mt-search.cgi?IncludeBlogs=3&amp;tag=Mythical%20Man-Month&amp;limit=20">
installment in a series</a>. "The best way to attack the essence of building
software," Dr. Brooks writes, "is not to build it at all." (p222). With this he
introduces a brief discussion of the importance of code reuse, and of its
challenges.

<!--more-->

Building software for reuse is expensive: it requires greater attention to
architecture and more hardening. Perhaps more importantly, it is difficult to
user and learn. Code intended for general use often must be more flexible, with
a greater number of parameters, which makes it harder to understand. The biggest
problem of all I call discoverability; that is, how does anyone know what code
is available for reuse?

There are many tools and methods available to help software developers today.
Brooks himself refers to the power of object orientation, inheritance and
polymorphism for enabling reuse. <a
href="http://martinfowler.com/refactoring/">Refactoring</a>, combined with a
complete set of automated <a href="http://xunitpatterns.com/">unit tests</a>,
should significantly reduce the up-front cost of developing for reusability.
Language features such as <a
href="http://en.wikipedia.org/wiki/Generic_programming">Generics</a> and <a
href="http://en.wikipedia.org/wiki/Anonymous_delegate">Anonymous Delegate</a>
allow for a great deal of flexibility in reusable code.

<a href="http://en.wikipedia.org/wiki/Static_program_analysis">Static code
analysis</a> tools can help spot common flaws in security, design, naming, and
more &mdash; thereby helping to improve not only the maintainability but also
the discovery of functionality. For the .Net developer, <a
href="http://www.safnet.com/writing/tech/2010/02/exploring-net-c.html">Pex's</a>
automatic discovery of unhandled exceptions can do much to improve, quickly, the
code hardening efforts.

<a href="http://msdn.microsoft.com/en-us/magazine/cc302121.aspx">XML code
comments</a>, which can be enforced in static analysis, are quite helpful in
explaining the purpose of a class and its methods. Brooks mentions the
importance of code samples, beyond general documentation, for explaining complex
reusable code. These can be embedded in the Remarks section of an XML comment.
For the .Net developer, these comments can be compiled into web pages using <a
href="http://blogs.msdn.com/sandcastle"> Sandcastle</a>. Load these pages into
IIS. Perhaps configure a search engine. Take a suggestion from Brooks by
publishing a weekly summary of the new/updated documentation.

For all that, the human touch is probably the most potent approach;
<a href="http://stackoverflow.com/questions/23935/peer-reviews-or-pair-programming-or-both">
peer review and pair programming</a> provide ample opportunity for sharing about
available components and modules.

With all these advantages today, the only excuse for not building your code to
be reusable is that you know it won't be reused. In that case, don't waste your
time. Refactor later if you were wrong.

## Comments

_Imported from old Movable Type installation_

> author: bezvezemail\
date: '2013-08-20 05:42:39 -0500'
>
> How can you apply this to checkbox.. Say, I have a table with the
> chekboxes,and want to move checked rows from one table to another? What do I
> need to change?
