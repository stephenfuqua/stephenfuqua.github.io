---
title: TDD - Scenario for Red, Green, Refactor
date: '2009-09-03 13:53:09 -0500'
slug: tdd_scenario_fo
tags:
- tech
- dotnet
- programming
- testing

---

Here's a really dumb scenario that will illustrate a point about the usefulness
of the "red, green, refactor" approach to testing and coding. Here's the
functionality - need to test whether or not a string has a value other than 1.
Let's say I write a method before any tests:

<!-- truncate -->

```csharp
public static bool MyMethod(string value)
{
    return value.Equals("1");
}
```

And let's say I write my test:

```csharp
[Test]
public void t_MyMethod_NotOne()
{
    bool returnValue = false;
    MyMethod("2");
    Assert.IsFalse(returnValue);
}
```

The test will always pass! I wrote it incorrectly, I forgot to set `returnValue
= MyMethod("2")`. If instead I had written this test with a "red, green,
refactor" mindset, then I would have immediately seen that the test was green
when it should be red &mdash; and then I would go back and realize that I had
written the test incorrectly.

Good related links:

1. [Red-Green-Refactor](https://www.jamesshore.com/v2/blog/2005/red-green-refactor) (random blogger)
2. [Guidelines for Test-Driven Development](https://msdn.microsoft.com/en-us/library/aa730844(VS.80).aspx) (Microsoft)
3. Unit Test Rulz (dead link removed; SF 2025) (random forum post)
