import tl = require('azure-pipelines-task-lib/task');
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        // Get the solution file path
        const solution: string | undefined = tl.getPathInput('solution', true, true);
        const outputDirectory: string| undefined = tl.getVariable('build.artifactstagingdirectory')!;
        console.log('solution: ' + solution);
        console.log('outputDirectory: ' + outputDirectory);
        // Install CycloneDX tool
        console.log('Installing CycloneDX tool...');
        exec('dotnet tool install --global CycloneDX', (err, stdout, stderr) => {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, `Failed to install CycloneDX tool: ${stderr}`);
                return;
            }
            console.log(stdout);

            // Execute CycloneDX
            const command = `dotnet CycloneDX ${solution} --output ${outputDirectory} --json`;
            console.log(`Executing: ${command}`);
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    tl.setResult(tl.TaskResult.Failed, `Failed to execute CycloneDX tool: ${stderr}`);
                    return;
                }
                console.log(stdout);

                // Read JSON output
                const jsonOutputPath = path.join(outputDirectory, 'bom.json');
                fs.readFile(jsonOutputPath, 'utf8', (err, data) => {
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
                        tl.setResult(tl.TaskResult.Succeeded, 'CycloneDX analysis completed successfully.');
                    });
                });
            });
        });
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, (err  as Error).message);
    }
}

run();
