---
title: Configuring RP-PPPOE in Red Hat Linux 9
date: '2003-11-09 18:03:32 -0600'
slug: configuring_rpp
tags: [tech, Linux]

---

I finally got DSL again a few months ago, after 2 years of dial-up. Worked like
a charm on my iBook, but not so on the Linux box. Actually, it wasn't so bad at
first, but the DNS lookups were taking forever. Then it started dropping
carrier. Often. To the point where, after a few minutes of using the computer,
it was dropping every few seconds. Here's how I fixed it.

<!-- truncate -->

## Relevant System Parameters

* Red Hat Linux 9
* tulip and rt1839 chips in two network cards (for masquerading, of course)
* SBC Yahoo! DSL

## Symptoms

* dropping carrier every few seconds
* can't see the internal network (ping can't find the computer), even with all ip filtering turned off

## Hardware

I thought it was a hardware issue at first, for when I removed one of my cards
everything worked. I could either connect to the outside world or to the inside
world without a hitch. So I went out and bought a cheap DLink card to replace
the SMC I had taken out.

That didn't solve it. So I went Googling.

## Googling

I found [one post](https://web.archive.org/web/20030831201842/http://eagle.coledd.com/pipermail/alug/2002-December/000101.html)
out there that looked helpful, suggesting that there is a timeout conflict going
on in the `ifcfg-ppp0` file. One of the listed symptoms was a strange
error message reading "Inactivity timeout... something wicked happened on
session 4214," which I hadn't at first noticed in my log file. So I tried their
suggestion of shortening the `LCP_INTERVAL`.

Much to my surprise, this didn't work either. But I had a feeling I was on the
right path. And then I remembered that I have a DSL connection at work that has
never timed out. I forget about it because I never have to do anything with that
box other than log in periodically to install security updates.

So I SSHed over, tried to look at the `ifcfg-ppp0`, and was stumped. No
`ifcfg-ppp0`. (box = Mandrake 7 upgraded to 8). But I did find a file
called `pppoe-config`, I think, in `/etc/ppp/`. And this file had
the settings I wanted. And indeed, it had some very different timeout numbers. I
copied these over, and vo&iacute;la, I've not had a problem since!

## The Settings

So the thing that did it was changing both the `PPPOE_TIMEOUT` and the
`LCP_TIMEOUT`. Here's (most of) the end-product in my
`ifcfg-ppp0`:

```env
USERCTL=no
BOOTPROTO=dialup
NAME=DSLppp0
DEVICE=ppp0
TYPE=xDSL
ONBOOT=yes
PIDFILE=/var/run/pppoe-adsl.pid
FIREWALL=NONE
PING=.
#PPPOE_TIMEOUT=20
LCP_FAILURE=3
#LCP_INTERVAL=80
LCP_INTERVAL=20
PPPOE_TIMEOUT=80
CLAMPMSS=1412
CONNECT_POLL=6
CONNECT_TIMEOUT=60
DEFROUTE=yes
SYNCHRONOUS=no
ETH=eth0
PROVIDER=DSLppp0
USER=_redacted_
PEERDNS=yes
```
