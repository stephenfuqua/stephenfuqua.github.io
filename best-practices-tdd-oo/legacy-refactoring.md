---
layout: page
title: "Legacy Refactoring: Best Practices in Test-Driven, Object Oriented, Green- and Brownfield Development"
permalink: /best-practices-tdd-oo/legacy-refactoring
date: 2020-01-13
comments: true
tags: [unit-test, programming, oo]
---

Any code that has been released is "legacy code." This article is about that really old legacy code your team inherited (from itself?). It wasn't designed in a way that is amenable to unit testing, and yet you're on a mission to add features, stamp out bugs, and improve the quality through refactoring. Here are some brief, practical tips for getting through this Gordian knot without a scimitar.

## Justification

![Lego wheel improvement](/images/lego-refactoring.jpg){: .center-image }

Before getting into the patterns, let's talk a bit more about refactoring. We've all heard the argument "I don't have time to refactor". Counter:

* How much time do you spend fixing bugs?
* How much time does it take to add a new feature?
* How much time is wasted trying to understand what the code is doing?
* How much time would it take to change frameworks?

If the answer is "very little", then the code is either already of very high quality&hellip; or it's dead. Otherwise, your team may need to make a little bit of time now to refactor, in order to move faster in the future. Like changing from square to round wheels.

Or if you're a car racing fan, think of it as a pit stop to change the tires and whatever else they do, so that the car will make it through to the end. And like a pit crew, the more you practice refactoring, the faster you'll be able to get the team back on the racetrack. So start practicing!

In order to refactor, you'll need to start isolating bits of code so that they can tested.

## Isolation Patterns

Find the right pattern, and slowly refactor to take advantage of it (or them, as the case may be). Keep this scientific principle in mind: hold everything constant, vary one thing, and measure the outcome. In software terms: make small changes, test frequently, or else you'll likely have an awfully hard time figuring out which variation caused the application to blow up. Martin Fowler [calls these changes](https://martinfowler.com/bliki/RefactoringMalapropism.html) "small behavior-preserving transformations."

Write unit tests as you go, as soon as possible, so that further refactoring will now be covered. And soon you'll find yourself able to fix bugs and add features using full [test-driven development](test-driven-development), instead of always having the test coverage lag behind.

Here's a handy flowchart to help think about test isolation (updated since [the original from 2014](archive/2014/08/06/unit-test-isolation-legacy/)):

![Test isolation flowchart](/images/unit-test-isolation-flowchart-2020.png){: .center-image .max-90 }

## Stubs and Mocks

Stubs and mocks are about faking out dependencies, allowing you to isolate the system under test. It is often said that [mocks aren't stubs](https://martinfowler.com/articles/mocksArentStubs.html). Yet in practice, how often does it matter?

Mocks are used for behavior verification after the system under test has run, whereas stubs more simply allow you to inject pre-defined input behavior into that system. Some mocking frameworks are very strict about this. And I used to be very strict about mocks and behavior: with MoQ, I would also use `MockBehavior.Strict` to ensure that no unexpected method calls were made on the mock. In a quickly evolving system, my teams found this resulted in brittle unit test code with little upside (that we could detect). So we stopped being so strict&hellip; and thousands of unit tests later I cannot think of a single time this decision has haunted me.

Last year, the team I support began getting rid of RhinoMocks, which has been dead for a long time. Before blindly jumping on the well-trodden path of MoQ, the team evaluated FakeItEasy. And liked it. So do I. It made for an easy transition from RhinoMocks, as it has some similar syntax. And it does away with the explicit distinction between mocks and stubs. Again, haven't seen a problem with that yet. (See [Unit Test Tools and Patterns](unit-test-tools-patterns) for more on these frameworks).

But you can only create a fake object (aka test double, aka either stub or mock, &hellip;) when you are [using interfaces](solid-testing).

## Static Methods

Static methods are great. Sometimes. Really, almost never. Dapper, I love you, but why do you have so much static?

Problem is, you can't isolate a system under test from a static method. Yes, you might be able to use [static delegate injection](/archive/2014/04/10/making-a-mockery-of-extension-methods/) to provide a fake method. 

------------------------------

_[Back to the introduction / table of contents](intro)_
