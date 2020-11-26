---
layout: post
title: WindowsXP Service Pack 2 Warning
date: '2004-08-05 10:47:51 -0500'
basename: windowsxp_servi
tags: [tech, os]
excerpt_separator: <!--more-->
---

In the next day or two Microsoft will come out with its long-heralded, major
updates to WindowsXP, known as Security Pack 2. The updates for SP2 take care of
usability, default settings, and security bugs/holes. A new security pack from
Microsoft is always a major step forward&hellip; but in my experience always
comes with a few bugs itself.

<!--more-->

The conventional wisdom for years amongst tech geeks is to NEVER install a
Windows NT/2000/XP service pack until it has been out for at least a month. Let
others deploy the software, find and report the problems, document them on many
different websites, and give Microsoft a chance to SP1 (which I had to
completely uninstall from my sister's computer recently and start all the
security update installations again from scratch). I have probably reinstalled
Windows because it was "broken" by a security patch.

Overall the chances of having something major go wrong are slim. <a href=
"http://techrepublic.com.com/5100-6264-5222856.html">Tech Republic</a> can tell
you about some of the specific warnings with the last pre-release (beta) version
of the service pack. Some, maybe even all, of these problems may have been
eliminated. But Microsoft has a lot of pressure on them to get this software
released, and that typically leads to more bugs.

If you have firewall software or hardware in place, and if you use the latest <a
href="http://www.mozilla.org">Mozilla FireFox</a> or <a href=
"http://www.netscape.com">Netscape Navigator</a> web browser instead of Internet
Explorer, then I heartily recommend waiting at least a month or two before
installing SP2 (read on for how to do this). If you do not have both of these in
place, and your computer is constantly connected to the Internet, then it may be
wise to take the risk and install the software. To install the software, just
run Windows Update or use Internet Explorer to go to
[http://windowsupdate.microsoft.com](http://windowsupdate.microsoft.com). Of
course, you still might want to wait a week or two, or get the update early in
the morning or late at night, to avoid the day-time traffic slow-down that will
occur at microsoft.com.

Now, to avoid installing WindowsXP: most people have Automatic Updates turned
on. This means that you periodically get a little message pop up near your
Windows clock telling you that there are new updates to install. I think this
asks you if you would like to review the updates before installing. Do that. You
should have a chance to click off of Windows XP Service Pack 2. For those who
manually update your systems through Windows Update, then next time you run the
update (you are running them, right?) be sure to deselect SP2 after clicking on
the Review and Install button.

To maximally protect yourself, I recommend these steps:

1. Install a firewall
   * HARDWARE: Install a hardware firewall between you and your broadband
     connection (i.e. cable modem or dsl modem). I got mine for under $40 at
     Fry's, from a company called Airstream. I don't recommend D-Link's, for
     while it is cheap it has some problems in the default configuration.

   * OR SOFTWARE: If you are on a dial-up connection still, or can't afford the
     $40, and you have a relatively fast computer, then setup up a software
     firewall. Windows XP has a software firewall built in. <a href=
     "http://www.microsoft.com/athome/security/protect/windowsxp/firewall.aspx">
     Turn that on</a>. If you don't trust Microsoft or if you are reading this
     even though you don't have WindowsXP, you can download a free version of
     Zone Labs's <a href=
     "http://www.zonelabs.com/store/content/catalog/products/sku_list_za.jsp">
     Zone Alarm</a> firewall software.

1. Switch to <a href=
      "http://www.mozilla.org/products/firefox/switch.html">Mozilla
      Firefox</a>, as recommended by Homeland Security.

1. Backup all important data on your computer. That means everything on your
   desktop and My Documents. And if you use Outlook or Outlook Express you'll
   need to hunt for your mail files to backup them. I don't know about Outlook
   Express, but Outlook typically stores its mail file in `c:\documents and
   settings\&lt;YOUR LOGIN NAME&gt;\Application
   Data\Microsoft\Outlook\outlook.pst` (most computers will hide the ".pst"
   extension on your file). In some cases there is a "Local Folders" directory
   in between &lt;YOUR LOGIN NAME&gt; (which means substitute in the name you
   logon to Windows as) and Application Data. Now, Application Data and Local
   Folders will be hidden from you most likely, so in Windows Explorer (i.e. My
   Computer) click on Tools then Options. In the second tab, I think (I'm typing
   on a mac, so can't check) there is a list of display options that includes
   "Don't show hidden files". Uncheck that one to see Local Folders and
   Application Data. That should have you covered for backup, I hope.
1. In September, install SP2 manually from Windows Update. Read the release
   notes before hand to know what is changing. After installing, be sure to
   immediately reboot. Then run Windows Update again to see if there are any
   patches FOR SP2.
1. Be happy =).
