---
layout: page
title: Evaluating SOA for Enterprise Architecture
date: '2008-09-10 19:40:02 -0500'
basename: evaluating_soa
tags:
- tech
- architecture
excerpt_separator: <!-- truncate -->
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

<ul>
	<li><a href="http://webservices.xml.com/pub/a/ws/2003/09/30/soa.html">What
	is Service Oriented Architecture</a>, a very early article on the subject
	(2003), published by O'Reilly, definitely leaves one with the impression
	that the two concepts are incompatible.</li>
	<li>In _
	<a href="http://books.google.com/books?id=fDykmoWpjzEC&amp;pg=PA35&amp;lpg=PA35&amp;dq=wcf+remoteobjects&amp;source=web&amp;ots=XW1NTudctl&amp;sig=6BThhde0l-QWNyQ7GypZhOyLlgo&amp;hl=en&amp;sa=X&amp;oi=book_result&amp;resnum=1&amp;ct=result#PPA34,M1">
	Pro WCF</a>_ (Apress, 2007), the authors make it sound like SOA is an
	alternative to OO, with statements like "Until now you probably have been
	creating applications utilizing an object-oriented programming model.
	Service-oriented architecture (SOA) is a _fundamental shift_ to dealing
	with the difficulties of building distributed systems." While this statement
	alone could fit with either way of looking at SOA, the book (of which I've
	only skimmed a small portion) continues in several ways to make it sound
	like an adopt-one-or-the-other proposition.</li>
	<li>Martin Fowler seems a bit
	<a href="http://www.martinfowler.com/bliki/ServiceOrientedAmbiguity.html">
	dismissive of SOA</a>, and in his _Patterns of Enterprise Application
	Architecture _(Addison Wesley, 2003), he makes no mention of SOA. He does use one
	example of web services as a fa&ccedil;ade.</li>
	<li>
	<a href="http://www.from9till2.com/PermaLink.aspx?guid=bdf07eaf-02dd-4f65-bb57-83e00e914e45">
	David Ing</a> does a nice job of classifying the two SOA approaches above &mdash;
	plus others &mdash; and giving them names. So far, I am in agreement with him that
	its value seems to be in "Services as Integration Gateways".</li>
	<li>
	For now, I'll end with a pithy set of comments on the
	<a href="http://creativekarma.com/ee.php/quotes/comments/service_oriented_vs_object_oriented/">
	Creative Karma</a> blog, which has the most digestable explanation I've
	found for what is actually fundamentally different between the two
	architectures: encapsulation.</li>
</ul>

In the end, I still haven't determined if it makes sense to start re-engineering
my applications for WCF, though I have been convinced that there is no real
point to talking about "SOA vs. OO" (yes, I realize I'm  very late to this
party, it is so 2004). I suspect that will have to be a corporate decision
&mdash; are the tradeoffs worth it? But in the meantime, I feel a bit more
knowledgeable about the domain, and better prepared for making a particular case
in the light of actual business requirements.
