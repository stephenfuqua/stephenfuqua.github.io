---
title: Change HostType["Pex"] to HostType["Moles"]
date: '2010-05-19 10:48:11 -0500'
tags:
- tech
- dotnet
- testing

---

Once again I've learned the hard way that it pays to read the release notes.
After installing Pex v0.91.x, suddenly I was having trouble running my tests in
a particular solution. It has been driving me nuts - Visual Studio was throwing
"object reference not set to an instance of an object" errors every time I tried
to run tests, and the Test View was refusing to load any test names.

Finally, I noticed that I had a few tests that were still instrumented with
HostType "pex" instead of "moles". I changed these around, and still got the
error. Closed Visual Studio, restarted, and vo&igrave;la, the tests can run, and
Test View is populated again.

[Pex and Moles - Release Notes](https://www.microsoft.com/en-us/research/project/pex-and-moles-isolation-and-white-box-unit-testing-for-net/)

<!-- truncate -->
