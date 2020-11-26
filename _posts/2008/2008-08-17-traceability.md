---
layout: post
title: Traceability
date: '2008-08-17 16:14:02 -0500'
basename: traceability
tags:
- tech
- sdlc
excerpt_separator: <!--more-->
---

_Postscript November 2020: from the days in which I was not allowed to practice
"agile"..._

You've written requirements. You've created a detailed use cases, and unit
tests, and reviewed all three. Code is delivered, passes system testing, moves
on to UAT. Whoa, holdup there fella, where's the data validation that prevents
the user from doing X? Its right there in the requirements. What happened? Not
only was it missed in the unit testing (and possibly use cases), but it was
missed in the review process as well.

<!--more-->

Traceability might be the gap here. Traceability is the notion that you should
be able to track a single requirement from the requirements document through to
the use cases, detailed design / technical specs (if created), and into the
testing phases. This, of course, requires that everything be clearly numbered
and labeled. Thus it should be possible to give a cursory glance at the
documents and look for any missing numbers.

It all starts then with a well-formatted business requirements document. Lately
I've found it useful to create a simple table that lists out all the
requirements that the business requestor and the software architect have come up
with, grouping them together by logical function and labeling them as _evident_
or _hidden_. This latter labeling helps communicate with the business when
you've listed out something that must happen "behind the scenes", which they
might not have thought about.

| Number | Requirement | Category |
| -- | -- |-- |
|| **Application - Login** |
| R1.1 | User must log in to the application with  username | Evident |
| R1.2 | Log user information in the database for security auditing | Hidden |
| | **Application - Some functional grouping** |
| R2.1 | Enter data X, Y, and X | Evident |
| R2.2 | Validate that value for field X is an integer | Hidden |
| R2.3 | Record data values in the database | Hidden |

With such a simple table, it becomes rather easy to list out all the
requirements reference numbers in functional requirements, use cases, design,
and unit tests. If R2.2 is not covered in the unit tests, then reject the unit
tests.
