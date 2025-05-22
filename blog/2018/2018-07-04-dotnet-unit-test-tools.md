---
title: .NET Unit Test Tooling in 2018
date: 2018-07-04
tags: [testing, dotnet]
sharing: true
---

It is 2018, and I have only just learned about the fantastic [FluentAssertions](https://fluentassertions.com/) framework. Seems like a nice time for a quick review of unit testing tools for .NET. Personal preferences: NUnit, FluentAssertions, Moq.

## Test Framework

[MSTest](https://en.wikipedia.org/wiki/Visual_Studio_Unit_Testing_Framework), [NUnit](http://nunit.org/), [XUnit](https://xunit.github.io/) - they are all useful. They are all well-integrated into Visual Studio now. I would not make a strong argument against any choice for a team that already knows the tool. For new development, I would unhesitatingly choose NUnit.

I used XUnit for the [FlightNode project](https://github.com/flightnode). I enjoyed the flexibility with the assertion statements. I did not like the enforcement of only one assertion per unit test. The theory is that multiple assertions make it more difficult to know which thing failed (do yourself a favor and add a message in the assertion to solve this!) and you do not get verification on the assertions written below the one that failed. The latter is a valid point, but I have very rarely found this to be a problem in the real world. Ultimately, I ended up spending too much time writing method signatures and extracting shared functionality in the name of small tests with one assertion. I also found that my XUnit tests were hard to maintain as the style caused me to extract so much into private functions, thus reducing the readability of any individual test.

MSTest at this point might be as good as NUnit - I have not investigated in a long time. The _unit test_ first mentality of NUnit and its strong testing of exceptions and async make me a believer. Also, while Microsoft is a great company and all… I like promoting a diverse ecosystem.

## Assertions

At another time, the richer set of assertions available in NUnit was a big factor in its favor over MSTest. Although I don't buy the single assertion per test mentality, I do agree that they should be clear and expressive. In the JavaScript world, I've come to enjoy the _should_ style of assertions in [Chai](http://www.chaijs.com/guide/styles/). Only recently did I learn of a similar library for .NET, [FluentAssertions](https://fluentassertions.com/), although it is several years old.

1. This style helps me think about the value I'm testing first, rather than thinking about the assertion statement first
1. It is easier to read.
1. The assertion error messages are beautiful.
1. The breadth and depth of the [syntax](https://fluentassertions.com/documentation) is awe-inspiring.

Trivial comparison from an XUnit test

```csharp
Assert.Equal(expected, system.Body);
/*
Message: Assert.Equal() Failure
Expected: hi
Actual:   (null)
*/
```

Becomes

```csharp
system.Body.Should().Be(expected);
/*
Message: Expected system.Body to be "hi", but found <null>.
*/
```

## Mocking

[Moq](https://github.com/moq/moq4) is hands-down the winner. [NSubstitute](http://nsubstitute.github.io/) looks interesting and might be viable competition; however, it has been around for 8 years and personally I've never run into a project that uses it. RhinoMocks was great in its time, I'm sure, but the syntax is not as nice as Moq. And while the founder's personal repository has had a handful of commits in recent years, the official repo hasn't seen a commit since 2010 - whereas Moq is very much alive, with multiple releases in 2018. Ancient. [And slow](http://codebetter.com/aaronjensen/2008/05/08/mock-framework-benchmarks/). Old code that still uses RhinoMocks should be updated.

## A Note on `AutoFixture`

Looking back at FlightNode, I was confused by some code I wrote two years ago. What is this `Fixture.Freeze` code about? Apparently I have completely forgotten about [AutoFixture](https://github.com/AutoFixture/AutoFixture). It was probably an interesting experiment. It may have even been beneficial. But I do not even know what's going on when I look at my own tests. No doubt a quick review of AutoFixture's documentation would suffice to bring me up to speed. At this moment, I have no argument for or against it.
