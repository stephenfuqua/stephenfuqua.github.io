---
title: Project Tanager, the next generation of Ed-Fi API software
date: 2024-04-18
tags:
- programming
- ed-fi
- architecture

---

> "For the past two years, the Ed-Fi Alliance software development team has been
> listening to community members through its Technical Advisory Group, Special
> Interest Groups, and at our annual events. We have been hearing that the pace
> of change in the Ed-Fi ODS/API Platform needs to accelerate, shifting to a
> cloud-native architecture that can better support large-scale deployments
> while offering greater cost and performance flexibility. To do so, we need a
> reboot."

→ _Full article at [New Cloud-Native Functionality Coming to the Ed-Fi Alliance
Technology Suite](https://www.ed-fi.org/blog/cloud-native-ed-fi-technology/)_

Though barely mentioned in the article, the work to create a production ready
system has been dubbed [Project
Tanager](https://github.com/Ed-Fi-Alliance-OSS/Project-Tanager), the third
bird-related project name in my tenure with the Ed-Fi Alliance
([Roadrunner](../2019/06-04-postgresql-for-the-ods.md),
[Meadowlark](../2022/06-03-exploring-next-generation-meadowlark.md)).

<div class="image">
![Scarlet Tanager, by Adam Jackson, no rights reserved](/img/scarlet-tanager_by_adam-jackson_no-rights-reserved_square-256.png)
</div>
<!-- truncate -->

<!--
For the past two years, the Ed-Fi Alliance software development team has been listening to community members through its Technical Advisory Group, Special Interest Groups, and at our annual events. We have been hearing that the pace of change in the Ed-Fi ODS/API Platform needs to accelerate, shifting to a cloud-native architecture that can better support large-scale deployments while offering greater cost and performance flexibility. To do so, we need a reboot.

The first lines of code in the ODS/API were written in 2011. Many updates have been made over time: adding the REST API to complement the original XML ingestion process, bringing in popular features like change queries, and making big improvements to the application’s responsiveness. The system does a great job of supporting integration of disparate sources into a single database, which can then be used in analytics or reporting systems to drive insights that can improve educational outcomes.

Figure 1: diagram of upstream source systems feeding data into the Ed-Fi ODS/API application, and downstream systems extracting data for analytics and reporting.

However, the ODS/API architecture that has worked so well for many years is becoming a barrier to innovation and scalability.

For example, some members of the community have asked for the software to fully support streaming data output (e.g. using Kafka). This enables real-time population of a data lake or an analytics system, thus avoiding costly batch extract, transform, and load (ETL ) processes. Data streams are also great for AI-based anomaly detection. The architecture of the ODS/API platform is not well-suited to this use case.

Another common concern with the platform is its performance when reading large volumes of data from the system. The existing database structure works very well for guaranteeing referential integrity; for example, ensuring that you cannot save a student assessment result if the student does not exist. This same structure leads to massive databases that are difficult to tune, especially at the state level. With a fresh take on the database design, we can better balance the optimizations for both read and write behavior. And we can open up flexibility for use of advanced search databases.

Figure 2: diagram of a possible system architecture for an Ed-Fi API application, which supports real-time population of a data lake and uses a high-performance search database.

Many organizations in the Ed-Fi Alliance community have completed or begun a migration of their software out to the Cloud, instead of running on-premises, managed services and more performant technology choices; broadly speaking, this is what we mean by “cloud native”. The next generation of our software is being designed with all of this in mind, from the ground-up.

For those who plan to continue running on-premises rather than in the Cloud: no need to worry, the Ed-Fi Alliance technology suite will be supported on-premises for many years to come.

The central output of this reboot will be the new Ed-Fi Data Management Service, eventually replacing the Ed-Fi ODS/API. This will be accompanied by a new application management service and sample applications demonstrating how to take advantage of the new architecture. To be clear, this reboot is about the API technology, not the API standard. A vendor system should not see any major differences interacting with the ODS/API and the data management service.

Our goal is to provide a preview release of the new software before the Ed-Fi Alliance 2024 Summit, with production-ready software to follow in the first half of 2025 for use by early adopters in the 2025-2026 school year. We will continue to support Ed-Fi ODS/API version 7 at least through the 2027-2028 school year. This should allow plenty of time for evaluation and migration to the new system.

To learn more about the application design and contribute to design decisions, visit the Ed-Fi Data Service Management FAQ page.
-->
