---
title: "Exploring Next Generation Technologies with Project Meadowlark"
date: 2022-06-03
tags:
- ed-fi
- programming
- technology
---

As education agencies increasingly look for cost-savings and scalability
benefits through adoption of hybrid or cloud-only IT infrastructures, it is
natural to ask: what should an ideal Ed-Fi installation look like in the cloud?

_Originally posted on [www.ed-fi.org](https://www.ed-fi.org)_

<!-- truncate -->

Today’s Ed-Fi ODS/API platform, and all of the tools associated with it, was developed with on-premises deployment and cost models in mind. It easily migrates to any cloud provider with a simple lift-and-shift onto Windows virtual machines. This works, but might not deliver the desired efficiencies.

Alternatively, the recent “Dockerization” of the platform provides the community with an opportunity to use container-based deployments on any cloud platform. The patterns are new (to our Community) and there is much to be learned about this cost-effective approach to creating scalable installations that can react to periodic bursts of data.

So what comes next? Converting the ODS/API to support containers was a big step and the Alliance will continue building up the support for and documentation of container-based deployments. At the same time, we need to investigate what a fully cloud-native architecture might look like. The Cloud Native Computing Foundation describes such an architecture thusly:

> “Cloud native technologies empower organizations to build and run scalable applications in modern, dynamic environments such as public, private, and hybrid clouds. Containers, service meshes, microservices, immutable infrastructure, and declarative APIs exemplify this approach.
>
> These techniques enable loosely coupled systems that are resilient, manageable, and observable. Combined with robust automation, they allow engineers to make high-impact changes frequently and predictably with minimal toil.”

To this end the Alliance quietly began an exploration in 2020, and announced a prototype cloud-native API at the Ed-Fi Summit in 2021. We call this Project Meadowlark: a research and development effort to explore the potential for use of new technologies, including managed cloud services, for starting up an Ed-Fi compatible API. The 2020-2021 work focused on creating a serverless environment with the API written in NodeJS, running in AWS Lambda functions, and supported by the DynamoDB and OpenSearch databases on the backend.

In 2022 the commitment to this R&D work has accelerated; the diagram at the bottom of this page depicts the long-term vision for a system architecture. But be cautioned: the Ed-Fi ODS/API has a long life ahead of it, and the work from Project Meadowlark might not ever become a fully-fledged product in its own right. In other words, please keep up the momentum with your existing investments and deployment strategies!

If this work is ever to inform development of production-ready software, then it needs community involvement. Please contact Stephen Fuqua if you would like to participate in a special interest group (SIG) to:

    Provide input to requirements and design.
    Provide review and feedback of demonstrations.
    Make recommendations, as appropriate, to the Ed-Fi Alliance about future technology choices.

Meeting schedule to be determined based on needs  / actual progress, not to exceed once per month and beginning in late June.

<div class="image">
![Diagram of Meadowlark software components](/img/meadowlark.png)
</div>

This diagram represents a potential future state for Meadowlark, one that is modular, cloud-native, and event-driven. Please see Project Meadowlark – Exploring Next Generation Technologies (Ed-Fi login required) for more detail on the current work-in-progress and upcoming milestones for the project.
