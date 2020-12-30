---
layout: page
title: Atom and Visual Studio Code, JavaScript Perspective
date: 2015-05-27
basename: atom_and_visual_studio_code
comments: true
tags: [tools]
---

Does <a href="https://code.visualstudio.com/">Visual Studio Code</a> measure up to its close kin, <a href="https://atom.io/">Atom</a>?

A friend asked me what I thought of Code. When I installed it a few weeks ago, my first reaction was: this is nice, if you're not used to Atom already. Never satisfied with a simple gut reaction, I thought for a moment, and realized that I had not looked closely at Microsoft's additions – particularly, debugging.

## Overall Impressions

Both are beautiful text editors. There is something about the presentation that makes me simply enjoy working with text files more than when I open them in Notepad++. Aesthetics are worth something. That said, Notepad++ is still a great tool and I will not be rid of it any time soon (especially for large files).

I've been using Atom daily for the past three months, and have spent just a few full days in Code. Exploring the two side-by-side, there are both clear similarities and differences. Right out of the box Code does win in one respect: it provides me with a list of recently opened files. I'm sure there's a plugin for Atom, but this should be standard.

Code changes the keybindings, but I can't let that dissuade me. Code does not have jshint built-in, a tool that has been of great help to me as I move from C# to pure JavaScript. But it does detect errors, such as undeclared variables. Code, so far, eschews the plugin architecture of Atom. For a preview release of a lightweight IDE, that probably makes sense. Atom is an interchangeable swiss army knife, and Microsoft is aiming for a dedicated code editor. That said, the rest of this review will look at four great features that are accessible from a vertical toolbar in Code, comparing them to equivalents in Atom.

## IntelliSense and Error Detection

In Atom, I have <a href="https://atom.io/packages/autocomplete-plus">autocomplete-plus</a> and it does a reasonable job of helping me finish my thoughts. But it is not a substitute for powerful IntelliSense. While there are language-specific autocomplete packages for many dialects, oddly enough I cannot find anything for JavaScript. Code, on the other hand, has some impressive auto completion, which applies equally for built-in JavaScript functionality and command-completion for local variables.

**Code**

![codeAtom_1](/images/codeAtom_1.png)

**Atom**

![codeAtom_2](http://www.safnet.com/writing/tech/images/codeAtom_2.png)

## File Explorer / Tree View

This presents open files in a list, and the application does not use the familiar horizontal tabs metaphor - instead, you see a vertical list of "Working Files". This is useful when more than a handful of files are open, but it certainly takes some getting used to, and I have not decided if I like it yet.

The list of files is perfectly useful. Code does not have the Git-status color coding of Atom, but more on Git below.

Here's an interesting feature: right-click on a file, choose Select for Compare, then right-click another file and choose Compare. You get a reasonable diff comparison. Nice, but not very functional in this setting. More important elsewhere.

Of course, Atom also has packages such <a href="https://atom.io/packages/atom-cli-diff">atom-cli-diff</a> (Git-like) and <a href="https://atom.io/packages/compare-files">compare-files</a> (GitHub-like). My first impression is that the Code diff is better, but that might be based on what I'm used to already.

Overall, I find the two different but equally useful.

**Code**

![codeAtom_3](/images/codeAtom_3.png)

**Atom**

![codeAtom_4](/images/codeAtom_4.png)

# Search

When you've opened a folder, this will search every file in the folder. And it is fast. But so is Atom's Find in Project. Code just makes it more visible through the menu bar. Both have regular expression support, and my early impression is that they are pretty well matched. That said, I do like Atom's display of the line number next to the match.

**Code**

![codeAtom_5](/images/codeAtom_5.png)

**Atom**

![codeAtom_6](/images/codeAtom_6.png)

## Git

In Atom, I have installed the Git-Control plugin. For the most part, I prefer using Bash, but occasionally it is convenient to use the development environment. Visual Studio's support is pretty good for all of the basic functions, and so is Git-Control. But I don't like the way that both of them go from unstaged to committed, seemingly bypassing staging. Although it sometimes feels like staging is an extra, unwanted step, Git has it for a reason. And it can turn out to be handy from time to time. So don't hide it from me. Code gets this right.

Remember that file compare? Now we see it shine: Code gives you quick access to viewing changes on your unstaged and staged files.

Overall, the Code interface to Git is better, except for one flaw (for now): Commit messages are one-line only. And if you push that Enter key trying to add a line break, then you've just finished your commit. Commit messages often need to be multi-lined, so I hope that Microsoft changes this.

**Code**

![codeAtom_7](/images/codeAtom_7.png)

**Atom**

![codeAtom_8](/images/codeAtom_8.png)

## Debug

There are some quirks, but this is promising. As you can see in this screenshot, variables aren't displaying for me, so I don't know what values I'm dealing with. No doubt that will improve with time. But at least it is possible to walk through the stack trace and try to understand what's going on. This is going to be powerful and is reason enough to keep this Visual Studio Code around.

That said, there is a <a href="https://atom.io/packages/node-debugger">node debugger</a> project for Atom. The pictures look promising, but even the maintainer admits it is buggy. I cannot get it to work at all - opening the debugger palette, you are presented with an opportunity to fill in a few paths. But the fields, at least in my install, are not enabled.

![codeAtom_9](/images/codeAtom_9.png)

## Conclusion

Atom is much more versatile, but Visual Studio Code is already a strong competitor. And is more stable; I've not yet experienced any bugs or program failures. I began writing this over a week ago, and decided to force myself into daily Code use before publishing. At this point, I miss a few things, but I am starting to get hooked on Code.

For more details on the features in Code, see <a href="http://www.johnpapa.net/visual-studio-code/">John Papa</a>. I purposefully avoid reading this - except the debugging overview - and other posts in order to draw my own conclusions. But this series of posts is too good not to promote.
