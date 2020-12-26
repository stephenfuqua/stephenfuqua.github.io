---
layout: page
title: Unit Test Isolation for Legacy .Net Code
date: 2014-08-06
comments: true
tags:
- testing
- dotnet
---

Isolating code from dependencies is crucial for developing small, well-defined,
easy-to-understand tests. And it is an absolute must when those dependencies
call external resources, such as a database, filesystem, or heavy-duty component
(e.g. for interacting with office docs). But how do you introduce isolation in
new unit tests for legacy .Net code? Well, that depends... and I have a flow
chart and brief notes to help you figure it out.

![Test toolkit flow chart](/images/testIsolationLegacyCode.png){: .center-image .max-90 }

## Stubs, Mocks, Etc.

[Moq](https://github.com/moq/moq4) is my favorite framework because it is free
and is relatively easy to understand (if you are comfortable with lambda
expressions). No doubt
[RhinoMock](http://www.hibernatingrhinos.com/oss/rhino-mocks), [TypeMock
(Isolator Basic)](http://www.typemock.com/), the Nmocks, and many other unnamed
frameworks have their uses. [Microsoft's
Fakes](http://msdn.microsoft.com/en-us/library/hh549175.aspx) framework can work
for you – if you have an MSDN Premium or Ultimate license and you are confident
that you won't downgrade at any point. My other problem with Fakes is listed as
a virtue elsewhere in this post – it can easily be misused to substitute for
good design. See chapter 20 of _[Growing Object-Oriented Software, Guided by
Tests](http://www.growing-object-oriented-software.com/)_ for more on the
problem of mocking concrete classes.

And please don't forget, [Mocks are not
stubs](https://martinfowler.com/articles/mocksArentStubs.html).

## Static Methods

At first glance it might seem that calls to static and extension methods are
going to be a big thorn in your side. Thankfully Static Delegate Injection can
easily solve that problem for you. I wrote about this in [Making Mockery of
Extension Methods](/archive/2014/04/10/making-a-mockery-of-extension-methods/).

## Sprout or Wrap

Credit to Michael C. Feathers, _[Working Effectively with Legacy
Code](https://books.google.com/books/about/Working_effectively_with_legacy_code.html?id=CQlRAAAAMAAJ&hl=en)_

Let's say that you have a class that makes a database call, and you need to add
some logic to validate the input. Add that validation in a new, protected
method. In your unit test, create a test-specific subclass* that exposes the
protected method as a public one. Write a test case using the [test-specific
subclass](http://xunitpatterns.com/Test-Specific%20Subclass.html). This is
Sprouting.

On the other hand, perhaps it will make sense to take the ADO.Net or ORM-related
code out of your class, moving it to an Adapter class with a separated
interface. Now you can take full advantage of mocking. This is Wrapping.

\* For a bit more from Feathers without reading the whole book, [here is a
2-chapter extract
(PDF)](http://ptgmedia.pearsoncmg.com/images/9780131177055/samplepages/0131177052.pdf).
Phil Haack wrote about test-specific subclasses from a .Net perspective: [Test
Specific Subclasses vs Partial
Mocks](http://haacked.com/archive/2007/12/06/test-specific-subclasses-vs-partial-mocks.aspx).

## Last Resort

When you really can't do anything about the time pressure and you and you can't
make headway with the methods above, then you might need to break down and buy
TypeMock or use Microsoft's Fakes framework. I have not evaluated the TypeMock
product, but I think it uses the same techniques as Microsoft to break apart
those nasty dependencies: Reflecting over methods and replacing them with new
ones at runtime. It is almost a form of Aspect Oriented Programming, in my mind.
These techniques can be brittle and hard to read. But in a pinch, they can get
the job done.

Microsoft article on "shims" technology: [Using shims to isolate your
application from other assemblies for unit
testing](http://msdn.microsoft.com/en-us/library/hh549176.aspx).
