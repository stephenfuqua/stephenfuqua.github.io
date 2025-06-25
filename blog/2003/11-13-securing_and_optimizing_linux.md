---
title: 'Securing and Optimizing Linux, pt. 1: Services'
date: '2003-11-13 17:47:07 -0600'
tags: [tech, Linux]
---

I find that Red Hat Linux (dead link removed; SF 2025) is fairly
secure by default, but could use a bit of tweaking. This is the first of a
series of notes on optimizing and improving security in Linux. Some items may be
specific to Red Hat, but most of these notes will be applicable to all systems.
In part 1, we look at _runlevel services_.

<!-- truncate -->

_This is not intended to be an all-inclusive manual. This site is called
Penguin_ Notes _, afterall!_

:::tip

June 24, 2025: it appears that the small amount of content I began with, which
eventually became my blog, was called "Penguin Notes". Presumably with the
intention of capturing lessons I learned as a Unix/Linux system administrator from
1999-2001.

:::

Be sure to turn off all services you don't need. Services in Linux are those
  background daemons and operations that you're usually not even aware of, such
  as automount, pcmcia, and ssh. The `/etc/rc.d/init.d/` directory contains the
  specifications and startup/stop scripts for these applications (maybe slightly
  different in other distributions). Within the parent directory, `/etc/rc.d`,
  are a few files called `rc`, `rc.sysinit`, and `rc.local`. Read the top of the
  respective files to learn more about what they do.

There are also several directories called `rc`_x_`.d`, where _x_ ranges from 0
to 6. Each of these corresponds to a _run level_:

* `0` - halt
* `1` - single user mode (for diagnostics)
* `2` - multiuser mode, no NFS mounting
* `3` - full multiuser mode
* `4` -unused _(I have no idea why)_
* `5` - startup in X-Windows
* `6` - reboot

Within each directory are a number of <abbr title="also called shortcuts,
created with ln -s command">soft links</abbr> to the scripts in `init.d`.
Each item begins with a letter _K_ or _S_, basically for "kill" or
"start", and a number. Scripts are run in alphabetic order, so the
lower the number, the earlier the script is run. If the first character is
anything other than an uppercase  _K_ or _S_, then the script won't be run.

So, getting back to the security point: by default there will likely be many
services in here that you don't need. For instance, you won't need pcmcia unless
you have a notebook computer. You won't need NFS unless you are serving NFS
partitions. Everything that you don't need is taking up a little bit of memory
and/or processor and, if it turns out to have a security flaw of any kind, may
be opening you up to a lot of problems. So figure out what each one does (using
the `man`; command and possibly the [Linux Documentation
Project](https://www.tldp.org) if need be), and delete those which you don't
need.

In particular keep a look out for unnecessary network protocols, such as NFS,
portmap, and xinetd. Obviously these do have their uses, but if you don't know
what they are, then you won't need these particular entries I assure you. If
your main startup mode is at the command prompt, you'll need to remove these and
other extraneous entries from `/etc/rc.d/rc3.d`. If you startup in X Windows
with a graphical login prompt, then you'll need to clean up `/etc/rc.d/rc5.d`.
Probably best to clean up both.

You probably won't ever need runlevel 2, but to be safe you should remove
unnecessary links there as well. I do not recommend messing with levels 0, 1,
or 2. These will have everything necessary by default.

_By the way, I'm sure there's an automated graphical utility for editing these
configurations, but why bother?_
