---
title: 'C# + IronRuby: Building Automated System Tests, pt 1'
date: '2012-10-10 22:16:06 -0500'
slug: building_a_test_script_environment_with_c_and_ironruby_pt_1
tags:
- tech
- programming
- testing

---

We build a lot of console applications, and Windows services, that process
inbound and outbound files in one way or another. Most depend on configuration
data and some load (or unload) business data from a database, in addition to
accessing the files. Testing these has always been a chore, to say the least:
configurations change, data are deleted, and there's never enough time. After
building a few rudimentary tools that have helped, necessity, and [Agile Testing: A
Practical Guide for Testers and Agile Teams](http://www.goodreads.com/book/show/5341009-agile-testing), has convinced me that it is
time to get serious about system/integration test automation, just as I did
about unit test automation a few years ago. This is the first of a n-part series
of posts on this process

<!-- truncate -->

First, what is the rationale? What is this "necessity", or rather _necessities_?
Respecting proprietary business matters, let&rsquo;s say&hellip;

1. There&rsquo;s never enough time partly because testing takes too much time.
1. The repetitive nature of manual testing makes it (a) boring, and (b) easy to mess up.
1. Because of both of these factors, I am loathe to delegate much testing to others. On the one hand I feel bad about pushing things on others just because I don&rsquo;t want to do them; on the other hand, I have trouble trusting results that I did not generate myself.
1. There is an active interest from others to be more involved in testing; bringing them in will free me up for more interesting projects, and, objectively speaking, provide a good check-and-balance.

Automation can help with all of these factors, and more. Having come to that
conclusion, what are the goals for this project?

* Time is still hard-to-come by, so as with any agile project, build only what is needed right now and then start using it. This argues against a fancy UI for now, and in favor of simple test scripts.
* Build components for auto-loading configuration and business data, as needed, into the database. These components should themselves be well-tested, and do not need to be created in the language used for the test scripts.
* Provide a simple and familiar mechanism for saving that configuration data, e.g. csv via Excel.
* These are "business-facing" tests, and they should be readable, with minimal training, by business users and non-programming testers. This argues for creation of a [domain-specific language](http://en.wikipedia.org/wiki/Domain-specific_language), use of a scripting language that that does not stand on ceremony, and possibly introduction of [Behavior Driven Development](http://behaviour-driven.org/) (BDD) tools.
* Maintain all scripts in source control.

These goals rule out the normal .Net languages. A dynamic scripting language is
more appropriate. From the many out there, Ruby seems to be the most obvious
choice. With the help of [IronRuby](www.ironruby.net/), the
data-access components can be written (and fully testinged) in C#, while
scripts are written in Ruby. [RSpec](http://rspec.info/) might
eventually be used for BDD. Follow-up posts will dig into some of the
implementation details, as well as the lessons learned along the way.
