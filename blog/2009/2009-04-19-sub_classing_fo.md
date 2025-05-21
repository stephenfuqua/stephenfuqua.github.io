---
layout: page
title: Sub classing for automated testing
date: '2009-04-19 15:55:26 -0500'
basename: sub_classing_fo
tags:
- tech
- dotnet
- testing
excerpt_separator: <!--more-->
---

A few months after I first purchased it, I am still reading <a
href="http://xunitpatterns.com/">xUnit Test Patterns</a>. Been reading a few
pages every day - now on page 590 with a few hundred to go!

I have finally arrived at the point where the author describes the pattern <a
href="http://xunitpatterns.com/Test-Specific%2520Subclass.html">Test Specific
Subclass</a> (TSS). This is a pattern we have used extensively in our testing at
the office, so that we can access protected methods in our classes. However, we
stumbled upon it on our own, well before reading anyone else's suggestions on
how to apply it. That's the nature of _patterns_ for you.

<!--more-->

One problem I have noticed with it is that the code coverage (NCover, Visual
Studio Team Suite) tools get confused by this, thinking that we are testing the
test but not the actual system. Well, the solution is pretty clear, but it took
the book to point it out to me: the sub-class should not be the test itself.
Instead, the sub-class should be a new class that is called by the test.

Let's say we have a class called MyClass that we want to test, and it has a
private method called doSomething(int inValue) and returns an int:

```csharp
class MyClass
{
    private int doSomething(int inValue)
    {
        int value = inValue + 1;
        return value;
    }
}
```

In order to test this, we turn the private method into a protected one. We
definitely do not want public. After reading about TSS, we'll continue to do
that. But, here's the way we were writing the test:

```csharp
[Test]
class tMyClass : MyClass
{
    [Test]
    public void t_doSomething()
    {
        int inValue = 1;
        int expected = 2;

        int actual = base.doSomething(inValue)

        Assert.AreEqual(expected, actual, "Expected \""
            + expected.ToString() + "\" but actual was \""
            + actual.ToString() + "\"");
    }
}
```

Instead of that, we will have more flexibility, and the code coverage tools will
probably work better, if we do the following:

```csharp
class MyClassTestStub : MyClass
{
    public override int doSomething(int inValue)
    {
        return base.doSomething(inValue);
    }
}

[Test]
class tMyClass
{
    [Test]
    public void t_doSomething()
    {
        int inValue = 1;
        int expected = 2;

        MyClassTestStub sut = new MyClassTestStub();

        int actual = sut.doSomething(inValue)


        Assert.AreEqual(expected, actual, "Expected \""
            + expected.ToString() + "\" but actual was \""
            + actual.ToString() + "\"");
    }
}
```
