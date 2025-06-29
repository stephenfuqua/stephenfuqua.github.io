---
title: AJAX RESPONSE Parsing Exception
date: '2007-08-08 15:27:13 -0500'
tags: [tech, dotnet]

---

## Problem

In newly AJAX-enabled .Net 2.0 page, buttons that redirect user to
another page are suddenly throwing the following error:

```none
Sys.WebForms.PageRequestManagerParserErrorException: The message received from
the server could not be parsed. Common causes for this error are when the
response is modified by calls to Response.Write(), response filters, HttpModules,
or server trace is enabled. Details: Error parsing near
'<BODY><ASP_SMARTNAV_'.
```

<!-- truncate -->

Specifically, I had a small landing page with a few checkbox and a few buttons.
I had wrapped these in an AJAX UpdatePanel. Below the panel is a Save button and
a Reset button. These trigger updates to the UpdatePanel.

## Solution

[Eilon Lipton's
Blog](https://weblogs.asp.net/leftslipper/sys-webforms-pagerequestmanagerparsererrorexception-what-it-is-and-how-to-avoid-it)
fully describes what is going on. My buttons inside the UpdatePanel were
redirecting to another page. The fix was simple &mdash; add the buttons as
regular `PostBackTrigger`s so that the UpdatePanel would complete the postback
properly.
