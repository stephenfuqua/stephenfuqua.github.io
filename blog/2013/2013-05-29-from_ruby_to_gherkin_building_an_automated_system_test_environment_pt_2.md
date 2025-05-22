---
title: 'From Ruby to Gherkin: Building Automated System Tests, pt 2'
date: '2013-05-29 11:55:29 -0500'
slug: from_ruby_to_gherkin_building_an_automated_system_test_environment_pt_2
tags:
- tech
- programming
- testing
excerpt_separator: <!-- truncate -->
---


![image depicting a ruby and gherkin](/images/fromRubyToGherkin.jpg){: .float-right .shadow .p-3 .rounded }

_Follow-up to [Building a Test Script Environment with C# and IronRuby, pt
1](/archive/2012/10/11/building_a_test_script_environment_with_c_and_ironruby_pt_1/),
wherein we change emphasis from coding tests in Ruby to writing them in English
(Gherkin) with the help of SpecFlow._

After that October post, I managed to construct a full system/regression test
suite for a key data-management application, using the combination of Ruby and
C# as described. My team has been able to go through several cycles of&hellip;

<!-- truncate -->

* Updating unit tests to reflect change requests,
* Writing code to pass the tests, and
* Getting **swift** regression test results back from the system test process
  acting on the fully-integrated code, and finally
* Running a new test file that exercises the enhancement.

Oops, there is something amiss with that: the new test file should have been
added to the system automation test suite at the outset, not at the end. That
is, "test-first" should have applied at the system level, in addition to the
unit level. But that's not the point of this article. The point is this: **at
the end, I did not have a product that a business user could easily review and
correct**.

Arguably, a non-programmer could read the code more easily, thanks to the use of
Domain Specific Language concepts. Nevertheless, there was a lot of setup code
that obscured intent, and the tests frankly _still looked daunting_ to a
non-programmer. Compounding the difficulty is the fact that the non-programmer
users are still trying to understand the _fundamentals_ of software testing, in
plain English, and without the benefit of meaningful time to study. In other
words, asking someone else to verify and maintain these tests would be throwing
them into the deep end with inadequate support. The [inspect-and-adapt](http://marcbless.blogspot.com/2011/05/agile-principle-12-inspect-and-adapt.html)
mentality suggests modifying the system testing approach.

<div class="float-right shadow p-3 rounded bg-dark text-light">
<p><b>Inspect and adapt:</b></p>
1. Tests are still too hard to read, and
1. The learning curve was too high,
1. Therefore find a simpler product.
</div>

[Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) to the
rescue! The Gherkin language provides a very simple format for writing tests in
plain English. A programmer then writes code that executes the intended actions,
in the context of an automation system. Initially I continued on the Ruby path
by trying to install RSpec as the interpreter, but I could not get it to install
properly in IronRuby. Undismayed, I revised my goal: no longer would I seek to
convert a tester into a Ruby programmer. Instead, I would encourage that tester
to write and review English-language test scenarios in Gherkin, which the
programming team would then support with code in C# using the [SpecFlow](http://www.specflow.org/specflownew/) framework.

At that point, we were working on a line-of-business application. Whereas
learning the rudiments of Ruby, and setting up the code environment, had taken a
good deal of effort, I was up-and-running with meaningful tests in SpecFlow
within a day. More importantly, the other members of my team were immediately
able to utilize and even correct small mistakes in these test scenarios. The
learning curve was negligible when presented with a working example. And at long
last, we were able to present a file containing test descriptions to a business
analyst and get direct feedback.

The IronRuby experiment was not a failure: it delivered a meaningful result.
Empirically, however, it was a less-than-satisfying result. We evaluated,
re-prioritized, and moved-on to the next iteration of our experimentation:
SpecFlow. Now we feel that we have the foundation for real organizational growth
around software testing.
