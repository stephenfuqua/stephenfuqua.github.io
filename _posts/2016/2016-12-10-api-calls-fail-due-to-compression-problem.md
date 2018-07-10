---
layout: page
title: API Calls Fail Due to Browser Compression
date: 2016-12-10
comments: true
tags: [dotnet]
sharing: true
---

## Problem

I had just upgraded NuGet packages - a seemingly innocent thing to do. Everything compiles fine and I tried to run my ASP.NET WebAPI service. Testing in Postman works fine, but when I try to let the browser call an endpoint (any endpoint), I get a mysterious 500 server error with a rather unhelpful payload message of `{"message":"An error has occurred."}`. However, even with Chrome accessing the service, a breakpoint in the endpoint showed me that the code was executing fine. The problem is clearly occurring inside the ASP.NET engine when trying to send the response back to the browser.

## Solution

Chrome sends several headers that Postman does not, so I tried copying those headers into Postman to see if any of them made the difference. About half of them required use of the Postman interceptor, and I decided to do some googling before fiddling with that. Couldn't turn anything up. I couldn't even find a way to trace down the error, although I had a nagging feeling that the compression header might be related, since it was one of the key headers that Postman wouldn't send (`Accept-Encoding:gzip, deflate, sdch`).

And that's when I suddenly remember to look at the Windows Event Viewer. And sure enough, in the Application log I find a pair of error messages:

1. Server cannot set status after HTTP headers have been sent.
1. The directory specified for caching compressed content `C:\Users\XYZ\AppData\Local\Temp\iisexpress\IIS Temporary Compressed Files\Clr4IntegratedAppPool` is invalid. Static compression is being disabled.

My hunch was right: something wrong with the compression. Why did this suddenly occur? I have no idea. I hadn't deleted files out of Temp recently. My NuGet package upgrades were for ancillary libraries, but not for ASP.NET itself. But the solution was trivial: as suggested by [Event ID 2264 -- IIS W3SVC Configuration](https://technet.microsoft.com/en-us/library/cc735199(v=ws.10).aspx), I just had to create the directory manually, and then everything was working again.