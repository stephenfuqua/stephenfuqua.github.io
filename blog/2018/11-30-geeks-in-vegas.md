---
title: Geeks in Vegas – Learning About Amazon Web Services
date: 2018-11-30
tags:
- tech
- architecture
- ed-fi
- data-and-analytics
---

According to Amazon Web Services (AWS) CEO Andy Jassy, at his keynote Wednesday morning, I am one of around 53,000 people from all over the world who have come out to the annual AWS re:Invent conference in Las Vegas. We come together from myriad industries and with interests that span the full range from product development to operations to account management. My personal learning objectives for the week are to deepen my understanding, and think about implications for the [Ed-Fi tech stack](https://techdocs.ed-fi.org/#space-menu-link-content), of four concepts:

* Data lakes
* Serverless
* Business intelligence
* .NET on AWS

[continue reading on ed-fi.org...](https://www.ed-fi.org/blog/geeks-vegas-learning-amazon-web-services/)

<div class="image">
![The geeks filling in the Venetian Theater to learn about Best Practices in Big Data Analytics Architecture](./Venetian-Theater-AWS-768x578.webp)
</div>

<!-- truncate -->

<!--
An overarching additional question that came to mind by the end of the first day is: how do we go about utilizing advanced AWS features – and their presumed performance and cost advantages – while continuing to support robust on-premises deployments, without breaking the budget?

During his keynote, Jassy talked about freedom: how AWS brings many choices to the table, so that you are free to choose the right tool for the right job. He particularly focused on #DatabaseFreedom with respect to choosing a lower cost, yet incredibly robust, database solution instead of Oracle or Microsoft products. What about #LocationFreedom? Amazon Lambda looks incredibly useful, for example; however, it is AWS specific. If Ed-Fi technology were to utilize Lambda functions, we would need to find a way to (cheaply) re-use the code in Azure Functions, and to launch that same code in self-managed environments (private cloud or on-premises).

Another theme that emerged is one of needing to take advantage of these managed services if you want to realize the potential cost savings of moving to the cloud. An executive from Comcast told us about his team’s journey from self-managed data centers to AWS. Several months into the work, the monthly bill was raising some eyebrows in finance – they were definitely not saving money. He talked to the development team and they were immediately able to add a focus on cost optimization into their daily work, resulting in significant savings. Other presentations have mentioned the need for cost optimization repeatedly, albeit briefly.

Thus far my learning objectives are being more than met.

* I can hypothesize that an agency could optimize their spend by shifting prior-year data out of SQL Server and a Data Lake, and using Redshift Spectrum to jointly query both the data lake and the current year’s ODS.
* If not the ODS itself, at least ancillary workloads relating to security, bulk data, and data mapping could have reduced cost through pay-as-you go serverless functionality.
* New developments in QuickSight and other tools offer the promise of machine learning insights at a relatively low cost, perhaps helping schools to achieve real-time detection of anomalies in student attendance or grades.
* poAWS is releasing very nice-looking tools for .NET developers, helping them to take advantage of these managed services directly in the code and through build and deployment automation components.

Some members of the Ed-Fi community are already asking us to move toward lower cost solutions (e.g. an open source database), and many agencies are adopting AWS as their preferred solution. Managed solutions on either AWS or Azure could offer significant promise for agility and cost savings – but I suspect we’ll have to test the waters carefully, with eyes wide open, as we look to continue support of our community’s desire for #LocationFreedom.
-->
