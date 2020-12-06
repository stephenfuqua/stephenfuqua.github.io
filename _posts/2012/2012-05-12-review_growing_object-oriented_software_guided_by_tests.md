---
layout: page
title: 'Review: Growing Object-Oriented Software, Guided By Tests'
date: '2012-05-12 21:50:18 -0500'
basename: review_growing_object-oriented_software_guided_by_tests
tags:
- tech
- programming
- testing
- books
- agile
excerpt_separator: <!--more-->
---

<div class="float-right shadow p-3">
<a href="http://www.goodreads.com/book/show/4268826-growing-object-oriented-software-guided-by-tests"><img alt="Growing Object-Oriented Software, Guided by Tests" border="0" src="http://photo.goodreads.com/books/1266624968m/4268826.jpg" /></a><a href="http://www.goodreads.com/book/show/4268826-growing-object-oriented-software-guided-by-tests"><br>
Growing Object-Oriented Software, Guided by Tests</a><br>
by <a href="http://www.goodreads.com/author/show/27264.Steve_Freeman">Steve Freeman and Nat Pryce</a>
</div>

I did not realize how much I still have to learn about writing good
object-oriented  (OO) code, and about hewing to a tight test driven development
(TDD) methodology, before I read _Growing Object-Oriented Software, Guided By
Tests_. My education in OO and unit testing has been largely theoretical, with
no time spent directly learning from experienced OO programmers; my best mentor
was a COBOL coder. Books like  <a
href="http://www.goodreads.com/book/show/85009.Design_Patterns__Elements_of_Reusable_Object_Oriented_Software"
title="Design Patterns: Elements of Reusable Object-Oriented Software by Erich
Gamma">Design Patterns: Elements of Reusable Object-Oriented Software</a>, <a
href="http://www.goodreads.com/book/show/70156.Patterns_of_Enterprise_Application_Architecture"
title="Patterns of Enterprise Application Architecture by Martin
Fowler">Patterns of Enterprise Application Architecture</a>, <a
href="http://www.goodreads.com/book/show/85019.Applying_UML_and_Patterns__An_Introduction_to_Object_Oriented_Analysis_and_Design_and_Iterative_Development"
title="Applying UML and Patterns: An Introduction to Object-Oriented Analysis
and Design and Iterative Development by Craig Larman">Applying UML and Patterns:
An Introduction to Object-Oriented Analysis and Design and Iterative
Development</a>, <a
href="http://www.goodreads.com/book/show/337302.Xunit_Test_Patterns__Refactoring_Test_Code"
title="Xunit Test Patterns: Refactoring Test Code by Gerard Meszaros">Xunit Test
Patterns: Refactoring Test Code</a>, and others are wonderful but have few
detailed real-world business-case examples.

<!--more-->

That said, I admit that I skimmed through some of the middle chapters where the
application was being built &mdash; it was simple to skip the details of Java
implementation and focus on the points where a decision was being made, based on
tests, about where to put/move a piece code. The authors did well in steering
away from anything too Java-centric, that the book would remain accessible to
those of us who are not deep in that language.

There is no need for me to recount the contents &mdash; perusal of the <a
href="http://my.safaribooksonline.com/book/software-engineering-and-development/software-testing/9780321574442?bookview=toc">table
of contents</a> should be sufficient. Some of the advice about testing overlaps
that found in _XUnit Test Patterns_, but the overlaps is small enough to warrant
reading both. Naturally, some of the advice will reinforce what any good and
self-reflective programmer will have already figured out about writing tests. In
that case you receive validation and further justification. And much of the
advice on OO programming can be found in more detail in other works, though here
it is uniquely combined with TDD to shed new light on the advantages of OO.

A few particular highlights for me:

<ul>
<li>Let necessity drive design, rather week-long UML sessions.</li>
<li>Write to interfaces, initially ignoring implementation. Interfaces should name and describe relationships between classes.</li>
<li>Deploy as early as possible. Do so even before the application does anything, just to prove that the framework _can be_ deployed.</li>
<li>Readability applies to test code as well. I already believed that, but this presentation will help me explain that better to doubters.</li>
<li>Test names can be <a href="http://www.safnet.com/writing/tech/2012/03/test-naming-convention.html">extremely descriptive</a> (prior post)</li>
<li><a href="http://www.safnet.com/writing/tech/2012/04/moles-no-longer-fit-for-testings.html">I have been over-reliant</a> on Microsoft's Moles (prior post)</li>
</ul>
