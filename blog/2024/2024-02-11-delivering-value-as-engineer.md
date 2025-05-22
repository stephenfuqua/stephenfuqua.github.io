---
layout: page
title: Delivering Value as a Software Engineering Manager
date: 2024-02-11
comments: true
tags:
- programming
sharing: true
excerpt_separator: <!-- truncate -->
---

In [Unpopular Opinion: It’s harder than ever to be a good software
engineer](https://medium.com/@juraj.malenica/unpopular-opinion-its-harder-than-ever-to-be-a-good-software-engineer-8560585b0ea8),
author Juraj Malencia opines that "good engineering" equates to "bring[ing]
maximum value in achieving a goal." This is a comforting thought for those of us
periodically wondering if we're still good software or data engineers, though we
might not be up-to-date on the latest hype.

Pointing out that "engineering does not equal programming", implying that we can
bring great "engineering" (solutioning) value without writing a line of code, he
presents a modified version of a [venn
diagram](https://newsletter.pragmaticengineer.com/p/engineering-leadership-skillset-overlaps)
on how people in various roles spend their time between programming, alignment,
people, and "other". I was bemused to note I currently sit squarely in the
category labeled "beware" 🤨. A position that may continue throughout this year,
but will need to change over time.

<!-- truncate -->

One way that we can deliver value as senior engineers is by knowing when, and
how, to break the rules. Although I am now in management, I am staying close to
the work of one of our development teams. When I saw them struggling to meet the
sprint commitment, I decided to lean in. There was a tangled situation with
library dependencies. The thorniest problem lay with library A, which depended
on a dozen or so classes in library B. Remembering a lesson I learned from a
very smart "junior" developer a few years ago, I decided that Write Everything
Twice (WET) trumped Don't Repeat Yourself (DRY) in this case.

In other words, I just copied the required code from library B directly into
library A. In this case, all of the copied code was highly stable, and generally
of a "utility" nature rather than being business logic. Problem solved.

However: I probably could have contributed similar value by simply suggesting
that the team duplicate that code, rather than taking it on myself. It felt good
to do the work, and helped unblock the team, but it might not have been the
maximum value I could have brought _to the business_. What was I not getting
done - the opportunity cost? This is a critical lesson for this first-time
manager to learn: think twice (or more) before jumping into the code. Get better
at empowering than (hands-on) solving.

{: .center-block }
![Alexander the Great, cutting the Gordian Knot](https://blog.safnet.com/images/gordian-knot.png){: .img-fluid .border .rounded }

{: .figure .figure-caption}
Maturino da Firenze. [Alexander Cutting the Gordian
Knot](https://www.artic.edu/artworks/7441/alexander-cutting-the-gordian-knot),
1510-1527. The Art Institute of Chicago.
