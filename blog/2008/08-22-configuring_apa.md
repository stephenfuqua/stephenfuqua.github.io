---
title: Configuring Apache (Wamp) With Additional Ports
date: '2008-08-22 20:18:36 -0500'
tags:
- tech
- devops

---

Years ago I knew how to configure the Apache webserver, back when I was a grad
student / Linux admin. As any reader will have figured out, I've been a
Microsoft-centric programmer for a number of years now. Thus it is not surprised
that I would have forgotten some basics about Apache.

<!-- truncate -->

I wanted to re-setup a WAMP environment in XP sp3 and had just downloaded
WAMPServer2. I desired to setup a root folder on the primary port and add two
more ports so that I could have "virtual directories" without the directory
(i.e. instead of `http://localhost/something_`, where the pages in
`/something_` have stylesheet references to `/_`, use   `http://localhost:81_`).

Just set up the `VirtualHost_ section, right? (dead link removed; SF 2025). Well, that didn't work.

Scrolling through the `httpd.conf_, I found another possibility: apparently now
(or has it always been this way?) you must explicitly set Apache to listen on
the particular port. Thus I now have the following Listen section, where the
last two lines are new:

```none
#
# Listen: Allows you to bind Apache to specific IP addresses and/or
# ports, instead of the default. See also the <VirtualHost>
# directive.
#
# Change this to Listen on specific IP addresses as shown below to
# prevent Apache from glomming onto all bound IP addresses.
#
#Listen 12.34.56.78:80
Listen 80
Listen 81
Listen 82
```

That did the trick :-).
