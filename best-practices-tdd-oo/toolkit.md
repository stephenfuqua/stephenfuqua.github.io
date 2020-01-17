---
layout: page
title: "Toolkit for .NET Unit Testing"
permalink: /best-practices-tdd-oo/toolkit
date: 2020-01-16
comments: true
tags: [unit-test, programming, oo]
---

{: .panel .panel-warning }
{: .panel-heading }Warning
{: .panel-body }Unfinished work-in-progress

My current favorite tools:

* Unit test framework: NUnit3
* Mock framework: FakeItEasy
* Assertion library: Shouldly

## Test Framework

There are three major libraries available for .NET unit testing:

* [MSTest](https://www.automatetheplanet.com/mstest-cheat-sheet/)
* [NUnit](https://nunit.org/)
* [xUnit](https://xunit.net/)

Each of these is valuable and worthy of use. I've written hundreds of test cases in each and been productive. Undoubtedly there are some detailed comparisons available to help weigh which one should be used. For me, it has been a relatively easy decision to favor NUnit:

1. About MSTest, the article linked above points out "you cannot find a single place where you can get started with its syntax."
1. I like to avoid vendor lock-in (Microsoft).
1. xUnit is too opinionated.
1. I prefer the attribute names used by NUnit and MSTest to those used by xUnit.
1. Therefore, I choose NUnit.

## Mocking

Historically there were a few other .NET mock providers, i.e. RhinoMocks and NMock, but they are dead projects. Most people have adopted MoQ. Although it has been around for a while, I only learned about FakeItEasy last year, and have come to love it. My current company has a lot of legacy code using RhinoMocks, and the FakeItEasy interface is more compatible than MoQ's. Therefore the transition is easier. However, FakeItEasy also matches the fluent simplicity of MoQ. Finally, I love that it treats everything as _fakes_ rather than making me choose to create either a _mock_ or a _stub_.

### Using MoQ

placeholder

### Using FakeItEasy

placeholder

## Assertions

### NUnit

### Shouldly

placeholder

## FluentAssertions

placeholder

------------------------------

_[Back to the introduction / table of contents](intro)_
