import tl = require('azure-pipelines-task-lib/task');
import fs from 'fs';
import path from 'path';

export function convertToHTML(jsonInputPath: string, htmloutputDirectory: string, htmlOutputName: string): void {
    
    const htmlOutputPath = path.join(htmloutputDirectory, htmlOutputName);
    fs.readFile(jsonInputPath, 'utf8', (err, data) => {
        if (err) {
            tl.setResult(tl.TaskResult.Failed, `Unable to read JSON output: ${err.message}`);
            return;
        }

        const jsonData = JSON.parse(data);

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

        fs.writeFile(htmlOutputPath, htmlContent, 'utf8', (err) => {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, `Unable to write HTML output: ${err.message}`);                
            }
            console.log(`HTML report generated at: ${htmlOutputPath}`);           
        });
    });
}
