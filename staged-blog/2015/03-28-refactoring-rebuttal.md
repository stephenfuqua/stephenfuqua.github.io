---
title: Refactoring Rebuttal
date: '2015-05-27'
slug: refactoring_rebuttal
tags:
- programming
---

The news has been going around: "refactoring doesn't work," say researchers.
Code quality does not improve. It isn't worth the time and effort. Here's why I
don't buy it &mdash; why the research is fundamentally flawed and real software groups
should ignore it.

<div class="text--center">
![We don't need your wheels](/img/lego-refactoring.jpg)
</div>

The study's aim was to evaluate the use of refactoring techniques to improve
code quality and maintenance. In brief, they conclude that "there is no quality
improvement after refactoring treatment." Their analysis is based on computed
code metrics (static analysis), performance, and perceived maintainability. The
conclusion, however, is based solely on the code metrics, as the other two
factors did not show statistically relevant changes.

The research was carried out in an exercise where students applied a small set
of standard refactoring techniques to an application used at their university.

## Code Metrics

I look at code metrics from time-to-time, and have written company standards on
which metrics to look at and what thresholds to be concerned about. That is, I'm
not opposed to metrics. Nevertheless, the use of code metrics is problematic in
this paper. Let's look at each metric, which was calculated with Visual Studio's
built-in tools:

**Maintainability Index** increased slightly. Win!

**Cyclomatic Complexity** increased slightly. Lose! The problem is, the total
complexity is not all that meaningful. What is meaningful is the complexity of
each class. Many times refactoring involves creating some new classes. These new
classes by definition introduce a small complexity factor - and they could well
be the reason for the increase. In looking at this number, it would have been
better to look at the complexity of individual classes. Did that increase? Did
the average complexity per class increase? We simply do not know.

**Depth of Inheritance** no change. Draw!

**Class Coupling** increased. Lose! On the other hand, more classes probably
means that the code is better structured. I can only speak subjectively, but on
its face, I cannot see anything negative about 7% increase in class coupling.

**Lines of code** increased. Lose! Measuring lines of code can be helpful in
identifying methods and classes that are "too big" and need to be split up. But
otherwise it is not helpful. Refactoring often means creating new classes and
methods. Visual studio does not count the brackets {} for these - but each new
class and method has a signature, and that signature does count.

**Duplication** was not measured, because Visual Studio does not calculate code
duplication. This might have been a truly useful metric, particularly since one
of the primary goals in refactoring is to remove code duplication.

**Code Analysis Warnings** were not measured, perhaps because they were simply
overlooked. Refactoring should aim to eliminate common errors and warnings
reported by static code analysis tools, such as FxCop, which is built into
Visual Studio.

## Performance and Changeability

Reading the paper, you will find this important phrase in the statistical
analysis for both performance and "changeability" (maintainability): "do not
reject the null hypothesis." The null hypothesis is that the refactoring will
not have any significant impact. In other words, the statistics do not support
the positive hypothesis that performance will improve and the application will
be more maintainable.

**Performance**. It is generally a given that you refactor for maintenance, not
for performance. It is well known that performance problems sometimes require
brute force solutions that are not as maintainable. In other words, this is an
acknowledged tradeoff anyway.

**Changeability**. There is some legitimate criticism that less experienced
programmers will have a harder time reading nicely object-oriented code. Thus
less experience programmers, such as university students, may rate the changed
code as less easy to maintain. Since programming teams typically have a mix of
experience, this is very relevant. Each group should assess on their own which
refactoring techniques actually tend to improve their codebase.

The benefits tend to be subtle. Some of the most-used techniques focus on clear
naming conventions and on removing duplication. The benefit to these two are
most apparent when fixing bugs - something that was not explored in the paper.

## Trust

It is not my intention to bash the authors. The choice of topics is probably a
good one, but the skimming through the paper, the authors' lack of experience in
real world programming is apparent. Authors who promote refactoring, such as
Martin Fowler and "Uncle" Bob Martin, have spent decades in the consulting
field. As such, they've worked with a wide diversity of companies, codebases,
and programmers. At the risk of sounding anti-white tower: I trust their real
world experience over university lab experience.

***

Ultimately, each group should decide on their own how and when to incorporate
code refactoring into their daily habits. For many teams, it is simple as the
old Boy Scout rule: leave the code cleaner than you found it. Take "silver
bullet" promises with a grain of salt, but don't allow a well-intentioned but
poorly-constructed study to dissuade you from good engineering practices.

The paper:
[http://arxiv.org/ftp/arxiv/papers/1502/1502.03526.pdf](http://arxiv.org/ftp/arxiv/papers/1502/1502.03526.pdf)

## Comments

_Comments imported from old blog_

> author: dougbelkofer<br>
> date: '2015-03-31 21:42:51 -0500'
>
> This is good stuff Stephen. I believe that you can probably find research to
> back any viewpoint, and those who cannot can certainly create their own. And I
> wonder as well if the researchers just wanted to have a result that would be
> considered at least somewhat controversial. I agree with you that the
> experience of the researchers is no where near the level of those in the
> trenches day-in and day-out, and frankly what you get from refactoring is only
> as good as the knowledge and effort of those doing the refactoring. If the
> refactorers (is that a word?) don't have much experience, they probably aren't
> going to improve things much.
>
> I also feel that the true value of a lot of refactoring isn't terribly
> objective. Sure, you can perform code analysis before and after and see what
> it says, but there's a subjective side - experienced developers can look at
> the code and they just know that it's better code. There's no good way to
> measure that - how do you truly measure "maintainability" of code? How do you
> measure "ease of understanding"? And that one is different between experienced
> and inexperienced developers.
>
> In the end, the reasons for refactoring should be more about keeping the code
> fresh, current, and leveraging current practices and standards. The refactored
> code may not "measure" differently according to the metrics, but it will still
> be better code.
