---
layout: page
title: Sanitize Your Database Inputs!
date: '2007-10-10 20:33:37 -0500'
basename: sanitize_your_d
tags: [tech, database]
excerpt_separator: <!--more-->
---

<p style="background: white!Important; overflow: scroll;">
<img src="https://imgs.xkcd.com/comics/exploits_of_a_mom.png" width="666" height="205" />
From <a href="https://www.xkcd.org/">www.xkcd.org</a>

That's reason number 1 to use  stored procedures in your application code
&mdash; they automatically sanitize your SQL (assuming you <a
href="http://www.owasp.org/index.php/Testing_for_SQL_Injection#Stored_Procedure_Injection">aren't
dynamically</a> executing  statements inside the procedure).

Stephen's top 4 reasons for using stored procedures rather than inline SQL:

<!--more-->

1. Sanitizes input by completely wrapping the data in the assigned data type, so
   that a input parameter `@param1 varchar(5)` will always treat `val '` or
   `'1'='1` as `val ''` &mdash; with the apostrophe escaped and all the
   characters beyond 5 dropped (or even rejected as an error).
1. Completely separates database and application logic.
1. Makes deployment of database changes and fixes much simpler (compared to
   redeploying application code, especially in a client-server environment).
1. If procedures are saved in their own .sql files, makes it easy to re-use bits
   of code without having to dig through application code.

## Comments

_imported from old Movable Type blog_

> author: paul\
> date: '2007-10-29 14:26:26 -0500'
>
> Stored procs are all well and good  but if the  end user doesnt have
> permission to execute  statements like that in the first place. You can remove
> the ability to use ddl in ad hoc statements just give them select permissions
> if thats what they are  doing right ^ ^ Least priveledge all
