---
title: Down With Comment Spam
date: '2007-11-29 22:35:30 -0600'
slug: down_with_comme
categories:
- tech
- meta
---

Frequent blog readers will easily recognize comment spam: unrelated or gibberish
comments posted to entries. I've been getting a ton of them with phrases like
"cool site. Thanks!". In the old Movable Type I knew how to filter these out.
With the new I wasn't sure, and have been too lazy to figure out the proper
regular expression syntax. Thankfully someone came to [my rescue](http://www.lifewiki.net/sixapart/SpamLookupRecipes):
`/(cool|excellent|good|nice)(\s)+site\.(\s)+(thank(\s)+you|thanks)/i`.

## Comments

_imported from old Movable Type blog_

> author: Chad Everett\
> date: '2007-11-30 10:38:01 -0600'\
> url: http://everitz.com/
>
> Glad you enjoyed it.  I hope it helps.  :)
