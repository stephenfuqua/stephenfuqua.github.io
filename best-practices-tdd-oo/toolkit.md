---
layout: page
title: "Toolkit for .NET Unit Testing"
permalink: /best-practices-tdd-oo/toolkit
date: 2020-01-16
comments: true
tags: [unit-test, programming, oo]
---

{: .bg-warning }Unfinished work-in-progress

My current favorite tools:

* Unit test framework: NUnit3
* Mock framework: FakeItEasy
* Assertion library: Shouldly

## Test Frameworks

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

## NUnit

This is the final example from [Patterns for Writing Clean Test Cases](patterns), repeated for convenience:

```csharp
[TestFixture]
public abstract class BestRepositoryTests
{
    protected BestRepository System;
    protected MockOrm Orm;

    protected abstract void AdditionalArrangement();

    [OneTimeSetUp]
    public void Arrange()
    {
        Orm = new MockOrm();
        System = new BestRepository(Orm);

        AdditionalArrangement();
    }

    [TestFixture]
    public abstract class When_getting_a_person_by_id : BestRepositoryTests
    {
        protected Person Expected = new Person { Id = ValidId };
        protected const int ValidId = 123;
        protected const int InvalidId = -123;
        protected Person Result;

        protected abstract int LookupId { get; }

        [SetUp]
        public void Act()
        {
            Result = System.GetPerson(LookupId);
        }

        [Test]
        public void Then_called_repository_with_correct_arguments()
        {
            // Not one assert per test, but these simply belong together. Plus when
            // using a mocking tool, it would only be one line of code.
            Assert.That(Orm.WasCalled, Is.True);
            Assert.That(Orm.Arguments.id, Is.EqualTo(LookupId));
            Assert.That(Orm.Arguments.statement, Is.EqualTo(BestRepository.SelectPersonById));
        }

        [TestFixture]
        public class Given_person_exists : When_getting_a_person_by_id
        {
            protected override int LookupId => ValidId;

            protected override void AdditionalArrangement()
            {
                Orm.Expected = Expected;
            }

            [Test]
            public void Then_returns_correct_person()
            {
                Assert.That(Result, Is.SameAs(Expected));
            }
        }

        [TestFixture]
        public class Given_person_does_not_exist : When_getting_a_person_by_id
        {
            protected override int LookupId => InvalidId;

            protected override void AdditionalArrangement()
            {
                Orm.Expected = null;
            }

            [Test]
            public void Then_returns_correct_person()
            {
                Assert.That(Result, Is.Null);
            }
        }
    }
}
```

## MSTest

Specifically, this is using [MSTest v2](https://devblogs.microsoft.com/devops/mstest-v2-now-and-ahead/). I nearly forgot that `ClassInitialize` only runs once for all tests, whereas in NUnit it per test method. Because I want the system under test to be run cleanly for every test method, I'm only using `TestInitialize`.

```csharp
[TestClass]
public abstract class MSTest
{
    protected BestRepository System;
    protected MockOrm Orm;

    protected abstract void AdditionalArrangement();
    protected abstract void Act();

    [TestInitialize]
    public void Arrange()
    {
        Orm = new MockOrm();
        System = new BestRepository(Orm);

        AdditionalArrangement();
        Act();
    }


    [TestClass]
    public abstract class When_getting_a_person_by_id : MSTest
    {
        protected Person Expected = new Person { Id = ValidId };
        protected const int ValidId = 123;
        protected const int InvalidId = -123;
        protected Person Result;

        protected abstract int LookupId { get; }

        protected override void Act()
        {
            Result = System.GetPerson(LookupId);
        }

        [TestMethod]
        public void Then_called_repository_with_correct_arguments()
        {
            // Not one assert per test, but these simply belong together. Plus when
            // using a mocking tool, it would only be one line of code.
            Assert.IsTrue(Orm.WasCalled);
            Assert.AreEqual(LookupId, Orm.Arguments.id);
            Assert.AreEqual(BestRepository.SelectPersonById, Orm.Arguments.statement);
        }

        [TestClass]
        public class Given_person_exists : When_getting_a_person_by_id
        {
            protected override int LookupId => ValidId;

            protected override void AdditionalArrangement()
            {
                Orm.Expected = Expected;
            }

            [TestMethod]
            public void Then_returns_correct_person()
            {
                Assert.AreSame(Expected, Result);
            }
        }

        [TestClass]
        public class Given_person_does_not_exist : When_getting_a_person_by_id
        {
            protected override int LookupId => InvalidId;

            protected override void AdditionalArrangement()
            {
                Orm.Expected = null;
            }

            [TestMethod]
            public void Then_returns_correct_person()
            {
                Assert.IsNull(Result);
            }
        }
    }
}
```

## XUnit

Historically, when I had multiple asserts in the same test, I always added a message to make clear which assertion failed. Because I've recently moved away from that, none of the examples so far showed this. So you can't see the difference here in that xUnit's assertion framework doesn't support that. If any assertion fails in `Then_called_repository_with_correct_arguments` then you just have to look to expected vs. actual... or look at the line number on which the assertion failed :-).

