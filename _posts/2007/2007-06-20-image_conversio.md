---
layout: post
title: Image Conversion Made Easy in .Net
date: '2007-06-20 21:29:16 -0500'
basename: image_conversio
tags: [tech, dotnet]
excerpt_separator: <!--more-->
---

**Problem:** Need to convert an image from one format to another using .Net.

**Solution:** Microsoft has really made this easy. The key is the <a href="http://msdn2.microsoft.com/en-us/library/system.drawing.image(vs.80).aspx">System.Drawing.Image</a> class, combined with the <a href="http://msdn2.microsoft.com/en-us/library/system.drawing.imaging.imageformat_members(vs.80).aspx">System.Drawing.Imaging.ImageFormat</a> class.

Steps:

<!--more-->

1. In your project's References, add a reference to System.Drawing.
1. Add System.Drawing and System.Drawing.Imaging to the namespaces list in the
   class you're editing (System.Drawing may be added automatically by step 1).
1. If you have a byte stream (i.e. from a web service or a database query
   result), then you'll need to save it as a file temporarily. Use <a
   href="http://msdn2.microsoft.com/en-us/library/system.io.filestream(vs.80).aspx">System.IO.FileStream</a>
   to write the data out.
1. Open your input file (I'm converting from a JPG): `Image input =
   Image.FromFile(filePathAndName + ".jpg");`
1. Save the file with the proper format, i.e. as a TIFF:
   `input.Save(filePath + ".tif", ImageFormat.Tiff);`

And it's really that simple.
