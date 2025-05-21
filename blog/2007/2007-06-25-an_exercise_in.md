---
layout: page
title: An Exercise in Performance Tuning in C#.Net
date: '2007-06-25 19:59:27 -0500'
basename: an_exercise_in
tags: [tech, dotnet]
excerpt_separator: <!--more-->
---

**Problem:** Your application is slow. Horribly slow. And that just isn't
acceptable.

<!--more-->

I had a real world problem with an application that needs to process an input
file, performing various calculations on pieces of data in each line. When
complete the app has to recreate the input file with calculation results
inserted. Goal: 3-4 minutes for a particular base line file size. Initial
version ran in 2 hours. Clearly there's a problem here. So I started wracking my
brain for everything I'd ever read or learned about performance, and more
importantly did a lot of careful searching on the 'net.

Result: down to 5.5 minutes. Still not quite there, but to say "substantial
improvement" is quite the understatement. I'll be posting a series of articles
on the resources and methods used to achieve this huge jump.


1. <a href="/archive/2007/06/29/performance_1_a/">Performance #1 and #2: Clean Client / Server Interaction</a>
1. <a href="/archive/2007/07/05/performance_3_c/">Performance #3: CLR Profiler</a>
1. <a href="/archive/2007/07/14/performance_4_c/">Performance #4: Consolidate Object Creation from Database</a>
1. <a href="/archive/2007/07/19/performance_5_f/">Performance #5: File Buffering</a>
1. <a href="/archive/2007/07/23/performance_5_r/">Performance #6: Reading Directly Into the Parser</a>
1. <a href="/archive/2007/09/21/performance_7_f/">Performance #7: An (unsafe) Dead End</a>
