---
title: Comparing Assertion Libraries for .NET Framework
date: 2018-12-03
tags: [testing, dotnet, programming]
---

Working with a legacy codebase using NUnit and .NET Framework, I've found that
there is a mix of NUnit assertions and assertions using the
[Should](https://github.com/erichexter/Should/) library. This library is rather
old and, frankly, limited compared to
[Shouldly](https://shouldly.readthedocs.io/en/latest/) and
[FluentAssertions](https://fluentassertions.com). These newer two frameworks are
significantly more expressive, with APIs that cover myriad situations elegantly.
Questions in front of me:

1. Are any of these libraries really worthwhile compared to simply using NUnit's
   built-in assertions - either traditional or Assert.That style?
2. If using any independent framework, which is the best choice for this code
   base?
3. If selecting Shouldly or FluentAssertions, ought we to upgrade the old
   asserts?

My conclusion: favor Shouldly. Upgrade old asserts opportunistically for
consistency, but no need to go out of the way.

<!-- truncate -->

:::tip

_Full source code for these experiments is at [https://github.com/stephenfuqua/AssertionComparison](https://github.com/stephenfuqua/AssertionComparison)_.

:::

## Why Use a Separate Library

Some argue that the assertion library simply ought to be independent of the unit
test framework, allowing greater flexibility in switching between frameworks.
Switching unit test frameworks in a large legacy project sounds rather tedious,
so that alone is an insufficient reason.

One problem I've run into frequently in legacy code is people switching up the
expected and actual responses. In classic NUnit, `expected` comes first. This
situation is better with the NUnit3 `Assert.That` style; however, the values are
still hidden away inside of the assertion method call.

```csharp
Assert.AreEqual(expected, actual); // old style
Assert.That(actual, Is.EqualTo(expected)); // new style
```

When a coder reverses the traditional style, and you need to fix a broken test,
it can get a bit confusing to figure out what is going on (especially if the
variables are not so clearly named). In the course of writing this project,
while switching back and forth between styles, I realized I had made this
mistake myself - wanting to put the actual result first and then compare it to
the expected.

If continuing to use NUnit3, this alone is a good reason to switch to the new
Constrain Model. The three fluent frameworks evaluated here address this by
putting the actual result at the beginning of the assertion statement:

```csharp
actual.Should().Be(expected); // FluentAssertions, and Should in Fluent mode
actual.ShouldBe(expected); // Shouldly
actual.ShouldEqual(expected); // Should
```

Another problem is coming up with a meaningful message, which is especially
important if you have multiple asserts in the same unit test (many people frown
at that, and I frown right back unless the coders are prone to large numbers of
mistakes per function). Each of these frameworks reports failures differently.
Compare these results:

* NUnit Assert: `Assert.AreEqual(-1, sum); Assert.That(sum, Is.EqualTo(-1));`
  > Expected: -1 But was: 0
* FluentAssertions: `sum.Should().Be(-1);`
  > Expected sum to be -1L, but found 0L.
* Should: `sum.ShouldEqual(-1);`
  > Should.Core.Exceptions.EqualException : Assert.Equal() Failure Expected: -1
  > Actual:   0
* Shouldly: `sum.ShouldBe(-1);`
  > Shouldly.ShouldAssertException : sum should be -1L but was 0L

The latter three all provide more information than the first. Of these, I find
the FluentAssertion response to be the most elegant for its compactness and
precision.

## Documentation and Richness

Compared to the other two bolt-on libraries, FluentAssertions clearly has the
best documentation. Detailed and rich with examples, it was easy for me to find
the right syntax for the job. It also clear that the library has extensive
support for value types, references types, collections, and exceptions.

Shouldly's documentation seems to be a work-in-progress. I was unable to find
documentation of their exception handling syntax - I had to look for the
functions in the object browser.

Should's documentation is brief but relatively complete given that it is a
smaller package. Looking at the repo, it also clear that the project hasn't been
touched in many years. This could mean that it simply works - but it also means
that others have passed it by in the meantime.

## Exception Handling

To get a sense of the syntax richness, let's look at exception handling. Aside:
In NUnit, I never use the `[ExpectedException]` attribute as I prefer to have
the assert clearly visible in the method body.

### NUnit Outer Exception

```csharp
Assert.Throws<ArgumentNullException>(RunNullSeries); // old style
Assert.That(RunNullSeries, Throws.ArgumentNullException); // new style
```

### Fluent Assertions Outer Exception

```csharp
((Action)RunNullSeries)
    .Should()
    .Throw<ArgumentNullException>();
```

### Should Outer Exception

```csharp
((Action)RunNullSeries)
    .ShouldThrow<ArgumentNullException>();
```

### Shouldly Outer Exception

```csharp
((Action)RunNullSeries)
    .ShouldThrow<ArgumentNullException>();
```

There is not much difference between these. Fluent Assertions requires one extra
method call. This is a general philosophical difference: it wants you to call
`Should()` first every time, and then exposes the full API. What I like about
this is that it presents a more consistent looking interface, compared to
combining elements together (e.g. `ShouldThrow`, `ShouldBe`, etc.) This might
just be a matter of style.

## Inner Exception Handling

Both Fluent Assertions and Shoudly make it easy to also check on an inner
exception. So does the new NUnit3 Constraint Model. With the other two
frameworks, you're left with catching and inspecting the exception.

### NUnit3 Constraint Model Inner Exception

```csharp
Assert.That(RunSeriesWithNullValue,
        Throws.TypeOf<CalculatorException>()
            .With.InnerException.TypeOf<InvalidOperationException>());
```csharp

#### Fluent Assertions Inner Exception

```csharp
((Action)RunSeriesWithNullValue)
    .Should()
    .Throw<CalculatorException>()
    .WithInnerException<InvalidOperationException>();
```

### Shouldly Inner Exception

```csharp
((Action)RunSeriesWithNullValue)
    .ShouldThrow<CalculatorException>()
    .InnerException
    .ShouldBeOfType<InvalidOperationException>();
```

## Execution Time

Across thousands of tests, execution time for these asserts could certainly add
up. Here is one place where FluentAssertions is not as attractive. I wrote the
same tests in each framework and ran them many times. The results below are
representative of the typical results in repeated executions:

<div class="text--center">
![Overall execution times](/img/execution-times-summary.png)
</div>

Yikes! What's going on here? Let's drill into the results a bit...

<div class="text--center">
![Detailed execution times](/img/execution-times-fa-detail.png)
</div>

There is one test that makes up nearly 80% of execution time. And it is a
trivial test:

```csharp
[Test]
public void TempVariable()
{
    var sum = AggregateCalculator.Sum(1, -1);

    sum.Should()
        .Be(-1); // purposefully wrong
}
```

Running that one test repeatedly, by itself, I see similar results. When I run
multiple tests, that one test always seems to take the longest. Applying the
\[Order] attribute to the another test, to force another one to run first, the
longest time shifts to that test. Thus it seems to be a bootstrapping thing
(reflection?) with FluentAssertions - the first test seems to take much longer
to execute. Subtract out the effect of that one test, and FluentAssertions
performs better than classical NUnit asserts but a little bit worse than the
others.

It is also interesting to see that the Constraint Model of NUnit3 performs very
well. The most time-consuming assertion there is for the ArgumentNullException.

## Conclusion

The execution time differences are troubling. This sample code base may too
small to read too much into it, but this is an important finding and something
to watch out for. Based on documentation and richness of syntax I would want to
use Fluent Assertions, but if the project has a large number of tests, the small
performance difference could add up to a meaningful increase in total execution
time. If time to fully evaluate is lacking, then I feel that my best choices are
to either (a) focus on Assert.That syntax or (b) upgrade Should to Shoudly and
perhaps make time to pitch in on improving the documentation. Leaving existing
Should tests in place would seem to be harmless since the performance is good.

| Framework | Documentation | Richness | Performance |
|----------|-------------|---------|--------------------|
| NUnit3 (Classic) | ++ | + | / |
| NUnit3 (Constraint) | ++ | ++ | ++ |
| FluentAssertions | +++ | +++ | - |
| Should | + | + | ++ |
| Shouldly | + | ++ | ++ |
