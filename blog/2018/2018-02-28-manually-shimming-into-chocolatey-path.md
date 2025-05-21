---
layout: page
title: Manually Shimming An Application Into the Chocolatey Path
date: 2018-02-28
comments: true
tags: [devops, os]
sharing: true
---

Recently I installed MongoDb using Chocolatey, and was surprised to notice that the executables weren't placed into the Chocolately path. Chocolatey uses a shimming process to [automatically add executes to PATH](https://chocolatey.org/docs/features-shim). This is really quite nice.

I can imagine scenarios where I have command line executables that weren't installed by Chocotely that I would like to add to my path easily. Or a scenario like this where I want to address something that someone forgot to build into the choco package. Thankfully manually calling the `shimgen` executable to create a new shim is quite trivial:

```PowerShell
c:\ProgramData\chocolatey\tools\shimgen.exe --output=c:\ProgramData\Chocolatey\bin\mongodump.exe --path="..\..\..\Program Files\MongoDb\Server\3.6\bin\mongodump.exe"
```

The only key thing to notice is the _relative_ path constraint.
