---
title: OpenAPI to CSV with Help from GitHub Copilot
date: 2025-01-24

tags:
- programming
- tech
- ed-fi
---

Following up on [Grudgingly Accepting AI Coding
Assistants](./2025-01-14-accepting-ai-assistants.md), I have a small win from my
first experiment with GitHub Copilot: a Python script for converting portions of
an Open API specification file to a CSV. There is nothing revolutionary in this
small win; countless programmers have doubtlessly done much more. But a
reluctant engineer has to start somewhere.

<div class="image">
![Screenshot of prompt entry and Copilot response](/img/openapi-to-csv-copilot.png)
</div>

<!-- truncate -->

:::tip

Postscript 3/22/2025: Now available in an expanded form, supporting both Open API version 2 (Swagger)
and version 3, at [openapi-to-csv](https://github.com/Ed-Fi-Exchange-OSS/openapi-to-csv)

:::

## Context

Interoperability with the [Ed-Fi Data
Standard](https://docs.ed-fi.org/reference/data-exchange) is mediated through a
REST API, which is documented via an [Open API](https://www.openapis.org/)
specification. Conversion of portions of the specification to CSV could simplify
comparison to other specifications and/or ingestion into a data catalog.

The specification file describes the HTTP-based interactions available in the
API application, including the schemas for the `POST` and `PUT` request bodies
and `GET` response bodies. These schemas are, in practice, the tangible
realization of the Ed-Fi Data Standard. Thus, a CSV file containing the a
listing of all of the properties for each path _is_ a listing of the elements of
the _effective_ Ed-Fi Data Standard.

:::info

There are small divergences between the Data Standard and this API
Specification, such as how school years are represented. However, since actual
exchange of data occurs through the API, then the API specification is the
"physical" source of truth that we need to work with.

:::

## Example

Below is a greatly truncated extract from the Ed-Fi API spec:

```javascript
{
  "openapi": "3.0.1",
  "info": {},
  "servers": [],
  "paths": {
    "/ed-fi/absenceEventCategoryDescriptors": {
      "get": {
        "summary": "Retrieves specific resources using the resource's property values (using the \"Get\" pattern).",
        "description": "This GET operation provides access to resources using the \"Get\" search pattern.  The values of any properties of the resource that are specified will be used to return all matching results (if it exists).",
        "responses": {
          "200": {
            "description": "The requested resource was successfully retrieved.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/edFi_absenceEventCategoryDescriptor"
                  }
                }
              }
            }
          },
        }
      }
    }
  }
}
```

The `$ref` line points a reusable definition of the object used in `GET`
responses and `POST` and `PUT` requests (again, truncated for brevity):

```javascript
 "components": {
    "schemas": {
      "edFi_absenceEventCategoryDescriptor": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": ""
          },
          "codeValue": {
            "maxLength": 50,
            "type": "string",
            "description": "A code or abbreviation that is used to refer to the descriptor.",
            "x-Ed-Fi-isIdentity": true
          },
          "namespace": {
            "maxLength": 255,
            "type": "string",
            "description": "A globally unique namespace that identifies this descriptor set. Author is strongly encouraged to use the Universal Resource Identifier (http, ftp, file, etc.) for the source of the descriptor definition. Best practice is for this source to be the descriptor file itself, so that it can be machine-readable and be fetched in real-time, if necessary.",
            "x-Ed-Fi-isIdentity": true
          },
          "description": {
            "maxLength": 1024,
            "type": "string",
            "description": "The description of the descriptor.",
            "x-nullable": true
          }
        }
      }
```

Putting this information together, the desired output would be:

| Path                                   | Property Name | Property Type | Description                    |
| -------------------------------------- | ------------- | ------------- | ------------------------------ |
| /ed-fi/absenceEventCategoryDescriptors | id            | string        |                                |
| /ed-fi/absenceEventCategoryDescriptors | codeValue     | string        | A code or abbreviation...      |
| /ed-fi/absenceEventCategoryDescriptors | namespace     | string        | A globally unique namespace... |
| /ed-fi/absenceEventCategoryDescriptors | description   | string        | The description of the...      |

## AI Assistant's Output

I've not had time to do much work in Python for the past year, so I'm a bit
rusty. And, I'm very pressed for time. 💡Light bulb moment: maybe an AI
assistant can help me out. Let's give GitHub Copilot a shot at this.

> Using the attached Open API input file as an example, generate a Python
> program that converts this file into a CSV file with one row for every schema
> property, and columns for the schema name, property name, property type, and
> description. Also add a column for the path associated with that schema
> component.

The prompt was easy to write and feels natural. I don't really need the schema
name, but I suspect it will be useful. The last part, about appending the Path,
purposefully assumes an understanding of OpenAPI: namely, how to connect the
dots from a `schema` back up to `path`, via `$ref`. I do not expect success with
the Path.

The code output by GitHub Copilot is listed in the [appendix
below](#original-output). I run it. A short time later, it finishes with a clean
exit and a shiny new CSV file in my directory.

But is it right?

| schema_name                          | property_name | property_type | description        | path                                   |
| ------------------------------------ | ------------- | ------------- | ------------------ | -------------------------------------- |
| edFi_absenceEventCategoryDescriptor  | id            | string        |                    | /ed-fi/absenceEventCategoryDescriptors |
| edFi_absenceEventCategoryDescriptor  | codeValue     | string        | A code or...       | /ed-fi/absenceEventCategoryDescriptors |
| edFi_absenceEventCategoryDescriptor  | namespace     | string        | "A globally...     | /ed-fi/absenceEventCategoryDescriptors |
| edFi_absenceEventCategoryDescriptor  | description   | string        | The description... | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicHonorCategoryDescriptor | id            | string        |                    | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicHonorCategoryDescriptor | codeValue     | string        | A code or...       | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicHonorCategoryDescriptor | namespace     | string        | "A globally...     | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicHonorCategoryDescriptor | description   | string        | The description... | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicSubjectDescriptor       | id            | string        |                    | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicSubjectDescriptor       | codeValue     | string        | A code or...       | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicSubjectDescriptor       | namespace     | string        | "A globally...     | /ed-fi/absenceEventCategoryDescriptors |
| edFi_academicSubjectDescriptor       | description   | string        | The description... | /ed-fi/absenceEventCategoryDescriptors |

It is! (Sidenote: the quotation marks on the `description` of `namespace` are due to the
presence of commas). How did it get the paths right? Let's look at a bit of code:

```python
    for path, path_details in paths.items():
        for schema_name, schema in schemas.items():
            rows.extend(process_schema(schema_name, schema, path))
```

It simply iterates over the path elements 🤔. Let's look at the output again.
Oh.... look carefully at the last entry shown above: it has the wrong path. My
initial enthusiasm short-circuited my quality assurance brain and I stopped
looking carefully after the first several rows. The correctness of those first
rows was just happenstance, from the alphabetic order of the elements in the
specification file.

## Revision

Can I revise the prompt in a way that will instruct Copilot on how to navigate
OpenAPI?

Perhaps. But why bother? Time for the human to take over. We can easily convert
the `schema_name` column into the desired content from the `path` column.
Telling Copilot how to do this would take me longer than simply writing it in
Python myself.

```python
(namespace, entity) = schema_name.split("_", 1)
path = f"/{namespace}/{entity}"
```

## Conclusion

Given my rust, Copilot saved me 15 to 30 minutes of jogging my memory and
iterating over the small mistakes I likely would have made. It took me most of
the way, and I was able to take over quickly to finish the job.

A more skillful engineer could surely instruct the assistant on how to navigate the
Open API specification to achieve the desired goal. But this is entirely
unnecessary; it would have been a poor use of time and electricity.

It was a simple script that will help avoid hours of tedious, manual labor to
convert the JSON to CSV. The stakes were low - this is not a production
application, the script size is small, and reinforcing my Python skills is not a
present priority - and yet this felt like a small win that even this reluctant
user is happy to accept.

## Appendix: the Code

### Original Output

```python
import json
import csv

def extract_schemas(openapi_data):
    schemas = openapi_data.get('components', {}).get('schemas', {})
    return schemas

def extract_paths(openapi_data):
    paths = openapi_data.get('paths', {})
    return paths

def process_schema(schema_name, schema, path):
    rows = []
    properties = schema.get('properties', {})
    for prop_name, prop_details in properties.items():
        row = {
            'schema_name': schema_name,
            'property_name': prop_name,
            'property_type': prop_details.get('type', 'N/A'),
            'description': prop_details.get('description', 'N/A'),
            'path': path
        }
        rows.append(row)
    return rows

def main():
    with open('swagger.json', 'r') as f:
        openapi_data = json.load(f)

    schemas = extract_schemas(openapi_data)
    paths = extract_paths(openapi_data)

    rows = []
    for path, path_details in paths.items():
        for schema_name, schema in schemas.items():
            rows.extend(process_schema(schema_name, schema, path))

    with open('output.csv', 'w', newline='') as csvfile:
        fieldnames = ['schema_name', 'property_name', 'property_type', 'description', 'path']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in rows:
            writer.writerow(row)

if __name__ == '__main__':
    main()
```

### Modified Version

With additional modification to remove `schema_name` and place `path` as the
first column.

```python
import json
import csv

def extract_schemas(openapi_data):
    schemas = openapi_data.get('components', {}).get('schemas', {})
    return schemas

def convert_to_path(schema_name):
    (namespace, entity) = schema_name.split("_", 1)
    return f"/{namespace}/{entity}"

def process_schema(schema_name, schema):
    rows = []
    properties = schema.get('properties', {})
    for prop_name, prop_details in properties.items():
        # Only interested in schemas of form "<namespace>_<entity>". Lazily just check for underscore.
        if not "_" in schema_name:
            continue

        row = {
            'path': convert_to_path(schema_name),
            'property_name': prop_name,
            'property_type': prop_details.get('type', 'N/A'),
            'description': prop_details.get('description', 'N/A')
        }
        rows.append(row)
    return rows

def main():
    with open('swagger.json', 'r') as f:
        openapi_data = json.load(f)

    schemas = extract_schemas(openapi_data)

    rows = []
    for schema_name, schema in schemas.items():
        rows.extend(process_schema(schema_name, schema))

    with open('output.csv', 'w', newline='') as csvfile:
        fieldnames = ['path', 'property_name', 'property_type', 'description']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in rows:
            writer.writerow(row)

if __name__ == '__main__':
    main()
```
