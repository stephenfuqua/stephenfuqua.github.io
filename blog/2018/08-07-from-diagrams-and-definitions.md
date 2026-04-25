---
title: "From Diagrams and Definitions: Solving the Analytics Reporting Gap"
date: 2018-08-07
tags:
- technology
- data-and-analytics
- ed-fi
---

Have you ever tried to write a query using the Ed-Fi ODS for reporting or
analytics? To say that it is challenging is to use the mildest language. The
Data Standard documentation in Tech Docs is top notch. Nevertheless, going from
diagrams and definitions to actual query code for, let’s say, each student’s
average math grade during a grading period, is not a trivial exercise.

_Originally posted on [www.ed-fi.org](https://www.ed-fi.org)_

<!-- truncate -->
Have you ever tried to write a query using the Ed-Fi ODS for reporting or analytics? To say that it is challenging is to use the mildest language. The Data Standard documentation in Tech Docs is top notch. Nevertheless, going from diagrams and definitions to actual query code for, let’s say, each student’s average math grade during a grading period, is not a trivial exercise.

Analytics tools offer the great promise of uncovering insights by making visible the connections between data. The latest generation of tools go further by supporting self-discovery by end-users who can quickly and easily answer their own questions. Or so the theory goes. But if a seasoned IT professional has trouble querying the Ed-Fi ODS, what then for the time-strapped teacher or administrator?

Over the last few months we have dedicated significant technical resources to start developing a solution to this problem. Our goal is to remove the complexity from analytics and make it easier for users to get the information they need to support teaching and learning. As we are in the beginning phase of this work we would like to invite Community feedback on our approach. To that end, we are convening a Special Interest Group (SIG) on the Analytics Middle Tier, and we’d like you to get involved.

## Root cause

The ODS (operational data store) is highly normalized, reflecting the Unifying Data Model’s design principle of defining and storing data in its most granular form. This design provides flexibility for creating downstream aggregations – with the side effect of a complexity that requires significant expertise to comprehend.

## Proposed solution

Simplification through creation of targeted, de-normalized, SQL views to ease the burden of querying the ODS in reporting tools and analytics solutions. We call this the “analytics middle tier” – a layer of support to sit between the raw table structures and the end-user tools. And we think it will be particularly beneficial to local education agencies who lack the resources to invest in rooms full of business intelligence analysts, and to vendors seeking to leverage the ODS to create off-the-shelf analytics solutions.

:::warning

An image file with a diagram was lost

:::

The Ed-Fi Alliance will soon publish a technical paper analyzing this yawning gap between data storage and data reporting and providing concomitant architectural recommendations and patterns – starting from those SQL views – for overcoming that gap. The paper particularly focuses on provision of data to an Early Warning System, although the patterns will easily support other use cases in the future.
