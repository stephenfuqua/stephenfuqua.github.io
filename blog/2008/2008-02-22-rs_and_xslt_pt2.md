---
title: 'RS and XSLT, pt2: Deploying XSLT File'
date: '2008-02-22 16:29:47 -0600'
slug: rs_and_xslt_pt2
tags:
- tech
- database
- sql-server
---

**Problem:** you try to deploy your xslt file from Visual Studio, and get an
error saying "Value for the parameter 'MimeType' is not specified. it is either
missing from the function call, or it is set to null".

**Solution:** In Solution Explorer, click on the xsl file. Then switch to the
Properties pane and enter "text/xml" as the MimeType. _Note:_ this is not
required when deploying the xsl through Report Manager's upload button.
