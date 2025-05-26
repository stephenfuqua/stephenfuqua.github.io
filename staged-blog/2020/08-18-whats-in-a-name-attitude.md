---
title: "What's in a Name? Attitude."
date: 2020-08-18
tags:
- discourse
- justice
- inclusion
- tech

---

Last month my manager asked me about changing our naming convention for the
primary "source of truth" in source code management: from "master" to… well,
anything but "master." I admit to initial hesitancy. I needed to think about it.
After all, it seems like the name derives from the multimedia concept of a
"master copy." It's not like the terribly-named "master-slave" software and
hardware patterns. Or is it?

<!-- truncate -->

---

From 1996 to 2001 I spent near countless hours in two buildings on the
University of Texas campus: RLM Hall and an un-named annex to the Engineering
Science Building. Soon neither will exist: the one renamed, the other
demolished. Reflecting on this I feel a small sense of empathy, but no sympathy,
for others' whose cherished institutions are being renamed. It was well past
time to change the one's name, and the other had outlived its usefulness.

This business of identifying that which needs to change, and then quickly acting
on it, has gathered incredible momentum at last in 2020, as the people of the
United States grapple with the double pandemic of a ruthless virus and endemic
racism. Collectively we have barely moved the needle on either front: but there
_is_ movement.

Symbols must be re-evaluated and removed when they are found wanting, whether
they are statues or names. Robert Lee Moore Hall honored a man who operated at
the pinnacle of his profession and yet was, apparently, an [outright
segregationist](https://thedailytexan.com/2018/02/11/robert-lee-moore-hall-needs-renaming).
Not that any of us knew that. As an undergraduate and graduate student in
Physics at UT, 52% of my classes where held in that building. I studied in its
library and in the undergraduate physics lounge. I split time working part and
full time between RLM and that unnamed building, in the High Energy Physics Lab.
I remember more misery than joy there, but mostly extreme stress. There is no
love lost for that frankly odious brick hulk or its even more odious name, yet
there is a feeling of losing something personal with the change of name that was
[finally accepted by the
University](https://thedailytexan.com/2020/07/13/university-to-rename-RLM-allocate-funds-support-Black-students)
a month ago.

And that just goes to show the power of a name, of a symbol. All the more reason
to change it. Time for an attitude adjustment.

The name has been found wanting and it must go. Just like that other little
building, whose utility in housing twin three-story particle accelerators had
long run out. It made way for a new building, better serving the needs of the
students. And the Physics, Math, and Astronomy Building now takes its place on
campus as, I hope, a more welcoming place for diverse groups of students,
faculty, and staff to continue advancing the boundaries of science.

---

And that's exactly what we need in software development: a welcoming place.
Detaching from the name "RLM" was quite easy. But I had to think through the
source code problem for a minute or two, rather than just rely strictly on
[GitHub's judgment](https://github.com/github/renaming). My conclusion: if it
bothers someone, then do something about it. And then I found one person who
acknowledged: yes, it is disturbing being a Black programmer and confronting
this loaded word on a regular basis (sadly I didn't hang onto the URL and can't
find the blog post right now). OK, time to change.

I started with the code repository backing this blog. Took me all of… perhaps a
minute to create a `main` branch from the old `master`, change the default
branch to `main`, and delete `master`. If I had been working with a code base
associated with a continuous integration environment it might have been a few
more minutes, but even then it is so easy, as I have already found with the
first few conversions at work. So much easier than having to print new business
cards and letterhead for all the faculty in the Physics, Math, and Astronomy
Building, assuming they still use such things.

A simple attitude adjustment is all it took: no sympathy for that which is lost,
for the way we've always done things. Instead, a quick and painless removal of a
useless reminder of a cruel past.

---

Steps taken to change this blog's source code repository:

1. Create the main branch<br>
   ![Screenshot showing creation of main branch](/img/main-create-branch.png)
2. Switch the default from `master` to `main`<br>
   ![Screenshot showing change of default branch](/img/main-switch-default-branch.png)
3. Change the branch used by GitHub Pages<br>
   ![Screenshot showing change to the GitHub Pages branch](/img/main-change-gh-pages.png)
4. Finally, delete the old branch<br>
   ![Screenshot showing deletion of old branch](/img/main-delete-old.png)
