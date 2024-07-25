import tl = require('azure-pipelines-task-lib/task');
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        // Get the working directory
        const workingDirectory: string = tl.getVariable('System.DefaultWorkingDirectory')!;
        const outputDirectory: string = tl.getVariable('build.artifactstagingdirectory')!;
        
        // Find the .sln file in the working directory
        console.log('Searching for .sln file...');
        const solution = findSolutionFile(workingDirectory);
        if (!solution) {
            tl.setResult(tl.TaskResult.Failed, 'No .sln file found in the working directory.');
            return;
        }
        console.log(`Solution file path: ${solution}`);
        console.log(`Output directory: ${outputDirectory}`);
         // Install and run CycloneDX tool
        const jsonOutputPath = getSbomJsonFromCycloneDXApp(solution, outputDirectory);
        
        if (!jsonOutputPath) {
            tl.setResult(tl.TaskResult.Failed, `Failed to install CycloneDX and run tool to get the output SBOM.json`);
            return;
        }
        const htmlOutputPath = getHTMLFileFromJson(jsonOutputPath, outputDirectory);   

        tl.setResult(tl.TaskResult.Succeeded, `SBOM analysis completed successfully. SBOM HTML report generated at: ${htmlOutputPath}`);
        
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, (err as Error).message);
    }
}

// Helper function to find the solution file
function findSolutionFile(directory: string): string | null {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const result = findSolutionFile(fullPath);
            if (result) return result;
        } else if (file.endsWith('.sln')) {
            return fullPath;
        }
    }
    return null;
}

// Helper function to download and execute CycloneDX application.
//Returns: full path to the SBOM report
function getSbomJsonFromCycloneDXApp(solutionName: string, outputDirectory: string): string | null {
    // Install CycloneDX tool
    console.log('Installing CycloneDX tool...');
    exec('dotnet tool install --global CycloneDX', (err, stdout, stderr) => {
        if (err) {
            tl.setResult(tl.TaskResult.Failed, `Failed to install CycloneDX tool: ${stderr}`);
            return;
        }
        console.log(stdout);

        // Execute CycloneDX
        const command = `dotnet CycloneDX ${solutionName} --output ${outputDirectory} --json`;
        console.log(`Executing: ${command}`);
        exec(command, (err, stdout, stderr) => {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, `Failed to execute CycloneDX tool: ${stderr}`);
                return;
            }
            console.log(stdout);
            // Read JSON output
            const jsonOutputPath = path.join(outputDirectory, 'bom.json');
            console.log('Installing CycloneDX tool...');
            return jsonOutputPath;
        });
    });

    return null;
}

// Helper function to convert JSON to HTML 
function getHTMLFileFromJson(jsonInputPath: string, outputDirectory: string): string | null {
    fs.readFile(jsonInputPath, 'utf8', (err, data) => {
        if (err) {
            tl.setResult(tl.TaskResult.Failed, `Failed to read JSON output: ${err.message}`);
            return;
        }

        const jsonData = JSON.parse(data);

        // Convert JSON to HTML
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CycloneDX Report</title>
        </head>
        <body>
            <h1>CycloneDX Report</h1>
            <pre>${JSON.stringify(jsonData, null, 2)}</pre>
        </body>
        </html>`;

        const htmlOutputPath = path.join(outputDirectory, 'bom.html');
        fs.writeFile(htmlOutputPath, htmlContent, 'utf8', (err) => {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, `Failed to write HTML output: ${err.message}`);
                return;
            }
            console.log(`HTML report generated at: ${htmlOutputPath}`);           
        });

        return htmlOutputPath;
    });

    return null;
}

run();
