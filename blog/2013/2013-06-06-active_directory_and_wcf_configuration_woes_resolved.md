---
layout: page
title: Active Directory and WCF Configuration Woes Resolved
date: '2013-06-06 21:10:46 -0500'
basename: active_directory_and_wcf_configuration_woes_resolved
tags:
- tech
- programming
- dotnet
excerpt_separator: <!-- truncate -->
---


Configuring a WCF service across security boundaries can be a tricky business,
or so I learned recently. Testing went well, but the move to production failed
for a WCF client/server scenario, with the client application encountering an
error: `SOAP security negotiation with '<myEndpointAddress>' for target
'<myEndpointAddress>' failed. See inner exception for more details.` Inner
exception: `The Security Support Provider Interface (SSPI) negotiation failed.`

<!-- truncate -->

The solution was simple in the end, but required a good deal of research to find
and understand. But before we get to that, let's talk a bit more about the
setup. The actual production setup is more complicated than this, but the
simplified model will suffice for the example. Because the client is in fact a
second WCF service, both the client and server are on Windows Server 2008 R2
boxes, both in secure but distinct subnets. As they are both custom .Net
applications, we were able to utilize netTcpBinding for increased performance
and simpler security, in comparison to httpBinding and wsHttpBinding. But as we
shall see, that decision had an unforeseen consequence.

{: .float-right .shadow .p-3 .rounded}
![image showing two services communicating through a firewall](/images/wcfClientServer1.png)

TCP binding with either Message or Transport is secured by Kerberos tokens
issued by Active Directory in a Windows network, whereas wsHttpBinding uses a
certificate/SSL to encrypt the communication. Thus the TCP route has lower setup
overhead, in that you do not need to purchase a certificate or alternately
manage a certificate server in-house. As a business-oriented programmer, I've
never needed to understand Kerberos. But from my Unix sysadmin days, I knew that
Kerberos was developed at MIT and provided a means for authenticating a client
and server, for instance when connecting to a network file share over the SMB
protocol. Thus in hindsight the problem is not at all surprising, but admittedly
I did not know enough about WCF to recognize the implications at the time.

In the test environment, both servers were in the same network segment and the
WCF services ran under the same service account. I was mildly concerned that I
had not tested across a subnet boundary, but it turned out this was not even the
problem: as I researched further, I found that (a) the two services were running
under different service accounts in production, and (b) one of the service
accounts  was not in the same Active Directory domain as the servers (both
domains being in the same Tree, however).

{: .float-right .shadow .p-3 .rounded}
![image showing a domain controller reachable by servers on both sides of the firewall](/images/wcfClientServer2.png)

To prevent getting too long winded, I won't repeat most of what I found in three
particularly helpful Microsoft resources &mdash; well, helpful once I was able
to put the pieces together. Alone, none of them simply stated the required
practice.

* [Chapter 5: Authentication, Authorization, and Identities in WCF](http://msdn.microsoft.com/en-us/library/ff647503.aspx)
* [What Is Kerberos Authentication?](http://technet.microsoft.com/en-us/library/cc780469(v=WS.10).aspx)
* [Debugging Windows Authentication Errors](http://msdn.microsoft.com/en-us/library/vstudio/bb463274(v=vs.100).aspx)

Between these  resources, I came to realize that:

<ol>
	<li>At the time of installation, a Windows service registers itself in the Domain controller, identifying itself by name, address, and either a Server Principle Name (SPN) or User Principle Name (UPN) (the former when running the service under the default Network Service account and the latter when running under a custom account, as in my situation).</li>
	<li>When in the same subnet, it is easy for the client to find the server. I suspect - but do not have the resources to test - that this was particularly true because the same service account was running both.</li>
	<li>Service1 (the client) was trying to find Service2 as identified by UPN asdf123@domain1, but in reality it was registered under asdf@domain2. That is, the wrong Kerberos token was being issued while searching for Service2.</li>
	</ol>

The solution? Simply specify the UPN identity in the config file (if using the auto-generated client proxy) or in code, using the [fully qualified domain name](http://technet.microsoft.com/en-us/library/cc783351%28v=ws.10%29.aspx) (FQDN):

```xml
<client>
     <endpoint address="net.tcp://Service2.MyTree.MyForest.local:1234/SomeContract" ... >
          <identity>
               <userPrincipleName value="asdf@domain2.MyTree.MyForest.local">
               </userPrincipleName>
          </identity>
     </endpoint>
</client>
```

(In a simpler situation, the FQDN would probably be `domain1.local`.) In C#,
this can be done when creating the EndpointAddress:

```csharp
var uri = "net.tcp://Service2.MyTree.MyForest.local:1234/SomeContract";
var upn = EndpointIdentity.CreateUpnIdentity("asdf@domain2.MyTree.MyForest.local");
var endpointAddress = new EndpointAddress(uri, upn);

var binding = new NetTcpBinding();
// set additional options
var channelFactory = new ChannelFactory<ISomeContract>(binding, endpointAddress);

var client = channelFactory.CreateChannel();
```

When running under the Network Service account &mdash; that is, using an SPN instead of UPN &mdash;:

```xml
<identity>
     <servicePrincipleName value="host/Service2.MyTree.MyForest.local:1234" />
</identity>
```

**Important Note:** the syntax highlighter is converting `userPrincipleName` to the incorrect `userprinciplename` and likewise, `servicePrincipleName` to `serviceprinciplename`.

And

```csharp
var upn = EndpointIdentity.CreateSpnIdentity("host/Service2.MyTree.MyForest.local:1234");
```

By the way, after finding the answer, I learned that the System log on Service2 actually had a very helpful error message in it; it tells us about using the FQDN and that the wrong account was being used:

> The Kerberos client received a KRB_AP_ERR_MODIFIED error from the server
> <username>. The target name used was host/<host>.<domain>.local. This
> indicates that the target server failed to decrypt the ticket provided by the
> client. This can occur when the target server principal name (SPN) is
> registered on an account other than the account the target service is using.
> Please ensure that the target SPN is registered on, and only registered on,
> the account used by the server. This error can also happen when the target
> service is using a different password for the target service account than what
> the Kerberos Key Distribution Center (KDC) has for the target service account.
> Please ensure that the service on the server and the KDC are both updated to
> use the current password. If the server name is not fully qualified, and the
> target domain (<user's domain>) is different from the client domain (<client's
> domain>.LOCAL), check if there are identically named server accounts in these
> two domains, or use the fully-qualified name to identify the server.

## Comments

_Comments manually imported from old blog_

> date: '2013-08-28 02:10:05 -0500'
>
> I think you mean userPrincipalName and serverPrincipalName - (case and spelling)
>
> -david

---

> author: Stephen Fuqua<br>
> date: '2013-11-17 23:11:36 -0600'
>
> Actually, I spelled it correctly but the JS/CSS for code formatting converted it to lower case. I'll add a note in the text.
