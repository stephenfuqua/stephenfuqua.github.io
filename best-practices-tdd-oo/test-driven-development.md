---
title: "Test Driven Development"
permalink: /best-practices-tdd-oo/test-driven-development
date: 2020-01-17
tags: [testing, programming, oo]
sidebar_position: 3
---

## Thinking Like QA

When approaching any kind of testing, every developer needs to start thinking like a tester. There are three essential questions to ask yourself when evaluating a system under test:

1. what are the expected inputs?
1. What are the expected outputs?
1. What are the dependencies?

Develop test cases to explore a reasonable set of inputs. Build test cases that explore boundary conditions:

1. Does the system behave as expected with null input?
1. Does the system behave as expected with max value input (e.g. largest integer, a string that is longer than expected, etc.)
1. Does the system behave as expected when a dependency does not behave well?

## Red-Green-Refactor

This is the classic mantra of test-driven development (TDD):

:::danger

Write a test that fails

:::

:::tip

Write code that passes the test

:::

:::info

Cleanup the code so that it is easy to understand and maintain.

:::

Note the emphasis on writing a test first. Why is that?

1. Forces you to think clearly about expected inputs, outputs, and dependencies.
1. Lets you iteratively build code that satisfies those different conditions, instead of trying to tackle the entire problem at once.
1. Allows you to safely refactor, knowing that the test(s) will catch any errors.
1. Typically results in better OO code, more closely adhering to [SOLID principles](solid-testing).

## Introducing TDD Into Untested Code

Q: How do you go about doing test-first development in legacy code that does not already have unit tests?

A: By changing to "Green-red-green-refactor". That is, write a test that the current code passes. Then modify the test to reflect new requirements, thus making the current code fail the test.

If the code is not well-structured, this can be awfully hard to do. For tips on safely restructuring your code to facilitate g-r-g-r style testing, see [Legacy Refactoring](legacy-refactoring).

## Arrange-Act-Assert

Within any given unit test, you'll have three sections of code, frequently described by the terms:

* **Arrange**: set up the inputs to the system, including dependencies. (INPUTS & DEPENDENCIES)
* **Act**: run the system under test. (SYSTEM UNDER TEST)
* **Assert**: verify that the results are correct, and potentially verifies that dependencies were used correctly. (OUTPUTS)

To improve unit test readability, it is often helpful to [use these terms](patterns) directly in the tests.

## Behavior-Driven Development

Behavior-Driven Development, or BDD for short, is a variation on TDD that is focused on describing the application's behavior in business terminology. Often times it is used with integration and acceptance tests, using real-world language based approach to describe the testing conditions (the inputs, system, and outputs). The technique of "given-when-then" is used to write a plain-(English, Spanish, etc) description of the system behavior:

> Given _some input condition_
&nbsp;&nbsp;And _another input condition_
&nbsp;When _some user or system takes an action_
&nbsp;Then _some expected output_
&nbsp;&nbsp;And _another expected output_

It should be clear that this is a reformulation of Arrange-Act-Assert. This language can be useful in TDD, especially when [structuring test classes](patterns) and methods so that the test output report is meaningful to non-developers. When writing tests as [nested classes](patterns#one-assert-per-test), I like to keep the action (which is invariant) in a parent class, changing the order to _When-Given-Then_. In ReSharper, I thus getting something like this:

<div class="text--center">
![Example When-Given-Then test results](/img/test_results_when_given_then.png)
</div>

------------------------------

_[Back to the introduction / table of contents](./readme.md)_
