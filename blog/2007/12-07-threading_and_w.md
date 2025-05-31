---
title: Threading and Waiting with Delegates
date: '2007-12-07 10:33:45 -0600'
slug: threading_and_w
tags: [tech, dotnet]

---

One of the casualties of not having a full computer science education is that I
was barely exposed to threading. In my two Java classes we touched upon it, and
wrote some basic examples in the second semester, but that could hardly be
called extensive use. Thus, a number of years on, it has been a bit of a
struggle for me to use threads in a practical manner. Further complicating the
matter is that I've wanted to use anonymous methods (aka delegates) and
generally want to do some work after _all_ threads have finished executing.

<!-- truncate -->

Unfortunately most of the examples I've found deal with one or the other, but in
a manner either too simplistic for what I wanted or at cross purposes. For
instance, they look pretty static in terms of the number of threads spawned, or
don't deal at all with waiting until the threads have finished, or just don't
explain themselves very well. But at last I've found the final piece I needed,
in [Working with Delegates Made Easier with C#
2.0](https://www.codeguru.com/csharp/working-with-delegates-made-easier-with-c-2-0/).

I tried creating an array of `WaitHandle` objects, but somewhere got something
wrong. I'm sure they're perfectly usable. But then the article above showed me
that all I really needed was the `AutoResetEvent`. And in fact, all I needed was
_one_ such object. Then to instantiate my thread I used a `delegate` &mdash; but
did not declare a _new_ `delegate`, an early mistake of mine.

This anonymous method runs another function that takes an input paramete, and
eventually, when all threads are finished, releases the `AutoResetEvent`.
Thankfully the code knows how to figure out how many threads will be spawned.
Finally, run the `WaitOne` method on the instance of `AutoResetEvent` in order
to pause execution of the rest of the program until all threads are finished.

```csharp
/* Trying to process a bunch of files in a directory. */
FileInfo[] readyFiles = tmpDir.GetFiles();

/* These two variables are the key to signaling that all threads are done. */
AutoResetEvent are = new AutoResetEvent(false);
long numberLeft = readyFiles.Length;

/* Loop through all the files. Could've used a foreach loop, but for is slightly faster */
for (int i = 0; i < readyFiles.Length; i++)
{
     FileInfo f = readyFiles[i];

/* Start a thread with an anonymous method */
     ThreadPool.QueueUserWorkItem(delegate(Object obj)
     {
          try
          {
/* A private function in the same class that does some action on the input file */
               this.runTheProcess(f);
          }
/* I found that the thread would loop infinitely if I tried to let exceptions go, therefore I just catch the exceptions and add them to a list. */
          catch (Exception ex)
          {
/* Important to lock this global list, otherwise can get a race condition. */
               lock(this._excpList)
               {
/* Actually, its a Dictionary<string, Exception> so that I can capture the file name and the exception together. */
                  this._excpList.Add(f.FullName, ex);
               }
          }
          finally
          {
/* Important to have this in the finally. Initially it was in the try. I
purposefully created an error condition. When I noticed that the threads never
stopped, I realized it was because this code had not been hit. */
               if (Interlocked.Decrement(ref numberLeft) == 0)
                  are.Set();
          }
     });
}

/* Wait for all the threads to finish. */
are.WaitOne();
```
