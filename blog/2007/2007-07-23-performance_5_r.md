---
title: 'Performance #6: Reading Directly Into the Parser'
date: '2007-07-23 17:10:25 -0500'
slug: performance_5_r
tags: [tech, dotnet, performance]

---

_This article is part of the series [An Exercise in Performance Tuning in
C#.Net](/archive/2007/06/25/an_exercise_in/)_.

As I look at the code I now have, I wonder if the fileLines variable is an
unnecessary intermediate step. Can I rewrite so that `stream.ReadLine()` is
passed directly into the parsing? If I do so, I'll be leaving the file open
longer, but since no other application should be attempting to access the file,
I'm okay with that. This means moving the open file command into
`MyClass.ProcessFile()`.

<!-- truncate -->

This is what we left off with:

```csharp
// Read input file into a string
List<string> fileLines = new List<string>();
using (StreamReader stream = new StreamReader(inputFileName, Encoding.ASCII, true, 800))
{
     string line;
     while ((line = stream.ReadLine()) != null)
          fileLines.Add(line);
}

// Parse the input file
MyClass upload = new MyClass(fileLines);
upload.ProcessFile();
...
```

And here is the new code:

```csharp
using (StreamReader stream = new StreamReader(inputFileName, Encoding.ASCII, true, 800))
{
     while (stream.Peek() >= 0)
     {
          processSingleLine(stream.ReadLine());

     }
}
```

I actually made two changes here. It is possible the `stream.Peek()` statement
helped speed things up as well. This change was plainly necessary in order for
the second change &mdash; passing the result of `stream.ReadLine()` directly to
`stream.Peek()`. This bit of code is now embedded in the `ProcessFile()`
function rather than in the parent application.

Result: **82% improvement in processing time**! That's incredible. Maybe I
should explain just a bit more. The `processSingleLine()` routine is parsing out
the input file's data into various objects, and doing some manipulation along
the way. In the original version, the file was being opened by the application,
and its lines added to an array. This array (or `List<string>`) was then
passed into the `ProcessFile()` function, which basically just called
`processSingleLine()`.

By calling `processSingleLine()` directly, I end up leaving the file open for as
long as the parsing takes. In the original situation I wanted to "open late and
close early" &mdash; keep the file open only long enough to read its contents
into memory. But, here is a crucial point: in this situation, no other
application will be trying to read the file. So it does not really matter if the
file remains open. By keeping it open and passing the output from `readLine()`
into `processSingleLine()`, I eliminated the creation of a large array of
strings, which creation required considerable overhead (moving in and out of
memory).
