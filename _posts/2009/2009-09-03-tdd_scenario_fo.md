---
layout: page
title: TDD - Scenario for Red, Green, Refactor
date: '2009-09-03 13:53:09 -0500'
basename: tdd_scenario_fo
tags:
- tech
- dotnet
- programming
- testing
excerpt_separator: <!--more-->
---

Here's a really dumb scenario that will illustrate a point about the usefulness
of the "red, green, refactor" approach to testing and coding. Here's the
functionality - need to test whether or not a string has a value other than 1.
Let's say I write a method before any tests:

<!--more-->

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

<ol>
<li><a href="http://jamesshore.com/Blog/Red-Green-Refactor.html">Red-Green-Refactor</a> (random blogger)</li>
<li><a href="http://msdn.microsoft.com/en-us/library/aa730844(VS.80).aspx">Guidelines for Test-Driven Development</a> (Microsoft)</li>
<li><a href="http://tech.groups.yahoo.com/group/extremeprogramming/message/111829">Unit Test Rulz </a> (random forum post)</li>
</ol>
