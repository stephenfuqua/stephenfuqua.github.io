---
title: Rethrowing Exceptions Is a Dangerous Business
date: '2007-07-09 04:21:14 -0500'
slug: rethrowing_exce
tags: [tech, dotnet]
excerpt_separator: <!-- truncate -->
---

**Problem**: in Visual Studio's debugger, you've landed on an Exception
statement. You look at the stack trace but it just points back to a custom
exception class you've created. But you know that code is good, it can't be
throwing the error. What's going on here?

**Solution**: this is an easy mistake to make. I've run it across it in code
from a number of people, and recall making the mistake myself at one point. The
problem is most likely due to nested throws to a new custom exception.

<!-- truncate -->

Let's say you have a custom exception class, `CustomError`, inheriting from
`System.Exception`. Further, let's say that you have an application that calls a
function `libraryFunction()` which in turn calls another function
`innerFunction()`. Both of them take all exceptions and wrap them in
`CustomError` (which perhaps does some logging that you don't get with
`System.Exception`). In psuedocode, you have something like:

```csharp
private class CustomError : Exception
{
     public CustomError() : base() { }
     public CustomError(string message) { this.Message = message; }
  }

  private void libraryFunction()
  {
     try
     {
          ...
          innerFunction();
          ...
     }
     catch (Exception ex)
          throw new CustomError(ex.Message);
  }

  private void innerFunction()
  {
     try
     {
          ...
     }
     catch (Exception ex)
          throw new CustomError("Something awful happened");
}
```

Now, if you're debugging your application and you run across an exception coming
from `libraryFunction()`, the stack trace will report that the error came from
`CustomError` instead of `innerFunction()`. You won't be able to see that it
came from line _x_ in `innerFunction()`. Thankfully there are several ways that
we can and should clean up this code.

**1. Do we really need `try` in `innerFunction()`?**

That is, is there really any point to catching the exception within
`innerFunction()`? There very well could be some good point, but often times it
is just out of habit. Maybe its best to just let the exception propagate
directly through to `libraryFunction()`. Throwing exceptions is expensive, in
terms of performance. You should do so only when circumstances clearly justify
it.

**2. Use inner exception**

One way to avoid losing the stack trace is to use the `InnerException` property.
You might want to add a constructor in `CustomError` that takes the exception
itself as an argument, along with a string for a more customized message:

```csharp
public CustomError(Exception inner, string message)
{
     this.InnerException = inner;
     this.Message = message;
}
```

Now you have both the original stack trace and the possibility to customize your
error message.

**3. Rethrow without new**

If for some reason you really need to throw `CustomError` in `innerFunction()`,
then you'll have better performance &#8212; and no loss of information &#8212;
if you specifically catch `CustomError` and rethrow it as is, without using new:

```csharp
private void libraryFunction()
{
     try
     {
          ...
          innerFunction();
          ...
     }
     catch (CustomError)
          throw;
     catch (Exception ex)
          throw new CustomError(ex, "Another awful thing happened");
}
```

Now, if I had fully read the [Exception
Management Architecture Guide](http://msdn2.microsoft.com/en-us/library/ms954599.aspx), I'm sure I could have explained this all in
more technically precise language. Then again, maybe (hopefully) its more
intelligible in this form =).
