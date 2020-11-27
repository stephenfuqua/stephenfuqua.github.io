---
layout: page
title: 'C# + IronRuby: Building Automated System Tests, pt 1'
date: '2012-10-10 22:16:06 -0500'
basename: building_a_test_script_environment_with_c_and_ironruby_pt_1
tags:
- tech
- programming
excerpt_separator: <!--more-->
---

We build a lot of console applications, and Windows services, that process
inbound and outbound files in one way or another. Most depend on configuration
data and some load (or unload) business data from a database, in addition to
accessing the files. Testing these has always been a chore, to say the least:
configurations change, data are deleted, and there's never enough time. After
building a few rudimentary tools that have helped, necessity, and <a
href="http://www.goodreads.com/book/show/5341009-agile-testing">Agile Testing: A
Practical Guide for Testers and Agile Teams</a>, has convinced me that it is
time to get serious about system/integration test automation, just as I did
about unit test automation a few years ago. This is the first of a n-part series
of posts on this process

<!--more-->

First, what is the rationale? What is this "necessity", or rather _necessities_?
Respecting proprietary business matters, let&rsquo;s say&hellip;

<ol>
<li>There&rsquo;s never enough time partly because testing takes too much time.</li>
<li>The repetitive nature of manual testing makes it (a) boring, and (b) easy to mess up.</li>
<li>Because of both of these factors, I am loathe to delegate much testing to others. On the one hand I feel bad about pushing things on others just because I don&rsquo;t want to do them; on the other hand, I have trouble trusting results that I did not generate myself.</li>
<li>There is an active interest from others to be more involved in testing; bringing them in will free me up for more interesting projects, and, objectively speaking, provide a good check-and-balance.</li>
</ol>

Automation can help with all of these factors, and more. Having come to that
conclusion, what are the goals for this project?

<ul>
<li>Time is still hard-to-come by, so as with any agile project, build only what is needed right now and then start using it. This argues against a fancy UI for now, and in favor of simple test scripts.</li>
<li>Build components for auto-loading configuration and business data, as needed, into the database. These components should themselves be well-tested, and do not need to be created in the language used for the test scripts.</li>
<li>Provide a simple and familiar mechanism for saving that configuration data, e.g. csv via Excel.</li>
<li>These are "business-facing" tests, and they should be readable, with minimal training, by business users and non-programming testers. This argues for creation of a <a href="http://en.wikipedia.org/wiki/Domain-specific_language">domain-specific language</a>, use of a scripting language that that does not stand on ceremony, and possibly introduction of <a href="http://behaviour-driven.org/">Behavior Driven Development</a> (BDD) tools.</li>
<li>Maintain all scripts in source control.</li>
</ul>

These goals rule out the normal .Net languages. A dynamic scripting language is
more appropriate. From the many out there, Ruby seems to be the most obvious
choice. With the help of <a href="www.ironruby.net/">IronRuby</a>, the
data-access components can be written (and fully unit-tested) in C#, while
scripts are written in Ruby. <a href="http://rspec.info/">RSpec</a> might
eventually be used for BDD. Follow-up posts will dig into some of the
implementation details, as well as the lessons learned along the way.
