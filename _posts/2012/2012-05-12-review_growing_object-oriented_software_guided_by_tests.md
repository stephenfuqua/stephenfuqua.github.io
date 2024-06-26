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

[_Growing Object-Oriented Software, Guided by Tests_](http://www.growing-object-oriented-software.com/)
by Steve Freeman and Nat Pryce

I did not realize how much I still have to learn about writing good
object-oriented  (OO) code, and about hewing to a tight test driven development
(TDD) methodology, before I read _Growing Object-Oriented Software, Guided By
Tests_. My education in OO and unit testing has been largely theoretical, with
no time spent directly learning from experienced OO programmers; my best mentor
was a COBOL coder. Books like _Design Patterns: Elements of Reusable
Object-Oriented Software_ ("Gang of Four"), _Patterns of Enterprise Application
Architecture_, _Applying UML and Patterns: An Introduction to Object-Oriented
Analysis and Design and Iterative Development_, _Xunit Test Patterns:
Refactoring Test Code_, and others are wonderful but have few detailed
real-world business-case examples.

<!--more-->

That said, I admit that I skimmed through some of the middle chapters where the
application was being built &mdash; it was simple to skip the details of Java
implementation and focus on the points where a decision was being made, based on
tests, about where to put/move a piece code. The authors did well in steering
away from anything too Java-centric, that the book would remain accessible to
those of us who are not deep in that language.

There is no need for me to recount the contents &mdash; perusal of the [table of
contents](http://www.growing-object-oriented-software.com/toc.html) should be
sufficient. Some of the advice about testing overlaps that found in _XUnit Test
Patterns_, but the overlaps is small enough to warrant reading both. Naturally,
some of the advice will reinforce what any good and self-reflective programmer
will have already figured out about writing tests. In that case you receive
validation and further justification. And much of the advice on OO programming
can be found in more detail in other works, though here it is uniquely combined
with TDD to shed new light on the advantages of OO.

A few particular highlights for me:

* Let necessity drive design, rather week-long UML sessions.
* Write to interfaces, initially ignoring implementation. Interfaces should name
  and describe relationships between classes.
* Deploy as early as possible. Do so even before the application does anything,
  just to prove that the framework _can be_ deployed.
* Readability applies to test code as well. I already believed that, but this
  presentation will help me explain that better to doubters.
* Test names can be [extremely
  descriptive](/archive/2012/03/30/test_naming_convention/) (prior post)
* Realizing that [I have been
  over-reliant](/archive/2012/04/19/moles-no-longer-fit-for-unit-test/)  on
  Microsoft's Moles (prior post)
