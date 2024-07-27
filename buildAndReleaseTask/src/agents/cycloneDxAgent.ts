import tl = require('azure-pipelines-task-lib/task');
import { exec } from 'child_process';
import path from 'path';

export async function getSbom(solutionName: string, outputDirectory: string): Promise<string> {
    console.log('Installing CycloneDX tool...');
    return new Promise((resolve, reject) => {
        exec('dotnet tool install --global CycloneDX', (err, stdout, stderr) => {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, `Unable to install CycloneDX tool: ${stderr}`);
                return reject(err);
            }
            console.log(stdout);
            const jsonOutputName = 'SBOM.json';
            // Execute CycloneDX
            const command = `dotnet CycloneDX ${solutionName} --output ${outputDirectory} --filename ${jsonOutputName} --json`;
            console.log(`Executing: ${command}`);
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    tl.setResult(tl.TaskResult.Failed, `Unable to execute CycloneDX tool: ${stderr}`);
                    return reject(err);
                }
                console.log(stdout);
                // Read JSON output
                const jsonOutputPath = path.join(outputDirectory, jsonOutputName);
                console.log(`Produced SBOM with CycloneDX tool: ${jsonOutputPath}`);
                resolve(jsonOutputPath);
            });           
        });
    });
}