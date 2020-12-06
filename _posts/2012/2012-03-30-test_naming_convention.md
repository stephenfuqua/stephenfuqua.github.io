---
layout: page
title: Test Naming Convention
date: '2012-03-30 12:31:36 -0500'
basename: test_naming_convention
tags:
- tech
- programming
- dotnet
- testing
excerpt_separator: <!--more-->
---

Historically I've advocated naming test methods after the method under test, in
order to help find the tests when you need to modify them. <a
href="http://my.safaribooksonline.com/book/software-engineering-and-development/software-testing/9780321574442">Growing
Object-Oriented Software, Guided by Tests</a> has shown me that this is a relic
of a code-first mentality rather than good application of test driven
development, primarily in the section "Test Names Describe Features" (ch 21).
"Test driven" development implies that we do not know the name of the method
we're going to test. But we do know the functionality (feature) that we are
going after, and that knowledge should be used when writing out a test name. For
example:

<!--more-->

From a <a
href="http://www.safnet.com/writing/tech/2012/02/a-recipe-for-setting-up-automated-test-projects.html">previous
post</a>: a positive test for Reggie's `TryIt` method is simply named `t_TryIT`:

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

As a reader, I can't easily divine the purpose of this test. It could be improved with `t_TryIt_Positive` perhaps. But what is the functionality under test? The user story's acceptance test might have been something like "Try a simple regular expression with a matching pattern". Well, then name it that:

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
simplicity and coherence (cf <a
href="http://www.objectmentor.com/resources/articles/srp.pdf">Single
Responsibility Principle</a> [PDF]).

