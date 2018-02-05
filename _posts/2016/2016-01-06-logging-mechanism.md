---
layout: page
title: Logging Mechanism
date: 2016-01-06
comments: true
category: ops
tags: [toolkit]
sharing: true
---

Wow, you'd think nothing had been happening for the past two months. But that's not the case at all. There are now 6 different GitHub repositories (perhaps a few too many). November and December were heads-down coding months. But now the product is almost ready for an MVP launch... and that has me thinking about error handling. Specifically, logging.

Originally I decided to look into NLog for .NET logging, a product I've never used before. I have experience with the Enterprise Library logging block and with Log4Net, and find them both to be useful but not as... pleasant... as I would like. They don't have the interface I would prefer. But they work. It turns out NLog has basically the same interface, and the same tedious configuration.

Setting aside the logging provider for a moment, I have been deferring a decision on *what to do* with the output logs. Write a file? Send e-mail? Save to database? With files and database, I would still want an easy way to view the logs. With e-mail, I would have to configure an e-mail provider and might end up accidentally flooding an inbox. 

Long story short, I've decided to try out [Loggly](https://www.loggly.com). The free account will likely be more than sufficient for this application's needs. The free account doesn't include e-mail alerts, but I could always configure the logging utility to send e-mail if I find it really necessary.

Loggly has nice integration with Log4Net. Therefore, I'm changing the log provider to Log4net.