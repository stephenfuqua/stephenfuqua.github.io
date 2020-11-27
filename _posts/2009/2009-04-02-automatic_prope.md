---
layout: page
title: Automatic Properties in C# 3.0
date: '2009-04-02 22:39:43 -0500'
basename: automatic_prope
tags:
- tech
- dotnet
- programming
excerpt_separator: <!--more-->
---

We just upgraded our servers to support .Net 3.x, so at last I'm able to start
migrating some of my code. I haven't taken a close look at all the features
available yet, but one that caught my eye and initially excited me is <a
href="http://community.bartdesmet.net/blogs/bart/archive/2007/03/03/c-3-0-automatic-properties-explained.aspx">automatic
properties</a>. However, I had two conflicting reactions:

<ol>
<li>This is great, I don't have to create a private field and write getter/setter in a public Property anymore.</li>
<li>But then what's the point of not just creating a public field and using it directly?</li>
</ol>

Well, <a
href="http://community.bartdesmet.net/blogs/bart/archive/2007/03/03/c-3-0-automatic-properties-explained.aspx">this
article</a> addresses a primary benefit: this facilitates refactoring. If, for
instance, we find later on that we need something more advanced than a simple
get or set statement, then we can add it without breaking the interface. I'm
sold.
