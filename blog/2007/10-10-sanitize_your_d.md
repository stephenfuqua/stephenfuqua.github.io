---
title: Sanitize Your Database Inputs!
date: '2007-10-10 20:33:37 -0500'
tags: [tech, database]

---


<div class="image">
![exploits of a mom - xkcd comic](https://imgs.xkcd.com/comics/exploits_of_a_mom.png)

From [www.xkcd.org](https://www.xkcd.org/)
</div>

That's reason number 1 to use  stored procedures in your application code
&mdash; they automatically sanitize your SQL (assuming you [aren't
dynamically](http://www.owasp.org/index.php/Testing_for_SQL_Injection#Stored_Procedure_Injection) executing  statements inside the procedure).

Stephen's top 4 reasons for using stored procedures rather than inline SQL:

<!-- truncate -->

1. Sanitizes input by completely wrapping the data in the assigned data type, so
   that a input parameter `@param1 varchar(5)` will always treat `val '` or
   `'1'='1` as `val ''` &mdash; with the apostrophe escaped and all the
   characters beyond 5 dropped (or even rejected as an error).
1. Completely separates database and application logic.
1. Makes deployment of database changes and fixes much simpler (compared to
   redeploying application code, especially in a client-server environment).
1. If procedures are saved in their own .sql files, makes it easy to re-use bits
   of code without having to dig through application code.
