---
layout: page
title: 'Performance #1 and #2: Clean Client / Server Interaction'
date: '2007-06-29 22:00:56 -0500'
basename: performance_1_a
tags: [tech, dotnet, performance]
excerpt_separator: <!--more-->
---

_This article is part of the series <a
href="/archive/2007/06/25/an_exercise_in/">An Exercise in Performance Tuning
in C#.Net</a>_.

The application I was working on makes a number of calls to a remote server to
perform operations. These calls are made through a proprietary API implemented
in .Net. Speaking with the vendor, I discovered two really dumb mistakes that
were killing our performance.

<!--more-->

The first of these was improper socket management. In the initial code I was
explicitly opening the server connection once, making remote calls in a loop
over an object collection, and assuming that it was implicitly closing at the
end of the method containing the `Open()` command. This code would crash after
about 15 iterations had been processed. Thus I thought that leaving the
connection was causing a problem, and I solved this by moving the `Close()`
_inside_ the loop. That worked, technically speaking. But the time was
atrocious.

So I went back and revisited the code. And I realized that I had misinterpreted
the original error: it was not because the connection was not explicitly closed,
it was because my code was implicitly re-opening the connection for each object.
Thus I was quickly running out of TCP/IP sockets. My big clue should have been
the fact that _I only moved the `Close()` inside the loop_! The explicit
`Open()` was still above the loop. Doh!

Therefore all I had to do was remove the implicit open from the object. Then
back in the looping method, I wrapped the loop in a
`using(<MyConnection>){ ... }` statement. This produced a 21% improvement
in processing time. Good, but the overall time was still light years beyond
acceptable.

So we called the vendor. They asked if we had logged turned on. Turns out we had
the most verbose logging! Turn that off and the process improved by 87%! That
was the single biggest factor in this entire process. But the time was still
more than 5 times greater than the goal benchmark.
