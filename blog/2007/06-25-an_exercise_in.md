---
title: An Exercise in Performance Tuning in C#.Net
date: '2007-06-25 19:59:27 -0500'
tags: [tech, dotnet]

---

## Problem

Your application is slow. Horribly slow. And that just isn't
acceptable.

<!-- truncate -->

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

1. [Performance #1 and #2: Clean Client / Server Interaction](./06-29-performance_1_a.md)
2. [Performance #3: CLR Profiler](./07-05-performance_3_c.md)
3. [Performance #4: Consolidate Object Creation from Database](./07-14-performance_4_c.md)
4. [Performance #5: File Buffering](./07-19-performance_5_f.md)
5. [Performance #6: Reading Directly Into the Parser](./07-23-performance_5_r.md)
6. [Performance #7: An (unsafe) Dead End](./09-21-performance_7_f.md)
