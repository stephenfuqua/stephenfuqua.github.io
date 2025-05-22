---
layout: page
title: Unit Testing - Code Coverage and Separation of Layers
date: '2009-02-05 12:13:48 -0600'
basename: unit_testing_co
tags:
- tech
- dotnet
- testing
excerpt_separator: <!-- truncate -->
---

Lately I've been working with my team to understand and utilize good automated
unit testing strategies with [NUnit](http://www.nunit.org). A code
release I was inspecting revealed a couple of good points that seem worth
expanding on: the importance of testing each layer, and the need to pay
attention to code coverage. This is a rather facile treatment; for more in-depth
reasoning and details, I recommend <a href="http://www.xunitpatterns.com">xUnit
Test Patterns</a>.

<!-- truncate -->

## Code coverage

Although there may be occasional exceptions, we need our tests to _cover_ most
of our code. 100% code coverage might be too high a goal to reach for right now,
but we need to have a high percentage of the code we right covered in our
testing. And what do I mean by covered? The WikiPedia entry on _code coverage_
has a good summary:

> There are a number of coverage criteria, the main ones being:
>
> **Function coverage** - Has each function in the program been executed?
>
> **Statement coverage** - Has each line of the source code been executed?
>
> **Decision coverage** (also known as Branch coverage) - Has each control
> structure (such as an if statement) evaluated both to true and false?
>
> **Condition coverage** - Has each boolean sub-expression evaluated both to
> true and false (this does not necessarily imply decision coverage)?
>
> **Modified Condition/Decision Coverage (MC/DC)** - Has every condition in a
> decision taken on all possible outcomes at least once? Has each condition been
> shown to affect that decision outcome independently?
>
> **Path coverage** - Has every possible route through a given part of the code
> been executed?
>
> **Entry/exit coverage** - Has every possible call and return of the function
> been executed?

## Layer Test

Summary from the book: "We write separate tests for each layer of the layered
architecture". Right now we have three layers:

1. Domain
1. DataMapper
1. Service

Generally our domain layer does very little work &mdash; these objects basically
just hold fields, but don't perform any work on their own data. An exception to
is the rare class which has public methods. These methods should be _covered_ in
tests of the domain layer, but I don't see much point right now in trying to
write tests that only run the constructor and inspect the properties. So, with
the domain layer, we would try to write tests if there are custom _methods_ but
for now we would not need tests to cover _properties_ or _constructors_.

The code supplied does a covers a number of methods in the DataMapper layer, so
that's good. But, the service layer is left out entirely; it has not been
covered in the code tests, and therefore at this time we have no idea if the
service layer works as expected.

 [NCover](http://sourceforge.net/projects/ncover/) is a useful tool
for exploring how much of your code is covered by a single test or a suite of
tests. It is an open source application, like NUnit, therefore free to download
and use. The Visual Studio Team Test Edition also has a built-in code coverage
tool.