Using constructors and `Dispose` instead of attributes is clever in xUnit and perfectly good. A matter of style. I prefer NUnit and MSTest calling out the various API methods explicitly.

```csharp
public abstract class XUnit
{
    protected BestRepository System;
    protected MockOrm Orm;

    protected abstract void AdditionalArrangement();

    public XUnit()
    {
        Orm = new MockOrm();
        System = new BestRepository(Orm);

        AdditionalArrangement();
    }

    public abstract class When_getting_a_person_by_id : XUnit
    {
        protected Person Expected = new Person { Id = ValidId };
        protected const int ValidId = 123;
        protected const int InvalidId = -123;
        protected Person Result;

        protected abstract int LookupId { get; }

        public When_getting_a_person_by_id()
        {
            Result = System.GetPerson(LookupId);
        }

        [Fact]
        public void Then_called_repository_with_correct_arguments()
        {
            // Not one assert per test, but these simply belong together. Plus when
            // using a mocking tool, it would only be one line of code.
            Assert.True(Orm.WasCalled);

            // xUnit really doesn't want you to do this.
            Assert.Equal(LookupId+50, Orm.Arguments.id);
            Assert.Equal(BestRepository.SelectPersonById, Orm.Arguments.statement);
        }

        public class Given_person_exists : When_getting_a_person_by_id
        {
            protected override int LookupId => ValidId;

            protected override void AdditionalArrangement()
            {
                Orm.Expected = Expected;
            }

            [Fact]
            public void Then_returns_correct_person()
            {
                Assert.Same(Expected, Result);
            }
        }

        public class Given_person_does_not_exist : When_getting_a_person_by_id
        {
            protected override int LookupId => InvalidId;

            protected override void AdditionalArrangement()
            {
                Orm.Expected = null;
            }

            [Fact]
            public void Then_returns_correct_person()
            {
                Assert.Null(Result);
            }
        }
    }
}
```

## Mocking Tools

Historically there were a few other .NET mock providers: RhinoMocks, NMock, NSubstitute. RhinoMocks and NMock are quite outdated, and until recently I had never heard of someone using NSubstitute. Most people have adopted MoQ. Although it has been around for a while, I only learned about FakeItEasy last year, and have come to love it. My current company has a lot of legacy code using RhinoMocks, and the FakeItEasy interface is more compatible than MoQ's. Therefore the transition is easier. However, FakeItEasy also matches the fluent simplicity of MoQ. Finally, I love that it treats everything as _fakes_ rather than making me choose to create either a _mock_ or a _stub_.

On a quick glance at [NSubstitute](https://nsubstitute.github.io/help/getting-started/), it actually looks quite attractive. As with FakeItEasy, everything is a _substitute_ without having to distinguis mock and stub. The syntax for setting up methods and verifying them looks very simple, and in fact easier than other frameworks. I wonder why I've never noticed it before? Worth more study.

Roy Osherove has several interesting articles on Moq, FakeItEasy, and NSubstitute that are worth mentioning here:

* [The future of Isolation frameworks, and how Moq isn't it (for now)](https://osherove.com/blog/2012/6/27/the-future-of-isolation-frameworks-and-how-moq-isnt-it-for-n.html)
* [FakeItEasy or NSubstitute? Which should I use for samples in art of unit testing 2nd edition?](https://osherove.com/blog/2012/6/26/fakeiteasy-or-nsubstitute-which-should-i-use-for-samples-in.html)
* [What's new and Changed in the Art of Unit Testing 2nd Edition](https://osherove.com/blog/2014/10/25/whats-new-and-changed-in-the-art-of-unit-testing-2nd-edition.html) reveals the answer: he used NSubstitute.

### Using MoQ

placeholder

### Using FakeItEasy

placeholder

### Using NSubsitute

## Assertion Libraries

### NUnit

### Shouldly

placeholder

## FluentAssertions

placeholder

------------------------------

_[Back to the introduction / table of contents](intro)_
