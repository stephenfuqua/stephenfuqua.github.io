---
layout: page
title: Securely Accessing Network Resources in an ASP.Net Web Service
date: '2009-09-22 21:12:50 -0500'
basename: securely_access
tags:
- tech
- dotnet
- programming
- security
excerpt_separator: <!-- truncate -->
---

**Problem:** You have an ASP.Net web service/site that needs to access network
resources, and IIS is running in a service account that you do not want to have
access to those resources.

**Solution:** Create a custom network account and setup a separate application
pool. Microsoft article [How To: Create a
Service Account for an ASP.NET 2.0 Application](http://msdn.microsoft.com/en-us/library/ms998297.aspx) outlines some pros/cons and
gives a few alternatives, as well as giving the basic instructions. However, I
found that these instructions had to be modified with inclusion of a few extra
security rules. Steps:

<!-- truncate -->

* Create service account
* Grant that account access to IIS. At the command prompt on the server, switch
  to c:\windows\microsoft.net\framework\v2.0.57207 and type `aspnet_regiis -ga
  <newaccountname>`
* Create new application pool in IIS. Set Identity to the new account.
* Grant additional security settings:
  * To solve error seen in Event Log, "The identity of application pool, 'â€¦'
      is invalid.": [<a
      href="http://blogs.msdn.com/ssehgal/archive/2009/06/23/running-iis6-app-pools-under-a-domain-account-identity.aspx">hat
      tip</a>]
    * Add user to the local IIS_WPG group
    * Run `secpol.msc` to open the Local Security Settings. Open to Local
       Policies > User Rights Assignment, and add the account in "Long on as a
       service"
  * To solve .Net exception, "Unable to generate a temporary class (result=1)":
      [[hat tip](http://forums.asp.net/p/985053/1267725.aspx)]
     * Give Read & List Folder Contents permissions  on %windir%\temp.
* Create virtual directory in IIS and change the Application Pool to the new
  pool you created.

FYI, it is important not to forget basic web security when dealing with
filesystem access. If the web service/site will allow "user" input to influence
the directories or files that will be accessed, then it is best to create a
whitelist of acceptable files, in order to avoid attacks whereby a user tries to
open or replace a file they should not be able to access. Cf [Insecure Direct Object
Reference](http://www.owasp.org/index.php/Top_10_2007-A4) (OWASP Top 10).
