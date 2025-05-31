---
title: Updating the GUI Before a Method Completes
date: '2008-04-28 09:50:39 -0500'
slug: updating_the_gu
tags:
- tech
- dotnet
---

As a Web developer whose formal programming training focused only on console
applications and simple GUI apps, it was not immediately obvious to me how to
update a (Windows Forms) GUI while a method was still running. Once I decided it
was worth the effort to learn how to do so, I was not surprised to find that it
is rather easy, using `BeginInvoke()`.

<!-- truncate -->

## Problem

I have a long-running method and want to update the mouse cursor
asynchronously. More accurately, I need to span a couple of methods. There is an
image in a `PictureBox` from which the user needs to select a slice, and the
user wants to be able to move the selection window around the image without
redrawing the box ("redrawing" is of course from the user's perspective; from
the programmer's perspective, the box is redrawn each time it is moved). I want
to use `this.Cursor = Cursors.Hand` in the MouseDown event, leave it in this
state during the MouseMove event, and restore the cursor to `Cursors.Default` in
the MouseUp event.

## Solution

Create a delegate method, i.e. `public delegate void
InvokeDelegate();`. Create a couple of functions that handle the cursor change:

```csharp
/// <summary>
/// Changes the cursor to a hand
/// </summary>
private void cursorMove()
{
     this.Cursor = Cursors.Hand;
}

/// <summary>
/// Changes the cursor back to the default
/// </summary>
private void cursorDefault()
{
     this.Cursor = Cursors.Default;
}
```

Finally, path these method names into `InvokeDelegate` whilst using [`BeginInvoke(Delegate
method)`](https://learn.microsoft.com/en-us/dotnet/api/system.windows.forms.control.begininvoke):

```csharp
private void pbxMain_MouseDown(object sender, MouseEventArgs e)
{
     ...
     this.BeginInvoke(new InvokeDelegate(cursorMove));
     ...
}

private void pbxMain_MouseUp(object sender, MouseEventArgs e)
{
     ...
     this.BeginInvoke(new InvokeDelegate(cursorDefault));
     ...
}
```
