---
layout: page
title: "Patterns for Writing Clean Test Cases"
permalink: /best-practices-tdd-oo/patterns
date: 2020-01-16
comments: true
tags: [unit-test, programming, oo]
---

Each team will want to find its own style for expressing unit tests. Or multiple styles, depending on the situation. The patterns below represent just a handful of techniques that may be useful in creating easy-to-read and easy-to-maintain unit tests.

## Starting Point

Start with this example from [Legacy Refactoring](legacy-refactoring):

```csharp
using System;
using NUnit.Framework;

namespace mockAndStubExample
{
    [TestFixture]
    public class SystemTests
    {
        [Test]
        public void MethodTest()
        {
            const string input = "a";
            const string expectedOutput = "Z";
            const Options option = Options.UpperCase;

            var mockOfA = new MockA { ExpectedResult = expectedOutput };
            var stubOfB = new StubB();
            var systemUnderTest = new BetterSystem(mockOfA, stubOfB);

            var actual = systemUnderTest.Method(input);

            Assert.That(actual, Is.EqualTo(expectedOutput));
            Assert.That(mockOfA.WasCalled, Is.True);
            Assert.That(mockOfA.Arguments.actualInput, Is.EqualTo(input));
            Assert.That(mockOfA.Arguments.actualOption, Is.EqualTo(option));
        }

        private class MockA : IDependencyA
        {
            public string ExpectedResult { get; set; }
            public (string actualInput, Options actualOption) Arguments { get; set; }
            public bool WasCalled { get; set; }

            public string ActOn(string input, Options option)
            {
                Arguments = (input, option);
                WasCalled = true;
                return ExpectedResult;
            }
        }

        private class StubB : IDependencyB
        {
            public Options Option => Options.UpperCase;
        }
    }
}
```

## Making Intent Clear with Comments

When a test method gets to be long, perhaps due to a lot of setup, it can be difficult to figure out where the system under test is (unless it is named clearly as above), and difficult to find the action.

In a case like this, I like to add "Arrange", "Act", and "Assert" comments into the method to break it up. The "Assert" section is pretty obvious, but the use of the word reinforces the use of the pattern.

```csharp
[Test]
public void MethodTest_WithComments()
{
    // Arrange
    const string input = "a";
    const string expectedOutput = "Z";
    const Options option = Options.UpperCase;

    var mockOfA = new MockA { ExpectedResult = expectedOutput };
    var stubOfB = new StubB();
    var systemUnderTest = new BetterSystem(mockOfA, stubOfB);

    // Act
    var actual = systemUnderTest.Method(input);

    // Assert
    Assert.That(actual, Is.EqualTo(expectedOutput));
    Assert.That(mockOfA.WasCalled, Is.True);
    Assert.That(mockOfA.Arguments.actualInput, Is.EqualTo(input));
    Assert.That(mockOfA.Arguments.actualOption, Is.EqualTo(option));
}
```

## Making Intent Clear With Methods

When writing self-explanatory code, comments can often be replaced by extracting well-name private methods. In C# I'm a big fan of local methods, which further illustrate that the method was extracted to enhance readability, rather than for the purpose of reuse. The local methods also provide closure over variables defined in the enclosing method; this is both convenient and potentially confusing to some readers, so I would use a dose of caution. It is definitely arguable whether this represents a real improvement over the original, particularly with all of the shared variables and constants.

```csharp
[Test]
public void MethodTest_LocalMethods()
{
    const string input = "a";
    const string expectedOutput = "Z";
    const Options option = Options.UpperCase;
    MockA mockOfA;
    StubB stubOfB;
    BetterSystem systemUnderTest;
    string result;

    Arrange();
    Act();
    // Can't use the name `Assert` because it overloads NUnit's `Assert`!
    // If I were using Shouldly here it wouldn't be a problem.
    Assertions();

    void Arrange()
    {
        mockOfA = new MockA { ExpectedResult = expectedOutput };
        stubOfB = new StubB();
        systemUnderTest = new BetterSystem(mockOfA, stubOfB);
    }

    void Act()
    {
        result = systemUnderTest.Method(input);
    }

    void Assert()
    {
        Assert.That(result, Is.EqualTo(expectedOutput));
        Assert.That(mockOfA.WasCalled, Is.True);
        Assert.That(mockOfA.Arguments.actualInput, Is.EqualTo(input));
        Assert.That(mockOfA.Arguments.actualOption, Is.EqualTo(option));
    }
}
```

## Avoiding Duplication

We should be testing multiple inputs and outputs. Using a refined class structure, along with NUnit conventions (attributes), is helpful.

