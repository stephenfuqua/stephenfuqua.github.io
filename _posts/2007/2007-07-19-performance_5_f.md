---
layout: page
title: 'Performance #5: File Buffering'
date: '2007-07-19 18:54:22 -0500'
basename: performance_5_f
tags:
- tech
- dotnet
- performance
excerpt_separator: <!--more-->
---

_This article is part of the series <a
href="/archive/2007/06/26/an_exercise_in/">An Exercise in Performance Tuning
in C#.Net</a>_.

It's time to stop ignoring the 800 pound gorilla in the room: `System.String`.
Scrolling all the way over in the Allocation Graph, it is clear that strings
take up most of the memory, and it seems logical that most of that comes from
the input file.

<p class="center">{Image file no longer available}</p>
<!--
<p style="text-align: center">
<img alt="filebuffer1.jpg" src="http://www.safnet.com/writing/tech/filebuffer1.jpg" width="214" height="56" />
-->

<!--more-->

40 MB total are allocated to strings. The input file I am processing is about
1.02 MB. So that's only 1/40th of the total. Let's trace back to the left with
those blue, pink, yellow, and gray lines that go into `System.String`. The blue
line traces all the way back to the `StreamReader` &ndash; the file itself.
Shockingly the `StreamReader` uses 8.0 MB. Why does it use more memory than the
file takes? Because `StreamReader` has a lot of overhead and we haven't tweaked
the buffer size, among other things. Here's the original code:

```csharp
...
StreamReader stream = new StreamReader(inputFileName);
string fileContents = stream.ReadToEnd();

// Pass file contents to upload routine
MyClass upload = new MyClass(option, fileContents, fileId);

// Begin processing file
upload.ProcessFile();
...
```

**ProcessFile:**

```csharp
// Split the inputfile string into an array based on EOL
string[] fileLines = _fileContents.Split('\n');

// Cycle through and process lines
for (int i = 0; i < fileLines.Length; i++)
{
     string singleLine = fileLines[i];
     // perform various tasks
```

I rewrote the application to use `StreamReader.ReadLine()` instead of reading in
the entire file and then parsing it by line. Seems like that might be more
efficient. I also wrapped the read in a `using {}` clause to make sure the
stream is properly disposed. This did not result in a meaningful performance
difference, but it might lead me to some other improvements later.

Then I started playing with buffer size. Each line is supposed to be 512
characters, though in the future we might have more. I tried 520, 800, and 1000
characters, and found the best performance gain with 800, though it was only
1.1% faster than before I started using `ReadLine()`. Here's what I have now:

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
```
