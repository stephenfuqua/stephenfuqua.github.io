---
title: A Recipe for Setting Up Automated Test Projects
date: '2012-02-15 21:04:28 -0600'
slug: a_recipe_for_setting_up_automated_test_projects
tags:
- tech
- dotnet
- testing
excerpt_separator: <!-- truncate -->
---

Assuming that you are already sold on the notion of automated testing, it can be
useful to put a little thought into how projects will be setup. There are many
approaches to this; my approach is based on experience, the wisdom in _xUnit
Test Patterns_, and standard coding best practices. I will try to keep this
language agnostic, though my examples will be in C#.

<!-- truncate -->

### Separate Projects

First, to maximize the benefit of unit testing, let's make a clear (and
industry standard) delineation between _unit_ and _integration_
testing:

* **Unit test** are in isolation from external resources, e.g. files, databases, web services; in SQL, it might be isolation from foreign keys.
* **Integration tests** utilize these resources.

One benefit of this distinction is that external resources may cause errors that
have nothing to do with your code, which therefore would be false alarms.
Another benefit is speed - the isolated unit tests will run much faster than the
integration tests, giving you feedback that much more quickly. Slow tests will
just frustrate you as you sit around waiting for them to complete, and you'll be
less likely to run them frequently.

Thus it is best to put these into separate test projects. Run all of the unit
tests very frequently, and run the integration test as often as is reasonable.
The same principle applies to any automated UI or performance tests.

### Project Setup

Each class should have its own test file, and each namespace its own folder -
just as you would do for non-test code. If a class has many methods, or some
methods require many different tests, it may be helpful to create multiple test
files for a class. For example, you might have "MyClassTest_MethodA.cs" and
"MyClassTest_MethodB.cs".

### Helper Classes

It is often useful to put some code into a static class for re-use across
multiple tests. For example, if you use Guids frequently, then create a static
Guid variable that can be re-used everywhere:

```csharp
public class Helper
{
    public static Guid GuidOne = new Guid("dd28ce17-218f-42cc-a023-caaf455cdfc5");
}
```

I've also used my Helper classes to build an object with other constant values,
where that same object will be used in many different tests.

```csharp
public const string TestPattern = "^[^ ]+";
public const string TestValue = "as df";

public static RegExTest BuildStandardTest()
{
    return new RegExTest()
    {
        Pattern = TestPattern,
        TestString = TestValue
    };
}
```

### Test Template

The basic art of testing is to know your inputs and your expected outputs. At
the code level this applies to methods / procedures; at the system level it
applies to the application; and to the user, it typically applies to particular
UI screens. Between these two sit the system under test. For a proper unit test,
the system must be isolated before it is called. Finally, you must validate the
output.

1. Prepare input
1. Isolate the system under test
1. Call the system
1. Evaluate output

Just as with regular code, test code should be well structured. As
non-production code, it might be more forgivable to take a few shortcuts; still,
comments should not be omitted. I like to put these four steps into the
comments. The name of the test should clearly indicate its purpose. If there are
multiple code paths to test for a single method, it might be challenging to come
up with meaningful names for each. Method level comments should clearly
describe, in plain English, the purpose of the test. To be a real stickler about
traceability, the method-level comments might mention a user story to which the
test applies.

Example from my [Reggie](http://reggie.codeplex.com) project (more about Moles in a
separate article):

```csharp
/// <summary>
/// A test for the TryIt method.
/// </summary>
[TestMethod()]
[HostType("Moles")]
public void t_TryIt()
{
    // Prepare input and expected values
    string pattern = "pattern";
    string testString = "testString";
    string expected = "anything will do";

    // Mockup the RegExTest class
    bool tryPatternWasRun = false;
    Reggie.BLL.Entities.Moles.MRegExTest.AllInstances.TryPatternMatch = (RegExTest iTester) =>
        {
            tryPatternWasRun = true;
            Assert.AreEqual(testString, iTester.TestString, "wrong TestString");
            Assert.AreEqual(pattern, iTester.Pattern, "wrong Pattern");
            return expected;
        };

    // Run the system under test
    string actual = ExpressionTest.TryIt(pattern, testString);

    // Validate results
    Assert.AreEqual(expected, actual, "Wrong output");
    Assert.IsTrue(tryPatternWasRun, "TryPattern wasn't run");
}
```

In some cases isolation may not be required; in this particular case, I knew
that TryIt would be calling method TryPattern, and I bypassed it. Since
TryPattern doesn't call any external resources, I didn't have to code it this
way. But by doing so, I completely isolated the TryIt method from everything
else.

The validation portion could be skipped in some cases; for example, if you
expect an exception to be thrown, many languages will let you specify an
"expected exception" rather than having to catch the exception and test its
type. For example:

```csharp
/// <summary>
/// A test for TryIt with null Pattern input.
/// </summary>
[TestMethod]
[ExpectedException(typeof(ArgumentNullException))]
public void t_TryIt_NullPattern()
{
    // Prepare input and expected values
    string pattern = null;
    string testString = "testString";

    // Run the system under test
    ExpressionTest.TryIt(pattern, testString);
}
```
