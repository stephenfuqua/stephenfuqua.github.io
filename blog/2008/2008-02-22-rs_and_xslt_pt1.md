---
title: 'RS and XSLT, pt1: Applying a Basic Transformation'
date: '2008-02-22 15:53:47 -0600'
slug: rs_and_xslt_pt1
tags:
- tech
- database
- sql-server
excerpt_separator: <!-- truncate -->
---

It was driving me nuts &mdash; my transforms just wouldn't apply. I tried
working with some fake data, from my little-used O'Reilly [XML in a Nutshell](http://www.oreilly.com/catalog/xmlnut3/), and that
worked fine. So why couldn't I transform my Reporting Services output? After
banging my head against this one for a while, I finally decided to mess around
with the root `<Report ... />` node, first by removing all the extra
elements (because my samples did not have any elements in the root node).
Voil&agrave;, the transform now works. Why is that?

<!-- truncate -->

Continuing with the trial-and-error approach, I discovered that it was the
"xmlns" attribute causing the problem. I looked that up and found that it is a
_namespace_. Suddenly everything became clear, since I'm quite used to
namespaces in imperative programming languages like C#, but had not seen it
before in declarative languages.

Back to O'Reilly and the section on _XSLT and Namespaces_, and I see that you
can add other namespaces to the `<xsl:stylesheet ...>` element with ease.
All I needed to do was synch up the reporting services output with my
stylesheet.

> **Root element in Reporting Services output**\
> `<Reportp1:schemaLocation="XmlTest http://reportserver?/XmlTest&rs%3aFormat=XML&rc%3aSchema=True" Name="XmlTest" xmlns:p1="http://www.w3.org/2001/XMLSchema-instance" xmlns="XmlTest">`
>
> **Original stylesheet root node:**\
> `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">`
>
> **Proper stylesheet root node:**\
> `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:rpt="XmlTest">`

Now in the transform I just have to use the assigned prefix, `rpt`, when matching the Report element: `<xsl:template match="**rpt:**Report">`.

## Update 2/28

As I'll explain again in a future post, Reporting Services seems to skip the
namespace when you apply the transformation file in the "Data transform"
property of the "Data Output" tab. That is, if no transformation is specified in
the report, the resulting XML will have the namespace. If the transformation
_is_ specified, then your transformation should assume that Reporting Services
will _not_ use the namespace. Clear as mud?
