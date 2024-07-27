import tl = require('azure-pipelines-task-lib/task');
import { getSbom } from './src/agents/cycloneDxAgent';
import { getPackageInfo } from './src/providers/githubVulnerabilityProvider';
import { convertToHTML } from './src/producers/htmlProducer';
import { convertToCsv } from './src/producers/csvProducer';
import fs from 'fs';
import path from 'path';

async function run() {
    try {
        // Get the working directory
        const reportoutputname: string = tl.getInput('reportoutputname', true)!;
        const includeColumns: string = tl.getInput('includeColumns', true)!;
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
        const jsonOutputPath = await getSbom(solution, outputDirectory);
        
        if (!jsonOutputPath) {
            tl.setResult(tl.TaskResult.Failed, `Failed to install CycloneDX and run tool to get the output SBOM.json`);
            return;
        }
        
        const htmlOutputPath = convertToHTML(jsonOutputPath, outputDirectory);   

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

run();
