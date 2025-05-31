---
title: Image Conversion Made Easy in .Net
date: '2007-06-20 21:29:16 -0500'
slug: image_conversio
tags: [tech, dotnet]

---

## Problem

Need to convert an image from one format to another using .Net.

## Solution

Microsoft has really made this easy. The key is the [System.Drawing.Image](https://msdn2.microsoft.com/en-us/library/system.drawing.image(vs.80).aspx) class, combined with the [System.Drawing.Imaging.ImageFormat](https://msdn2.microsoft.com/en-us/library/system.drawing.imaging.imageformat_members(vs.80).aspx) class.

Steps:

<!-- truncate -->

1. In your project's References, add a reference to System.Drawing.
1. Add System.Drawing and System.Drawing.Imaging to the namespaces list in the
   class you're editing (System.Drawing may be added automatically by step 1).
1. If you have a byte stream (i.e. from a web service or a database query
   result), then you'll need to save it as a file temporarily. Use [System.IO.FileStream](https://msdn2.microsoft.com/en-us/library/system.io.filestream(vs.80).aspx)
   to write the data out.
2. Open your input file (I'm converting from a JPG): `Image input =
   Image.FromFile(filePathAndName + ".jpg");`
3. Save the file with the proper format, i.e. as a TIFF:
   `input.Save(filePath + ".tif", ImageFormat.Tiff);`

And it's really that simple.
