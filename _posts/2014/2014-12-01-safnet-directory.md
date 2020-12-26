---
layout: page
title: "safnet Directory: A Partnership Between Angular.Js and ASP.Net MVC"
date: 2014-12-01
comments: true
tags: [dotnet, javascript]
---

Back in October I started playing around with a few technologies, resulting in
my first code posted to GitHub:
[safnetDirector](https://github.com/stephenfuqua/safnetDirectory)y. I must say
that it is not the most impressive bit of coding that I've ever done. However,
the urge to learn sometimes needs an unencumbered, no-strings-attached, digital
canvas on which to exercise. That urge is requited through the experimentation
and the lessons learned, rather than the completion of an opus.

The end result: I have a prototype of a mixed Angular.Js / ASP.Net MVC
application that provides a simple directory and simple administrative
functionality. And it is Hosted on Azure.

![safnetDirectory screenshot](/images/safnetDirectory1.png){: .text-center }

Two user stories drove this exercise, with a made-up corporate name Prism
Company (I never did get around to using an engraving of Isaac Newton for the
logo):

1. As a Prism Company employee, I would like to lookup contact information for
   other employees, so that I can call or otherwise contact my co-workers as
   needed.
1. As a Prism Company Human Resources (HR) coworker, I need to add, update, or
   delete employee data, so that the company directory will always be
   up-to-date.

To deliver these stories, I began by allowing Visual Studio 2013 to setup a
basic MVC5 application with the default Membership authentication provider. From
there, I modified the system by expanding the User object to include additional
fields: full name, e-mail address, and phone number. Although I prefer a
lighter-weight solution than Entity Framework, I left EF6 as it wasn't critical
to my goals, and using the code-first approach allowed me to concentrate on the
front-end development and authentication.

The original default Registration page was modified to become the "new employee"
page. I left the standard MVC bindings in place instead of using Angular because
it is dealing with a small amount of data with only periodic use, and thus does
not need what I consider the primary benefit of a JavaScript MVVM framework:
handling large amounts of data with minimal data transmission.

Next, I used [ngGrid](https://www.npmjs.com/package/ng-grid) and integrated it
with the EF6 data model to create a high performing grid, with paging performed
in the database rather than in JavaScript. I didn't manage to fully customize
the grid in the way I want, so perhaps at a future date I'll upgrade to a newer
version of Angular.Js and a more flexible grid component. I secured the page by
integrating with the ASP.Net claims-based authentication, taking advantage of
that robust toolkit instead of trying to learn something like [JSON Web
Token](http://jwt.io/) (I just happen to need to learn the ASP.Net claims
authentication for work).

Finally, I added a form with search options, which is bound with Angular instead
of directly using a View and Controller in ASP.Net. Still, "back-end"
functionality is required to process the search request, and for that I treated
an MVC Controller as a REST service, without taking the time to introduce Web
API. MVC was good enough.

For now, this is just a brief reminder to myself of what I was toying with.
Hopefully before the year is out I'll find time for a follow-up to this post,
going into code-level detail on how these technologies integrated. Either way,
the source code is open for the world to criticize.
