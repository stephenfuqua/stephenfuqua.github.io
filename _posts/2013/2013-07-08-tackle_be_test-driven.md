---
layout: page
title: 'Be Test-Driven'
date: '2013-07-08 21:23:28 -0500'
basename: tackle_be_test-driven
tags:
- tech
- programming
- testing
excerpt_separator: <!--more-->
---

Executable tests are the best form of requirements documentation. They improve
quality through early discovery of bugs and by fostering a more detailed
"what-if" analysis: what if we have this input X? What if the user does Y?

<!--more-->

Whenever possible , methods and classes should be covered by unit tests that
isolate the functionality: from a database, from file system or web access, and
even from other classes. This will likely require extensive use of interfaces,
factories, and dependency injection. Use test doubles (stubs, mocks, etc) and/or
a mocking framework.

Follow a test-driven development (TDD) mentality, where you the programmer,
possibly _in collaboration with_ a dedicated tester, write tests before and as
you are coding. Allow design to emerge from the tests. Write unit tests that
handle a various input data, include so-called edge cases (the boundaries, of
and just beyond, what is acceptable or normal input).

{: .float-right}
```none
      /\
     /  \
    / UI \
   / ---- \
  / system \
 / -------- \
/    unit    \
--------------
```

Consider the "testing pyramid" at right, drawn by Mike Cohn*: unit tests are the
most important form of test. Then add in system tests (he calls the "service
tests" but I just like "system" better). At last, if needed, add UI tests. But
if your code is well designed, all code except for that which drives the UI
itself will already be covered. The unit tests prove that the methods and
classes work as intended, and the system tests prove that they are well
integrated / work together as intended.


System tests can be expressed in a simple way using Gherkin or Fit. These
encourage English language descriptions of the _behavior_ of the system. When
programmers, business analysts, and users collaborate to define system
specifications by describing behavior, then they are practicing behavior-driven
development (BDD), a variant on TDD. These specifications make excellent
requirements, in that they are both easy to understand and easy to execute.

And don't forget to run those unit tests constantly, system tests at least
daily, and if you have them,a thin set of UI tests daily as well. Preferably,
run the system more frequently &mdash; the faster you get and deal with
feedback, the better your quality will be. The programmer should be running
tests every few minutes when in full-on TDD mode. In addition, automated-build
systems can be configured to run tests every time code is checked into the
source control, or on a nightly basis; this is especially useful for unit tests,
since they are already separated from all I/O dependence and no one must setup
the build server "just right" (but it is best to strive for an environment that
facilitates full integration of the system test framework as well).

## Preferred Tools

* _Unit test execution:_ <a href="http://msdn.microsoft.com/en-us/library/dd264975.aspx">Microsoft Unit Test Framework</a>, built into Visual Studio
* _Unit test mocking framework:_ <a href="http://code.google.com/p/moq/">MoQ</a>
* _System/Specification tests:_ written in <a href="https://github.com/cucumber/cucumber/wiki/Gherkin">Gherkin</a> using <a href="http://www.specflow.org/specflownew/">SpecFlow</a>
* _Automated-build:_ <a href="http://www.cruisecontrolnet.org/">CruiseControl.Net</a>, or <a href="http://msdn.microsoft.com/en-us/magazine/jj721597.aspx">Team Foundation Server</a> if you have it.
    * Note: <a href="http://msdn.microsoft.com/en-us/library/hh549175.aspx">Microsoft Fakes</a> might be an excellent framework, but since it is based on Moles, I am <a href="/archive/2012/04/moles-no-longer-fit-for-unit-tests.html">leery of it</a> except when working with legacy code that you can't afford to refactor &hellip; yet. The "stubs" part is equivalent to Moq, but the latter has been around longer and is thus better established.
* _Source Control:_ most of my experience is with <a href="http://www.accurev.com/">AccuRev</a> (and VSS years ago). AccuRev has its merits, but I wouldn't necessarily recommend it over TFS, SVN, GIT, etc. Personally, I just want to make sure that the tool has atomic transaction support, has good branching/merging, and is well integrated with the rest of the toolset.

## Resources

### Books

<ul>
<li><a href="http://www.growing-object-oriented-software.com/">Growing Object Oriented Software Guided by Tests</a> (<a href="/archive/2012/05/review-growing-object-oriented-software-guided-by-tests.html">my review</a>)</li>
<li><a href="http://xunitpatterns.com/">XUnit Test Patterns</a></li>
<li><a href="http://www.agiletester.ca/">Agile Testing: A Practical Guide for Testers and Agile Teams</a></li>
<li>* Cohn's diagram is in <a href="http://www.succeedingwithagile.com/">Succeeding with Agile Software Development Using Scrum</a></li>
<li><a href="http://www.manning.com/kawalerowicz/">Continuous Integration in .Net</a></li>
</ul>

### Articles

<ul>
<li><a href="http://docs.behat.org/guides/1.gherkin.html">Writing Features - Gherkin Language</a>, a worthy companion to the official documentation in the link above</li>
<li><a href="http://www.jamesshore.com/Blog/Red-Green-Refactor.html">Red, Green, Refactor</a>, the critical attitude required for TDD</a>
</ul>

### Related posts from this blog

[/tag/testing](/tag/testing)
