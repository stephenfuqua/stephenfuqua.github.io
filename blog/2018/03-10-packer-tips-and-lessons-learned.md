---
title: Packer Tips and Lessons Learned
date: 2018-03-10
tags: [tech, devops, Windows]
---

[Packer](https://www.packer.io) is a cross-platform tool for scripting out virtual machine images. Put another way: use it to create new virtual machines with fully automated and repeatable installations. No clicking around. Some of the benefits:

1. Startup fresh virtual machines from a pre-created, Packer-based image in seconds instead of hours.
1. Use the same scripts to create a local VM, a VWMARE instance, or a cloud-based virtual machine.
    * _in other words, you can test your virtual machine creation process locally_
1. Helps you maintain a strategy of infrastructure-as-code, which can be version-conrolled.

<!-- truncate -->

While Packer can be combined with many other useful tools, at its heart it is a simple json template file that starts up a virtual machine, provisions it with files, and runs scripts on it. For a primarily-Windows shop, this means running Powershell scripts.

[In search of a light weight Windows vagrant box](http://www.hurryupandwait.io/blog/in-search-of-a-light-weight-windows-vagrant-box) by Matt Wrock has many interesting optimizations. Evaluate each option carefully to decide if it is right for you, and to decide which options should be used with which builders. For example, if building for a corporate IT environment, running standard Windows Update might not be appropriate - you may need to run a group policy to install only approved updates. Mr. Wrock has many great [templates for creating vagrant boxes](https://github.com/mwrock/packer-templates) that leverage Packer; studying them can be of great benefit when learning how to employ Packer in your own environment. Another great collection to use or study: [boxcutter's Packer Templates for Windows](https://github.com/boxcutter/windows).

[Best Practices with Packer and Windows](https://hodgkins.io/best-practices-with-packer-and-windows) lives up to its name and has a great Lego table-flip GIF. I particularly appreciated the suggestion of chaining multiple build templates together - although you do need to watch out for disk space consumption when you create multiple images, one building off of another. This article mentions running `sysprep`, a built-in Windows tool for genericizing a customized image. It does things like removing the Windows product key and other personalization settings. There may be a better way around it, but I'm not well-versed enough in Windows server setups to know how to avoid a pernicious little problem: if you chain multiple builds together with a typical sysprep configuration, then the second build will fail. It will be hung up on asking you to provide a product key! So I found it best to keep sysprep only in the final build in the chain. When running sysprep on AWS or Azure be sure to follow the specialized instructions for those environments ([AWS](https://david-obrien.net/2016/12/packer-and-aws-windows-server-2016/), [Azure](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/build-image-with-packer)).

Finally: transferring "large" files into a Windows image using the file provisioner is incredibly slow, because it runs over the WinRM protocol that is designed more for instructions than file transfer. Some builders support a [built-in HTTP server](https://www.packer.io/docs/provisioners/windows-shell.html#packer_http_addr) for faster file transfers. But not all. A few options to overcome this:

1. Download install files over the Internet
    1. Do you trust that the download link will stay alive and not be hijacked? Depends on the source. If you don't, then it might be useful to create your own mirror.
    1. Downloading from the Internet can be tricky as you might not want your image-in-creation to have full Internet access, or you might be running locally on a virtual switch that is "internal only".
1. Download from local HTTP server
    1. You could put all of your files into an HTTP server that is local - on the computer that is running `packer` / `packer.exe`.
    1. This works for local images but not cloud-based images.
1. Hybrid approach - inject a cloud-based URL for cloud-based image creation and a local URL for local image creation.
