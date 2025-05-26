---
title: Git Tutorials, Workflow, and GUI
date: 2015-10-24
slug: git_tutorials_workflow_gui
tags:
- tech
- sdlc
- FlightNode
---

## Tutorials

_Updated 2021-05-25_

Git is a fabulous tool for source control management. While incredibly powerful,
it can be a little daunting to learn at first. The following tutorials will
help. They are organized from basic to more advanced.

* **[Learn Git Branching](https://learngitbranching.js.org/), an interactive
  tutorial** is a very cool way to get your feet wet without having to download
  and install anything.
* [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow),
  a very good read on the basic workflow / process used for FlightNode
  development
* [Forking
  Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow),
  which was used in the FlightNode project for which this tutorial was
  originally written, with _GitFlow_-like branching structure at the core.
  * In your local clones, create a new _remote_ called _upstream_*, pointing to the
    main repository: <br> `git remote add upstream https://github.com/FlightNode/FlightNode.xyz`
  * When you want to get the latest code from the shared repository, you'll now
    be able to use <br> `git pull upstream <somebranch>`.
  * _2021 update: this is still my preferred approach when working with a fork,
    although typically I am now working on a branch directly in the "origin"
    repository and don't need to take this step._
* [Pull Request Tutorial](https://github.com/yangsu/pull-request-tutorial),
  with many nice screenshots and some advanced functionality, such as _squash_,
  _rebase_, and _cherry-pick_.
* [Pro Git](https://git-scm.com/book/en/v2), the entire book, is available online for free.

## Typical Workflow

Once you've created your forks on GitHub, and your clones on your workstation,
a typical day might look like this:

1. Open Git-bash and cd to a workspace: <br> `cd /c/workspaces/FlightNode/FlightNode.Identity`
1. Planning on working on Issue #10 today... so create a feature branch:
   <br> `git checkout -b feature/10`
1. You don't want to get out-of-date, or you may start running into major merge
   difficulties. Therefore: <br> `git pull upstream develop`
1. Work on some code in your editor of choice.
1. Stage your code:
   1. New file:<br> `git add full/path/to/new/file.cs`
   1. All existing files:<br> `git add -u :/`
   1. All existing files in a particular directory:<br> `git add -u :full/path`
1. Do some more work, stage some more work.
1. Commit your changes: <br> `git commit -m "10 - brief description"`
   <br> (for longer description, enter a brief description on first line,
   then hit enter to  type the longer description starting on the next line.
   Finish with ").
1. Done for the day? Want to backup your code? Push to your fork:
   <br> `git push origin feature/10`
1. Is the feature ready for other people to use? Then create a pull request
   in GitHub. In the pull request, add comments directly in the file
   if you want to explain something about your work. And invite others to
   review your code.

## Graphical Git

### SourceTree

Many people really like SourceTree, [a tool from
Atlassian](https://www.sourcetreeapp.com/). I have it installed and have not yet
really used it, because I'm completely comfortable with using the command line.
This tool is particularly useful when you want to visualize and compare many
active branches.

### Visual Studio Code

Visual Studio Code's Git support is top-notch, when you don't feel like using
the command line. You can use the tool for all of the basic operations... and
probably much more beyond the basics. But personally I generally use the command
line for complex things.

Perhaps the best thing about VSCode's integration: it makes the cumbersome process
of un-staging and/or reverting your code changes very easy.

{: .center-block}
![Git in Visual Studio Code](/img/git-vs-code.jpg)

In this example:

1. Clicked a + icon (not shown) to move `CONTRIBUTORS.md` from "Changes" to
   "Staged Changes".
2. Clicked on the file in "Staged Changes" in order to see the diff in the text
   editor.
3. Review the diff, confirm that it is what was expected.
4. Type in a message and click the checkmark to commit the change.
5. Click on `...` to get the pull down menu.
6. Push changes.

That menu gives many more options, for example to help you create a new branch.

_For more information, see [Use Git version-control tools in Visual Studio
Code](Use Git version-control tools in Visual Studio Code)._

### Visual Studio 2015

_2021 update: in VS2019, these features are now in the "Git Changes" panel and
the user interface is further improved. See [Git experience in Visual
Studio](https://docs.microsoft.com/en-us/visualstudio/version-control/git-with-visual-studio?view=vs-2019)
for more detailed information._

Visual Studio 2015's support is actually pretty good too. I was biased against
it for a long time, probably because they automatically stage files ("tracked
files") and make you purposefully unstage them ("un-tracked files"). But for
most people that's probably not a bad thing. And while I haven't used it
in VS2013 in many months, I feel like the 2015 experience is somehow a little
better and a little more powerful than its predecessor.

{: .center-block}
![Git in Visual Studio 2015](http://flightnode.github.io/img/vs2015Git.png)
