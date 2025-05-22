---
layout: page
title: Rediscovering C++  / Performing SQL Bulk Copy Operations
date: '2011-11-13 13:53:58 -0600'
basename: rediscovering_c_performing_sql_bulk_copy_operations
tags:
- tech
- programming
excerpt_separator: <!--more-->
---

When last I worked with C++, it was while working on my master's thesis ten
years ago, using a basic text editor in a Red Hat Linux 5.0 installation. A new
task in front of me: replace a Reporting Services report, which was exporting to
CSV, with a new solution that will allow me to create multiple files, with max
150,000 records each. The first challenge is speed: with that many records, only
bulk copy will be reasonable. The second is splitting the file. I thought about
calling BCP from a C# process, because unfortunately managed code only offers
bulk loading _into_ a SQL Server database, not _from database to file_. But C++
is another story, thanks to the [Bulk Copy Driver
Extensions](http://msdn.microsoft.com/en-us/library/ms130922.aspx) made available by Microsoft. So, time for a C# developer to brush
up on C++, and learn it the Visual Studio way!

<!--more-->

To get started, I found the <a href="http://sqlserversamples.codeplex.com/">
Microsoft SQL Server Community Projects &amp; Samples</a> site, and the Bulk
Copy functions documentation linked above. Download the project samples to get a
quick-start on coding for bulk copy operations; I found the projects [
How to bulk copy a SELECT result set](http://www.bahaullah.org/bahji/worthy-trusthttp://msftdpprodsamples.codeplex.com/wikipage?title=SS2005!README%20How%20to%20bulk%20copy%20a%20SELECT%20result%20set%20%28ODBC%29&amp;referringTitle=Home), [
BulkCopyFormatAndData](http://msftdpprodsamples.codeplex.com/wikipage?title=SS2005!README%20BulkCopyFormatAndData&amp;referringTitle=Home), and [
How to process ODBC errors](http://msftdpprodsamples.codeplex.com/wikipage?title=SS2005!README%20How%20to%20process%20ODBC%20errors%20%28ODBC%29&amp;referringTitle=Home) particularly useful for my goal. Creating a new
Visual C++ console application, I was able to quickly stitch together a working
prototype that would perform a hard-coded query, using a hard-coded ODBC
connection name, and bulk-loading to a hard-coded file. It displayed any error
messages at the console. In customizing the error logging, I re-taught myself
about sprintf (actually, [sprintf_s](http://msdn.microsoft.com/en-us/library/ce3zzk1k%2528v=vs.80%2529.aspx))
and [stringstream](http://www.cplusplus.com/reference/iostream/stringstream/).
The ODBC driver does not always provide a helpful message, so I threw together a
few methods for testing whether or not I could create a file (for writing the
BCP output and BCP error files) or whether or not a file exists already (for the
BCP format file), using the [
CreateFile](http://msdn.microsoft.com/en-us/library/windows/desktop/aa363858%2528v=vs.85%2529.aspx) function for both.

Next I decided to re-learn how try/catch works in the C++ world, and chose to do
so without the Microsoft __finally extension ([resource 1](http://www.cplusplus.com/doc/tutorial/exceptions/), [
resource 2](http://msdn.microsoft.com/en-us/library/6dekhbbc%2528v=VS.90%2529.aspx)). I was most surprised when I found that a compilation failure
was due to my use of the _new_ keyword, as in `throw new MyException()`. It also
took me a few tries to get the syntax correct for overriding the what() method
for my custom exception, which is inheriting from the STL's exception class. It
came down to getting the correct modifiers on the declaration in the header
file, combined with a problem I ran into several times: using the expected
namespace in the code file. That is, I couldn't simply put `virtual const char*
what()` into my code file &mdash; I needed to put `virtual const char* MyException::what()`. Perhaps I needed a
`using namespace` statement to avoid this.

Garbage collection is basically taken for granted in C#, but I know it is all up
to me in C++. With the help of a Stack Overflow Q&amp;A on [Memory
Management in C++](https://stackoverflow.com/questions/76796/memory-management-in-c), I am starting to explore this arena. Perhaps creating a
custom Exception class wasn't such a good idea; I'm forgetting the cardinal rule
that you don't use it for program flow, although it sure does simplify my code
(a sub-function throws an exception, and I don't have to code for various return
values after each invocation of that sub-function). Not only that, but throwing
exceptions makes it more likely that you'll end up with memory leaks. In fact,
even as I'm typing this I realize that I have foolishly failed to properly
de-allocate a resource (see below; would have avoided this in C# through the
`using (...)` construct). This Q&amp;A led me to do some searching on
stack-allocated constructors, turning up [
When to use "new" and when not to, in C++?](https://stackoverflow.com/questions/679571/when-to-use-new-and-when-not-to-in-c). Now I have some understanding of
the lack of_ new_ in the exception-throwing.

```cpp
HANDLE h = CreateFile(filePath, GENERIC_READ, 0, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
if (h == INVALID_HANDLE_VALUE)
{
	throw MyException(filePath);
}
CloseHandle(h); // not de-allocated if the exception is thrown!
```

Alternately, I could wrap this all in a try/catch, add `CloseHandle(h)` into the
catch and re-throw the exception. Or, I could simply put the `CloseHandle(h)`
inside the `if` clause, before the `throw` statement.

Now I've moved on to creating a DLL and linking that to my main executable, with
the hard-coded values changed into class variables that have proper [
getters and setters](https://stackoverflow.com/questions/760777/c-getters-setters-coding-style) (didn't want to use the proprietary Properties offered
by Microsoft). Running against a deadline, I may try to use this DLL from C# so
that I can perform the file manipulation (splitting by 150,000) in familiar
code. But how hard can it be to split a file in C++? Surely not too difficult.
