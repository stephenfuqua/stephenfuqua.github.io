---
title: Aligning Product with Business Value
date: 2024-02-11
tags:
- programming
- data-and-analytics
- agile
sharing: true

---


## Delivering Value and Identifying Useful Metrics

One of the key themes of [Data Day Texas 2024](https://datadaytexas.com/)
(#ddtx24) in late January was the notion of aligning your work with business
value. Does the product you are building support the business strategy? Does the
metric you are reporting add _sufficient_ value , or is it just a distraction?
Can you explain that value to the "non-technical" in your organization, not just
rationally, but also reflecting emotional and relationship impacts?

## Recognizing Value Delivery

Coming into the conference, I was actively contemplating _operational metrics_
for my technology team. What additional metrics - if any - should we be tracking
and improving upon as part of our 2024 goals? While software _feature_ alignment
to business strategy is not new to me, thinking about alignment in terms of
"what do we measure" was eye opening.

The most important measurement in software (or data) products is simply this:
did you deliver something of value to your customers? That ought not be a
Boolean answer; it could be a net promoter score, market share, or a positive
change in revenue after adding a new feature.

But was it the most valuable work that could be delivered? Never an easy
question, and the experimental and Agile mindset suggests that too much up-front
analysis can lead to paralysis: no value delivered, or highly delayed. Hence the
mantra "do something".

In a Scrum product development sprint, teams often look at burndown or burnup
(my preference) charts showing their progress toward the sprint's goal. Meeting
the number does not guarantee success; the charts' usefulness lies primarily in
calling out when the situation has become potentially unhealthy (progress is
stalled). The Sprint Review is a key time to evaluate, qualitatively, if we have
delivered useful value.

## Health Metrics

Looking beyond the sprint, what simple metrics might we use at the level of
product management? Another point raised during the DDTX24 conference was the
notion of looking at _health_ metrics. Rather than only looking at error or bug
counts (measures of "disease"), which metrics indicate health in a manner that
might reveal potential slide into disfunction? And which metrics are not easily
gamed? Famously, counting lines of code (LoC) is ridiculous: anyone held to that
account can easily inflate their LoC.

Two issues that long bothered me are around the flow of communication. In
particular:

* Old tickets in the product backlog
* Getting feedback from sprint reviews

### Communicating Intent in the Product Backlog

My team deals in open-source software. We receive bug reports and suggestions
from a moderately sized community on a regular basis. How well are we responding
to those requests? A few days ago, I closed a ticket that was opened in 2017.
Why, oh wy, was that still open? Collectively, we need to do better at managing
that open backlog.

Clearly, there are some features, and even bugs, that we will
never be able to address. They are not of sufficiently high priority. If the
goal is be more timely in responding to these requests, perhaps we can track
_average ticket age_ (or alternately, _lead time_). Yes, someone can game that
system, whether on purpose or subconsciously. If we treat this more rigorously,
we can look at the spread in age as well: standard deviation.

What value does this measure bring? Improved communication and timeliness.

What about _cycle time_? Once a ticket is started, how quickly does the team turn
it around? This metric might be useful in a support function, but it does not
feel valuable in terms of product development. Also, the burnup/down chart is
already a useful proxy, in that it (ideally) shows steady progress toward a
sprint commitment.

What is more valuable is the tracking of _story point velocity_ per sprint, with
the goal of getting a best-guess at how much work can be completed in upcoming
sprints. Projected over the future backlog, this can give a sense of what
_might_ be possible by a given date. But this is not an operational metric that
should be tracked at the level of department: each team will have its own
velocity, and no comparison should be made between them. That said, it can be a
useful health metric: if the velocity starts to fall, it is time to ask what
might be going on.

Conclusion: at the department level, _try_ tracking `mean(ticket age) +/- 2*std(ticket
age)` for each product backlog.

### Sprint Review

Delivering high quality sprint reviews is very challenging for most people. I've
been meaning to write about it for years; I'm sure plenty of others have already
done so.

Short version: product "demonstrations" that do not elicit feedback, that dive
into technical minutia, or seem disconnected from _business value_ / _strategic
alignment_ lead to sparsely attended sprint reviews and/or disengaged
stakeholders.

To improve on matters, what if we measured attendance at sprint reviews,
counting the people outside the immediate team who show up? People will vote
with their feet, and we can count those votes. This does not tell us about
engagement, and it might not be valuable to look at this as an absolute number.
But it is a simple metric, easy to track and easy to recognize when something is
(ostensibly) going right or going a bit off the rails.


## Other topics

Some other insights from Sol Rashidi's talk.

Executive success requires more EQ, BQ, and SQ than IQ.

ROI can be more than just financial (at least in the direct sense). Relevance, for example. If you don't innovate, will you still be relevant? But that innovation should be aligned.

Convincing people of business alignment requires more than just a clear case. How you present that case matters. Look at hte Challenger explosion, for example, as describe in whats-his-name's book.

Don't surprise people _in front of others_ and make them look bad. Especially executives. Bring their teams along in your discovery. This is particularly in the context of digging into corporate data and finding missed opportunities or waste.

Business value is important, but not the only thing. Think both quantitatively and qualitatively. A use case may have great business value in theory, but be very difficult to complete or to deploy into production. Feasibility must also be a criterion.

Progress over perfection: show something, anything, to demonstrate progress.
Preservation over pride: play the long game.
Collaboration over control: be a willing partner

Reminds me of the Agile Manifesto

Have some empathy for executives: back-to-back meetings all day long. Constantly multi-tasking / code-switching. No time for details - so don't bring them the details (personal note: be ready to discuss when asked)
