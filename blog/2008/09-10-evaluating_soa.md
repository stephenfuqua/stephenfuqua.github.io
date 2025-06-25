---
title: Evaluating SOA for Enterprise Architecture
date: '2008-09-10 19:40:02 -0500'
tags:
- tech
- architecture

---

A few weeks ago I started trying to better understand the concepts behind
service oriented architecture (SOA), how I can apply them to my work, and if
doing so is actually a good idea. When I first started hearing about SOAP years
ago, I understood it as an alternative to objects &mdash; you build and consume
services instead of objects. This sounds great for highly distributed
environments, but also sounds like a performance nightmare in a business
environment that does not need distribution. So I largely ignored it, and
assumed I could ignore SOA as well.

<!-- truncate -->

In the last few years, it has become more clear that SOA also allows the
application designer to open business logic to several different platforms.
Essentially these two statements are the same, but it seems that they can easily
lead people in different directions &mdash; the former eschews objects altogether,
while the latter statement is agnostic to the manner in which the business logic
is built.

In the process of re-evaluating the system architecture I have developed at
work, I can see potential for taking advantage of the 1-to-many relationship of
business logic to user interface platform. So I've been slowly, gradually trying
to evaluate SOA's usefulness in my still evolving business logic architecture. As a .Net
developer, this slow process has included trying to better understand the role
of Windows Communication Foundation (WCF). Looking for some thoughts and
patterns for integrating a service-oriented approach with an object-oriented one
&mdash; which seems imminently reasonable when treating the service as a Remote Fa&ccedil;ade
&mdash; I found some interesting discussion diving into these issues:

* What is Service Oriented Architecture (dead link removed; SF 2025), a very
  early article on the subject (2003), published by O'Reilly, definitely leaves
  one with the impression that the two concepts are incompatible.
* In _[Pro
  WCF](https://www.amazon.com/Pro-WCF-Practical-Microsoft-Implementation/dp/1590597028)_
  (Apress, 2007), the authors make it sound like SOA is an alternative to OO,
  with statements like "Until now you probably have been creating applications
  utilizing an object-oriented programming model. Service-oriented architecture
  (SOA) is a _fundamental shift_ to dealing with the difficulties of building
  distributed systems." While this statement alone could fit with either way of
  looking at SOA, the book (of which I've only skimmed a small portion)
  continues in several ways to make it sound like an adopt-one-or-the-other
  proposition.
* Martin Fowler seems a bit [dismissive of
  SOA](https://www.martinfowler.com/bliki/ServiceOrientedAmbiguity.html), and in
  his _Patterns of Enterprise Application Architecture_(Addison Wesley, 2003),
  he makes no mention of SOA. He does use one example of web services as a
  fa&ccedil;ade.
* David Ing (dead link removed; SF 2025) does a nice job of classifying the two
  SOA approaches above &mdash; plus others &mdash; and giving them names. So
  far, I am in agreement with him that its value seems to be in "Services as
  Integration Gateways".
* For now, I'll end with a pithy set of comments on the Creative Karma (dead
  link removed; SF 2025) blog, which has the most digestable explanation I've
  found for what is actually fundamentally different between the two
  architectures: encapsulation.

In the end, I still haven't determined if it makes sense to start re-engineering
my applications for WCF, though I have been convinced that there is no real
point to talking about "SOA vs. OO" (yes, I realize I'm  very late to this
party, it is so 2004). I suspect that will have to be a corporate decision
&mdash; are the tradeoffs worth it? But in the meantime, I feel a bit more
knowledgeable about the domain, and better prepared for making a particular case
in the light of actual business requirements.
