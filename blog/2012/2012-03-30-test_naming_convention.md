---
title: Test Naming Convention
date: '2012-03-30 12:31:36 -0500'
slug: test_naming_convention
tags:
- tech
- programming
- dotnet
- testing
excerpt_separator: <!-- truncate -->
---

Historically I've advocated naming test methods after the method under test, in
order to help find the tests when you need to modify them. [Growing
Object-Oriented Software, Guided by
Tests](http://www.growing-object-oriented-software.com) has shown me that this
is a relic of a code-first mentality rather than good application of test driven
development, primarily in the section "Test Names Describe Features" (ch 21).
"Test driven" development implies that we do not know the name of the method
we're going to test. But we do know the functionality (feature) that we are
going after, and that knowledge should be used when writing out a test name. For
example:

<!-- truncate -->

From a [previous
post](/archive/2012/02/15/a_recipe_for_setting_up_automated_test_projects/): a
positive test for Reggie's `TryIt` method is simply named `t_TryIT`:

```csharp
[TestMethod()]
public void t_TryIt()
{
    // Prepare input and expected values
    string pattern = "pattern";
    string testString = "testString";
    string expected = "anything will do";
    ...
```

As a reader, I can't easily divine the purpose of this test. It could be
improved with `t_TryIt_Positive` perhaps. But what is the functionality under
test? The user story's acceptance test might have been something like "Try a
simple regular expression with a matching pattern". Well, then name it that:

```csharp
[TestMethod()]
public void TryASimpleRegularExpressionWithAMatchingPattern()
{
    // Prepare input and expected values
    string pattern = "pattern";
    string testString = "testString";
    string expected = "anything will do";
    ...
```

Perhaps I wouldn't want to put such a long name into my production code, but it
certainly helps the reader understand what I am testing and why. Additionally,
the name helps the reader to understand why I've chosen the inputs as such;
there is nothing "magic" about them. They are just simple examples. They don't
exercise boundary conditions are fixate on a particularly thorny regular
expression.

This also implies that tests for a particular class should only be grouped
together in a TestFixture if the functionality logically goes into the same test
fixture. That fixture should also be named after functionality rather than a
class, especially since _the class shouldn't exist yet when initially writing
the tests_ (except when adding functionality to an existing class, of course).
That said, there's a good chance it will work out this way anyway: if the
features need to be split between different Test Fixtures, that probably implies
that they should also be split into different classes in order to maintain
simplicity and coherence (cf [Single Responsibility
Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)).

