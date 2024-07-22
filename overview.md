# SBOM Generator task

## Overview

The **SBOMGen** is an Azure DevOps extension that allows you to extract a list of dependeniced of the .NET aplication, match them with a vulnerability database (e.g. GitHub Advisory Database) and output SBOM report in HTML format. 

## Features

- **Read JSON Array:** Reads a JSON array file from the build directory.
- **Call API:** Sends each JSON object in the array to a specified API endpoint.
- **Save Output:** Collects the responses and writes them to an output JSON file in the build directory.
- **Error Handling:** Handles errors gracefully by capturing them and including error messages in the output file.

## Usage
Install as a part of your Azure build pipeline.
### Prerequisites


