---
title: Viewing Embedded Images in HTML E-mail (Base64)
date: '2008-01-11 13:10:28 -0600'
slug: viewing_embedde
tags:
- tech
- dotnet

---

**Problem**: you have image data from an HTML e-mail, but don't know what to do
with it. When you save it to disk it comes out with a weird string instead of
binary data.

**Solution**: pretty simple, you just have to know the terms. This string of
data is actually Base64 encoded, which means that the binary data has been
converted to a text string for easy transmission over text protocols. [.Net Developer's Journal](http://dotnet.sys-con.com/read/192527.htm)
has a good full explanation. All you have to do is convert the string over to a
byte array using `Convert.FromBase64String`, then save your new `byte[]`.

<!-- truncate -->

And what if the string is itself transmitted as a byte array? Well, simply
convert each byte into a char and then convert the resulting array into the new
byte array:

```csharp
// Convert "string" to chars
byte[] byteEncodedString = ...;
char[] charBytes = new char[byteEncodedString.Length];
for (int i = 0; i < byteEncodedString.Length; i++)
     charBytes[i] = Convert.ToChar(byteEncodedString[i]);

// Convert chars back to bytes
byte[] newBytes = Convert.FromBase64CharAray(charBytes, 0, charBytes.Length);

// Save
using (FileStream fs = new FileStream(mypath, FileMode.Create))
     fs.Write(newBytes, 0, newBytes.Length);
```
