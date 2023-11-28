---
layout: page
title: "Ed-Fi Client Generation in Python with Swagger CLI"
date: 2023-11-27
comments: true
tags:
- ed-fi
- programming
sharing: true
---

## Motivation

The [Ed-Fi ODS/API](https://techdocs.ed-fi.org/display/ODSAPIS3V70) is a REST
API that support interoperability of student data systems. The API definition,
via the [Ed-Fi Data
Standard](https://techdocs.ed-fi.org/display/ETKB/Ed-Fi+Standards), is
extensible: many large-scale or specialized implementations add their own local
use cases that are not supported out of the box by the Ed-Fi Data Standard.
Furthermore, the Data Standard receives regular updates; sometimes these are
merely additive, and from time to time there are breaking changes. These factors
make it impossible to create a one-size fits all client application.

That's where [Swagger Codegen](https://swagger.io/tools/swagger-codegen/) comes
in. You can use it to create API clients based on the running instance's OpenAPI
(Swagger) specification. The basic process of creating a C# code library (SDK)
is described in Ed-Fi documentation at [Using Code Generation to Create an
SDK](https://techdocs.ed-fi.org/display/ODSAPIS3V70/Using+Code+Generation+to+Create+an+SDK)
(Note: this link is for ODS/API 7.0, but the instructions are essentially the
same for all versions).

But what about Python? And do you really need to have a local copy of Java to
use the code generation tool? Short answer: no, you can use Docker; and it does
support Python. Let's see what this looks like.

## Generating an Ed-Fi Client

The Swagger Codegen tool is available as a [pre-built Docker
image](https://github.com/swagger-api/swagger-codegen#public-pre-built-docker-images),
at repository `swaggerapi/swagger-codegen-cli`. Let's try using it to build a
client for working with Ed-Fi Data Standard v4.0, which is available through
Ed-Fi ODS/API v6.1. The [ODS/API Landing Page](https://api.ed-fi.org/) has links
to the Swagger UI-based "documentation" (UI on top of OpenAPI specification) for
all currently supported versions of the ODS/API. From there, we can find a link
to the [specification
document](https://api.ed-fi.org/v6.1/api/metadata/data/v3/resources/swagger.json).

So let's try it out. This example uses PowerShell, and is easily adaptable to
Bash or other shell.

```powerShell
$url = "https://api.ed-fi.org/v6.1/api/metadata/data/v3/resources/swagger.json"
$outputDir = "./edfi4-client"
New-Item -Path $outputDir -Type Directory -Force | out-null
$outputDir = (Resolve-Path $outputDir)
docker run --rm -v "$($outputDir):/local" swaggerapi/swagger-codegen-cli generate `
    -i $url -l python -o /local
```

On my machine, this took about a minute to run. And what did we get for our trouble?

```powerShell
> ls

    Directory: C:\source\stephenfuqua.github.io\edfi4-client


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        11/27/2023   9:31 PM                .swagger-codegen
d-----        11/27/2023   9:31 PM                docs
d-----        11/27/2023   9:32 PM                out
d-----        11/27/2023   9:31 PM                swagger_client
d-----        11/27/2023   9:31 PM                test
-a----        11/27/2023   9:31 PM            786 .gitignore
-a----        11/27/2023   9:31 PM           1030 .swagger-codegen-ignore
-a----        11/27/2023   9:31 PM            359 .travis.yml
-a----        11/27/2023   9:31 PM           1663 git_push.sh
-a----        11/27/2023   9:31 PM         351139 README.md
-a----        11/27/2023   9:31 PM             96 requirements.txt
-a----        11/27/2023   9:31 PM           1811 setup.py
-a----        11/27/2023   9:31 PM             69 test-requirements.txt
-a----        11/27/2023   9:31 PM            149 tox.ini
```

We have code, we have tests, and even documentation. Here is a sample usage from
one of the auto-generated docs:

```python
from __future__ import print_function
import time
import swagger_client
from swagger_client.rest import ApiException
from pprint import pprint

# Configure OAuth2 access token for authorization: oauth2_client_credentials
configuration = swagger_client.Configuration()
configuration.access_token = 'YOUR_ACCESS_TOKEN'

# create an instance of the API class
api_instance = swagger_client.AcademicWeeksApi(swagger_client.ApiClient(configuration))
id = 'id_example' # str | A resource identifier that uniquely identifies the resource.
if_match = 'if_match_example' # str | The ETag header value used to prevent the DELETE from removing a resource modified by another consumer. (optional)

try:
    # Deletes an existing resource using the resource identifier.
    api_instance.delete_academic_week_by_id(id, if_match=if_match)
except ApiException as e:
    print("Exception when calling AcademicWeeksApi->delete_academic_week_by_id: %s\n" % e)
```

## Converting to Poetry

I like to use [Poetry](https://python-poetry.org/) for managing Python packages
instead of Pip, Conda, Tox, etc. Converting the `requirements.txt` file for use
in Poetry is quite easy with this PowerShell command ([hat
tip](https://stackoverflow.com/a/73691994/30384)):

```powerShell
cd edfi4-client
poetry init --name edfi4-client -l Apache-2.0
@(cat requirements.txt) | %{&poetry add $_.replace(' ','')}
```

(The default `requirements.txt` file has some unexpected spaces; the `replace`
command above strips those out).

## Missing Token Generation

Note the line above with `access_token = 'YOUR_ACCESS_TOKEN'`. The Swagger
Codegen requires you to bring your own token generation routine. We could use
something like the
[requests-oauthlib](https://pypi.org/project/requests-oauthlib/) library; since
the generated client does not use `requests`, however, I would prefer to burden
the application with a larger set of dependencies.

```powerShell
poetry add requests-oauthlib
```
