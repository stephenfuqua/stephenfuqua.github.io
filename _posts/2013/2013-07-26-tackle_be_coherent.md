---
layout: page
title: 'Be Coherent'
date: '2013-07-26 13:55:38 -0500'
basename: tackle_be_coherent
tags:
- tech
- sdlc
- meta
excerpt_separator: <!--more-->
---

Hypothesis: at the beginning of their careers (and perhaps well into them), most
software developers think written/verbal language skills are of little
importance to their field. To the contrary: as with most science and engineering
fields, where language arts and communications classes are seen as secondary at
best, the truth is that communication skills are critical to success. Being
"coherent" means that one is able to express himself in clear terms, logically
and consistently. This ability is essential in both code and "regular" language.

<!--more-->

## Written/Verbal

Software development is the art of producing tools that help people fulfill an
aspiration. It succeeds when they succeed - and it cannot succeed if the
programmer is not in regular, meaningful conversation with the user (or a
well-informed proxy). If someone is developing back-end or middle-tier code,
then the user is the front-end developer, and the advice still applies.
Communication needs to be as clear &mdash; and concise &mdash; as possible in
order to move forward with a unified vision.

This kind of communication takes so many different forms... documentation,
e-mails, quick conversations, dedicated meetings. Yes, there's the dreaded 'd'
word again: documentation. In Agile development we still (usually) need some
kind of documentation, whether to help the end user learn the application or to
help technical support troubleshoot issues as they arise.

## Code

Write code that is logical, consistent, and well ordered. In other words,
utilize basic design principles and patterns - <a
href="http://en.wikipedia.org/wiki/Cohesion_%28computer_science%29">high
cohesion</a>, <a
href="http://en.wikipedia.org/wiki/Coupling_%28computer_science%29">low
coupling</a>, short methods (max 100 lines?), readable / <a
href="http://stackoverflow.com/questions/209015/what-is-self-documenting-code-and-can-it-replace-well-documented-code">self-documenting
names</a>, etc . Avoid <a
href="http://en.wikipedia.org/wiki/Spaghetti_code">spaghetti code</a>; even
languages with full support for methods and classes can suffer when those
methods are large, poorly described, and stitched together in a haphazard
fashion. Why? Because these all make it easier for the next person &mdash; even
if it is you &mdash; to maintain the code. And, it makes it easier for you to
avoid bugs during initial development.

## Unifying the Two

Although on the surface these two forms of communication &mdash; "plain English"
(Spanish, Tagalog, etc) and code &mdash; seem very different, this _coherence_
principle shows us strong parallels between them. <a
href="http://c2.com/cgi/wiki?DontRepeatYourself">Do not repeat yourself</a>, in
its essence, applies equally in regular written (less so spoken) communication
as in code. <a
href="http://www.codinghorror.com/blog/2007/03/curlys-law-do-one-thing.html">Curly's
Law: Do One Thing</a> is helpful in code, and helpful in writing. After all, you
don't want a paragraph, or its verbal equivalent, covering multiple subjects at
once. That's just a variation on cohesion; well expressed thoughts should be
logically grouped together, with clear transitions from one subject to another.
Again, that is true of both code and verbal/written language. And so on it goes.

## Resources

### Books

<ul>
<li>
<a href="http://archive.org/details/mythicalmanmonth00fred">The Mythical Man-Month</a> (link is to the free 1st edition) , particularly chapter 7, _Why  Did the Tower of Babel Fail?_
<blockquote>
Where did they lack? In two respects &mdash; communication, and its consequent, organization. They were unable to talk with each other; hence they could not coordinate. When coordination failed, work ground to a halt. Reading between the lines we gather that lack of communication led to disputes, bad feelings, and group jealousies. Shortly the clans began to move apart, preferring isolation to wrangling.
</blockquote>
</li>
<li><a href="http://books.google.com/books/about/Clean_Code.html?id=_i6bDeoCQzsC">Clean Code: A Handbook of Agile Software Craftsmanship</a> </li>
<li><a href="http://books.google.com/books?id=3JfE7TGUwvgC&dq=Code+Complete">Code Complete</a>, part VII in general, section 33.5 in particular.</li>
</ul>
### Articles
<ul>
<li><a href="http://www.joelonsoftware.com/articles/CollegeAdvice.html">Advice for Computer Science College Students</a> (Joel on Software). Item 1: "Learn how to write before graduating. "</li>
<li><a href="http://www.codinghorror.com/blog/2011/02/how-to-write-without-writing.html">How to Write Without Writing</a></li>
<li><a href="http://www.javacodegeeks.com/2011/10/on-importance-of-communication-in.html">On the importance of communication in the workplace</a></li>
</ul>
### Related posts from this blog
<ul>
<li><a href="http://www.safnet.com/writing/tech/2013/05/agile-introverts.html">Agile Introverts</a></li>
</ul>
