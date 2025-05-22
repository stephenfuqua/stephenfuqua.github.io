---
title: "Points on Bugs and Spikes"
date: 2020-05-24
tags:
- tech
- sdlc
---

Should bugs and spikes receive story points to aid in sprint capacity planning?
Some teams will estimate all work items by time during sprint planning in order
to find the right commitment. Many teams hate this and/or spend an inordinate
amount of time arguing about time. Those that abandon time may be tempted to put
points on these unplanned, non-productive items, but there is a cost: the
completed velocity will overstate the projected release timeline for the
remainder of the release backlog.

Possible solution: track the ratio of story to non-story points and use that to
pad out the release projection estimate.

----

Story point estimation has proven to be an effective tool for providing a
general sense of time/complexity of effort on a discrete tasks. Over the course
of a several sprint iterations, a team with a thoughtful product backlog and
consistent work environment should begin to understand roughly how
many points can be completed in upcoming sprints: the velocity. With sufficient
statistics, a ScrumMaster can project out not only the average velocity per
sprint, but also a confidence interval.

A team engaged in releasing software every few months might reasonably estimate
the entire known backlog for the next release. But what about technical spikes
and bug fixes? Spikes are timeboxed explorations that ask questions, the answers
to which inform future story estimates and solutions. Bugs of course are
corrections to previously-built behavior.

Many people choose not to put points on spikes and bugs because they are not
stories &mdash; they are not directly providing productive value to the end-users.
Others do put points on spikes and bugs for the purpose of sprint capacity
planning.  The two goals of planning a sprint's activities and projecting a
range of potential release dates are at odds. To illustrate the dilemma, let's
consider a team with the following data:

| Sprint | Points Completed |
|--|--|
| One | 22 |
| Two | 19 |
| Three | 23 |
| Four | 25 |
| Five | 23 |
| Six | 24 |
| Statistics| &mu; = 23, &sigma; = 2 |
{: .table .table-striped .table-bordered}

The backlog for the next release has been estimated at 83 points. How many
sprints is that?

* 83.0/(23-2) = 3.95
* 83.0/(23+2) = 3.32

Thus the team estimates that it needs four sprints to complete the release based
on the current scope of the release backlog.

The team has received two bug reports from the user community and wishes to work
on them in the next sprint, and they have identified a one day spike that is
expected to resolve lingering doubt about one of the story estimates. The team
prefers to push themselves rather than rest on a baseline, so during planning
they decide to aim for twenty-four points worth of work. But how should they
account for the bugs and the spike?

The team decides to put points on them; one of the bugs is simple looking and
gets one point; the other and the spike are assigned two points each. Then the
team picks out nineteen points of story work to round out the sprint commitment.

And now the release backlog has 88 points instead of 83, resulting in a range of:

* 88.0/21.0 = 4.1905
* 88.0/25.0 = 3.52

Probably done in four sprints, but possibly in five with the worst-case projection.

In solving their sprint capacity-planning, did they discover that the roadmap
was potentially off by an entire sprint due to the two bugs and the design
uncertainty? If so, it was good to discover that now. And would have been nice
to predict even sooner.

On the other hand, what if these aren't their first bugs or spikes? What if
twenty percent of their completed points over the past six sprints were for bugs
and spikes? Then the release projection &mdash; which only contained known
upcoming user stories &mdash; was based on an inflated velocity. In that case,
the five points added during this sprint will likely re-occur.

For the remainder of the time until release, scrutiny of the software may
continue finding small bugs and discover usability rework, while the number of
spikes will go down. Lacking any data to say otherwise, it might be reasonable
to assume then that there will continue to be four or five points of non-story
work in the remaining sprints as well.

Thus the 83 estimated story points account for only eighty percent of the
remaining effort. And this can _only be seen by separating the story points from
the non-story points_. Now the release projection looks more like:

* (83.0*1.2)/21.0 = 4.7429
* (83.0*1.2)/25.0 = 3.984

That is, it would be more accurate to estimate that the release will be ready in
four or five sprints. And if the product owner really wants to hit four sprints,
then they'll need to cut around 25 points from the release to be on the safe
side.

----

What about taking the opposite tack? That is, subtract the bug and spike points
from the point total before calculating velocity. That is certainly a viable
approach and perhaps worth experimenting on.  What I like better about the first
approach:

1. If there are going to be spikes, bugs, and rework, then it is nice to have
   the extra data to apply to the future projections proactively. Sure, a
   reduced velocity would have also padded out the sprint length. With the first
   approach it would be easier to justify lowering the padding if their is less
   non-story work than "arbitrarily" raising the expected velocity.
1. Better respects the teams' desire to track their progress and throughput.
