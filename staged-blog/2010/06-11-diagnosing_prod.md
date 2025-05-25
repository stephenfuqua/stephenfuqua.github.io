---
title: 'Diagnosing Production Problems: First Law'
date: '2010-06-11 15:32:11 -0500'
slug: diagnosing_prod
tags:
- tech
- sdlc
- programming

---

Stephen's first law of diagnosing problems in production: try to replicate in
test. (Assumptions: you have a test environment, you use it regularly, and it is
reasonably close to production). Sometimes you just can't replicate the problem
&mdash; for instance, it might be due to an oddity in a customer data file that
you're not allowed to run outside of production. In those cases, see if you can
use a proxy. For instance, try copying the file and masking the sensitive data,
then running it in the test environment (of course, the masking process might
cover up the error that is causing all the problems).

Production needs to stay clean, and as developers we need to keep our hands out
of it as much as possible. This is particularly true in a highly secure
environment with strong separation of duties, wherein you might have to drag a
sys admin into the picture just to get to obscure log files, for instance.
Replicate the issue, solve it, document it, and make sure everyone else in the
company is able to share in the lessons learned.
