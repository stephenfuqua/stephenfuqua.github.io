---
title: Mini E-mail Campaign With Node.js
date: '2015-01-12'
slug: mini_e-mail_campaign_with_nodejs
tags:
- tech
- programming
- javascript

---

Over the weekend I had what at first appeared to be a small challenge: send out
a few hundreds e-mails for a non-profit's outreach campaign. MailChimp and other
mailings lists were not a good fit, as these messages were of the cold-call
variety, and a formal mailing list felt too spammy. Initially I wrote a utility
in .NET, but ended up solving with Node.js instead due to timeouts experienced
with SmtpClient.

<!-- truncate -->

Requirements: parse a CSV file and then send HTML-formatted e-mail through an
SMTP server. The body of the e-mail has a place holder for the recipient's name.
Log the results.

Really, this should be trivial. It does not take a team lead software engineer
to write this. But somehow my .NET client just kept timing out. I tried several
servers and had the same response. I disabled firewalls, but with no luck.
Finally, I decided to just try another language. As I've not written anything in
Perl or PHP in many years (both well suited to the task), I chose Node.js. And I
was able to send e-mail on the first try.

It seems there is something wrong with the [System.Net.Mail.SmtpClient](https://msdn.microsoft.com/en-us/library/system.net.mail.smtpclient%28v=vs.110%29.aspx).
I tried both synchronous and asynchronous, by the way. And I've used the
SmtpClient with 2.0 and 3.5 applications, though never with 4.0+. There are a
few people who have experienced similar problems. Although disabling the
firewalls did not help, I still wonder there is something about the Windows 8
security settings.

What I realized is that I was just wasting my time trying to get this working
.NET. Switching to Node.js also gave me a good opportunity to get some practice
in with this elegant, highly-componetized framework. The keys to success were
using the built-in [filesystem API](http://nodejs.org/api/fs.html)
and NPM installing the [csv](http://csv.adaltas.com/parse/) and [emailjs](https://github.com/eleith/emailjs) modules.

Though quick-and-dirty, I give this to the Internet for my own future reference
if nothing else.

```javascript
var campaign = {
    user: "arthur@the.roundtable.uk",
    password: "12345678909876",
    host: "mailserver.the.roundtable.com",
    port: 465,
    templateFile: "c:/temp/invitationToGrailSearch.txt",
    logFile: "c:/temp/invitationToGrailSearch.log",
    addressFile: "c:/temp/completeListOfTheKnightsOfAlbion.txt",
    from: "King Arthur <arthur@the.roundtable.uk>;",
    subject: "Open Invitation to Join in the Grail Hunt"
};

 var csv = require('csv');
var fs = require('fs');

var logToFile = function (message) {
    fs.appendFileSync(campaign.logFile, message + "\r\n");
};

// Setup mail server connection
var email = require("emailjs/email");
var server = email.server.connect( {
    user: campaign.user,
    password: campaign.password,
    host: campaign.host,
    port: campaign.port,
    ssl: true
});

// Read in the template file
var template = fs.readFileSync(campaign.templateFile).toString();

// Now read in the address file, containing lines with "Name, email"
fs.readFile(campaign.addressFile, function (err, data) {
    if (err) {
        logToFile(err);
        throw err;
    }

    // now that we've read the file, need to parse it
    csv.parse(data.toString(), function (parseError, output) {
        if (parseError) {
            logToFile(parseError);
            throw parseError;
        }

        // for each line from the file
        var lineNumber = 0;
        output.forEach(function (record) {
            lineNumber++;

            if (record.length != 2) {
                logToFile("Invalid entry on line " + lineNumber.toString() + ", which has " + record.length.toString() + " columns");
                return;
            }

            var name = record[0].trim();
            var email = record[1].trim();

            var message = {
                from: campaign.from,
                to: '"' + name + '" &lt;' + email + '&gt;',
                subject: campaign.subject,
                attachment:
                [
                    // my template only has a single placeholder - "[person]"
                    { data: template.replace('[person]', name), alternative: true }
                ]
            };

            server.send(message, function (err, message) {
                logToFile(message.header.to.toString() + ", " + (err || 'success').toString() );
            });
        });
    });
});
```
