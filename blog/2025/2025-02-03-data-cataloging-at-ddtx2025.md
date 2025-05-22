---
title: Data Cataloging at Data Day Texas 2025
date: 2025-02-03
excerpt_separator: <!-- truncate -->
tags:
- tech
- data
---

Notes from three talks on data cataloging at the recent [Data Day Texas
2025](https://datadaytexas.com/)

* The Meta Grid
* Investing in Semantics and Knowledge
* We Are All Librarians

<!-- truncate -->

## The Meta Grid

Ole Olesen-Bagneux opened the conference with a keynote on the [meta
grid](https://www.searchingfordata.com/) - a decentralized architecture for data
catalogs, inspired by the decentralization of microservices in the API world and
Data Mesh in the world of serving data for analytics and reporting. In short, as
I understood it: _meet the users where they are_. The enterprise has many data
sources; organize a system that supports metadata management at the source,
instead of trying to centralize all metadata knowledge.

Empower individuals to serve as reference librarians who know how to navigate
the meta grid (which might be low tech), helping others to find the right
sources for their queries. Stop wasting money on error-prone attempts to gather
and maintain all metadata in a single location. Documentation of the systems is
the key, through diagrams and ADRs. These are the tools of the reference
librarians, both human and LLM-based. "Talk to" a trained LLM to find the
required data.

Reactions:

* Inspiring: another application of the principles of decentralization and
  designing for real humans.
* Reminder: Technical solutions do not need to be grandiose to be effective.
* He refers to this as the third wave in data decentralization. Should
  blockchain also be in that list? Perhaps that is an orthogonal question, since
  its form of decentralization is about ownership, not discovery.

## Investing in Semantics and Knowledge

Be curious and empathetic, [Juan Sequeda](https://juansequeda.com/) urged us, as
you build knowledge systems. Do not lose sight of why (again, people first, tech
follows): reach economies of scale with your data by making them reusable,
composable, and extensible. This requires identifying and recording context of
the data you are storing (knowledge), and some function that combines data with
that knowledge to produce new data and knowledge (semantics).

Back to why: he encouraged applying "five whys" type of thinking when approached
with a solution, to get to the real problem that needs to be solved. Make
assumptions explicit. Both the assumptions behind the problem / solution, and
assumptions about the data themselves. More knowledge: what does `null` mean in
this column? That the value is missing or unknown? That it is constantly
changing? That it does not exist? Who knows the answer? Record it in the data
catalog.

Sequeda shared about an interesting case study of building a culture around data
quality, driven by the most basic of incentives: the annual bonus. A company
identified data quality problems as costing them lost revenue and extra expense.
To turn around the culture, every employee in the company, from the worker who
might be eyeballing a measurement instead of being precise to the CEO has to
improve the quality of the data, with 25% of their bonus riding on meeting
certain benchmarks.

Again with simplicity: do things the "manual" way until you can justify a tool.
Spreadsheets are great. Don't start your journey with an expensive tool. As you
track your data, look for the opportunities for reuse. And, look at _who_ is
working with the data. Who uses them? Who affects them? Record these
observations in the Data Catalog.

Reactions:

* He mentioned [schema.org](https://schema.org) in passing. Potential use for
  our work at the [Ed-Fi Alliance]? Might be interesting to compare the
  [Person](https://schema.org/Person) and
  [EducationalOrganization](https://schema.org/EducationalOrganization) schemas,
  for example.
* Can a good data catalog track _use cases_ that links them back to data
  sources? What about _potential_ use cases, which would highlight gaps to be
  filled?
* Have never seen data catalog software in action. Can some of these
  applications track the mapping between data specifications? Perhaps as
  lineage?

## We Are All Librarians

Do you organize (data)? Do you research? Do you educate? Track provenance?
Retrieve information? Then you are a librarian! Or so says Jessica Talisman.
[This podcast on building
taxonomis](https://podcasts.apple.com/us/podcast/building-taxonomies-data-models-to-remove-ambiguity/id1739823286?i=1000671791129)
looks like it covers similar ground.

Her talk seemed compelling and important... but I admit I got lost at some
point. For me, this was too abstract, without sufficient concrete example.
Perhaps pre-supposing too much? Certainly the keynote speaker enjoyed the talk,
with very warm comment and question immediately following.

One idea that did sink in: when cataloging metadata, it helps to control the
vocabulary. This becomes the taxonomy. Minimize semantic ambiguity by building a
thesaurus, with a list of terms, associative relationships, and set of rules on
how to use it. This seems very powerful for data mapping exercises.

## Conclusion

Conceptually, taxonomy and ontologies should be interesting to me. But I can get
lost and a bit bored without hands on experience. Nevertheless these sessions
offered tantalizing clues that one day yet assemble themselves into an aha!
moment.