```csharp
[TestFixture]
public class MethodTests
{
    private MockA _mockOfA;
    private StubB _stubOfB;
    private BetterSystem _systemUnderTest;
    private string _result;

    protected void Arrange(string expectedOutput)
    {
        _mockOfA = new MockA { ExpectedResult = expectedOutput };
        _stubOfB = new StubB();
        _systemUnderTest = new BetterSystem(_mockOfA, _stubOfB);
    }

    protected void Act(string input)
    {
        _result = _systemUnderTest.Method(input);
    }

    protected void Assertions(string input, string expectedOutput)
    {
        Assert.That(_result, Is.EqualTo(expectedOutput));
        Assert.That(_mockOfA.WasCalled, Is.True);
        Assert.That(_mockOfA.Arguments.actualInput, Is.EqualTo(input));
        Assert.That(_mockOfA.Arguments.actualOption, Is.EqualTo(_stubOfB.Option));
    }

    [Test]
    public void InputAGivesOutputZ()
    {
        const string input = "A";
        const string expectedOutput = "Z";

        Arrange(expectedOutput);
        Act(input);
        Assertions(input, expectedOutput);
    }

    [Test]
    public void InputBGivesOutputA()
    {
        const string input = "A";
        const string expectedOutput = "Z";

        Arrange(expectedOutput);
        Act(input);
        Assertions(input, expectedOutput);
    }
}
```

However, even that has unnecessary duplication, which would allow us to use `[TestCase]` attributes:

```csharp
[TestCase("a", "Z")]
[TestCase("B", "A")]
public void MethodTests(string input, string expectedOutput)
{
    Arrange(expectedOutput);
    Act(input);
    Assertions(input, expectedOutput);
}
```

## One Assert Per Test

There is a line of reasoning that says each test case should have only one Assert: if the first assertions fails, you'll never inspect the following assertions. I fought against this for a very long time, and indeed rarely in thousands of unit tests did I find a problem with multiple assertions. Usually only one was failing, and I always put clear assertion messages in so that I would know exactly what was failing, like so:

```csharp
protected void AssertionsWithMessages(string input, string expectedOutput)
{
    Assert.That(_result, Is.EqualTo(expectedOutput), "Correct result");
    Assert.That(_mockOfA.WasCalled, Is.True, "mock was called");
    Assert.That(_mockOfA.Arguments.actualInput, Is.EqualTo(input), "mock input string");
    Assert.That(_mockOfA.Arguments.actualOption, Is.EqualTo(_stubOfB.Option), "mock input option");
}
```

The xUnit framework is hard-core about this: it will only evaluate the first assertion. So I had to start taking my sub-classes a step further. Nowadays even in NUnit I've come to embrace this, as there is a lovely side effect: with good names, the test explorer shows you what is being tested, without having to add an assertion message. But it does involve some abuse of NUnit conventions. For new testers, this might end up looking very bizarre; I did not come up with the idea of (mis)using `[OneTimeSetup]` for the arrangement and `[SetUp]` for the action on my own. Saw it in tests at my current job. Was very confused at first. Then loved it. Maybe you will too. I've further embellished the approach using the "Given... When... Then..." terminology of Behavior Driven Development (BDD), and use snake casing to make the class and method names more readable:

```csharp
public abstract class MethodTests_WithOneAssertionPerTest
{
    private MockA _mockOfA;
    private StubB _stubOfB;
    private BetterSystem _systemUnderTest;
    private string _result;

    protected abstract string ExpectedOutput { get; }
    protected abstract string Input { get; }

    [OneTimeSetUp]
    protected void Given()
    {
        _mockOfA = new MockA { ExpectedResult = ExpectedOutput };
        _stubOfB = new StubB();
        _systemUnderTest = new BetterSystem(_mockOfA, _stubOfB);
    }

    [SetUp]
    protected void When()
    {
        _result = _systemUnderTest.Method(Input);
    }

    [TestFixture]
    public class Given_input_value_A : MethodTests_WithOneAssertionPerTest
    {
        protected override string ExpectedOutput => "Z";
        protected override string Input => "A";

        [Test]
        public void Then_output_should_be_Z()
        {
            Assert.That(_result, Is.EqualTo(ExpectedOutput));
        }

        [Test]
        public void Then_mock_was_called()
        {
            Assert.That(_mockOfA.WasCalled, Is.True);
        }

        [Test]
        public void Then_mock_input_argument_was_A()
        {
            Assert.That(_mockOfA.Arguments.actualInput, Is.EqualTo(Input));
        }

        [Test]
        public void Then_mock_input_option_came_from_stubB()
        {
            Assert.That(_mockOfA.Arguments.actualOption, Is.EqualTo(_stubOfB.Option));
        }
    }
}
```

## Abstract Test Fixture Pattern

In the example above, code duplication was avoided because of the lack of adequate test coverage. In this final example, duplication is further removed with use of abstract test fixture clases. In addition, the words "arrange" and "act" are mixed into the picture for method names. Is that better, neutral, or worse than the approach above? Probably just a matter of preference.

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

![Visual Studio test explorer with nested classes](/images/bestRepository_nestedClasses_nunit.png){: .center-image }

## Do Not Mock By Hand

All of these examples have shown hand-coded stubs and mocks in order to provide a higher level of transparency without the cognitive overhead of understanding a mock framework. While it is clearly feasible, in practice it is rarely desirable. Instead, switch to using a framework like FakeItEasy or Mock. For examples, see [Toolkit for .NET Unit Testing](toolkit).

------------------------------

_[Back to the introduction / table of contents](intro)_
