---
title: 'Visual Studio Says: "Failed to create component"'
date: '2007-07-17 20:27:07 -0500'
slug: visual_studio_s
tags: [tech, dotnet]
excerpt_separator: <!-- truncate -->
---

**Problem:** "Failed to create component" error pops up when dragging a custom
Windows Forms control from the Toolbox onto a form. Offending line: `foreach
(Attribute att in Assembly.GetEntryAssembly().GetCustomAttributes(true))`.

**Background:** I have started building a custom DLL containing items for re-use
between different Windows Forms projects. An obvious candidate is an About
window. I created this as a custom control in the DLL project; the control
contains a textbox, which I want to fill with the application name, the version,
copyright information, and company name. All of this is to come from the
AssemblyInfo.cs file, using System.Reflection where necessary:

<!-- truncate -->

```csharp
string copyright = string.Empty;

foreach (Attribute att in Assembly.GetEntryAssembly().GetCustomAttributes(true))
{
     if (att is AssemblyCopyrightAttribute)
          copyright = (att as AssemblyCopyrightAttribute).Copyright;
}

string txt = Application.ProductName + "\n"
+ "Version " + Application.ProductVersion + "\n"
+ copyright + "\n"
+ Application.CompanyName;
```

**Solution:** First, I comment out the `foreach` block to see if I can now drop
the user control into the form. Rebuild dll, re-drop user control&hellip;
vo&iacute;la! But this is interesting looking&hellip;

<p class="center">{Image file no longer available}</p>
<!--
<p style="text-align: center;">
<img alt="about1.jpg" src="http://www.safnet.com/writing/tech/about1.jpg" width="304" height="149" />
-->

Apparently the Reflection works even in Visual Studio rather well ;-) &mdash;
but the assembly doesn't have embedded custom attributes. So now that I have
this in the form, let's try uncommenting the offending lines so that I can
again see the copyright information. Close the form, re-open&hellip; and again I
get an error, though this time it is simply "object reference not set to an
instance of an object."

Let us run this application and see if it works, despite the problem with
loading it. The answer is yes! (Screenshot not included).

Lesson: don't be surprised if Reflection tells you something about Visual
Studio itself. Work around any errors and trust that it will work properly once
your application is running (that is, assuming you worked around in such a way
that you can still compile).
