"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const cycloneDxAgent_1 = require("./src/agents/cycloneDxAgent");
const githubVulnerabilityProvider_1 = require("./src/providers/githubVulnerabilityProvider");
const htmlProducer_1 = require("./src/producers/htmlProducer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the working directory
            const reportOutputNames = tl.getInput('reportoutputname', true);
            const includeColumns = tl.getInput('includeColumns', true);
            const workingDirectory = tl.getVariable('System.DefaultWorkingDirectory');
            const outputDirectory = tl.getVariable('build.artifactstagingdirectory');
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
            const jsonOutputPath = yield (0, cycloneDxAgent_1.getSbom)(solution, outputDirectory);
            if (!jsonOutputPath) {
                tl.setResult(tl.TaskResult.Failed, `Unable to install CycloneDX and run tool to get the output SBOM.json`);
                return;
            }
            const vulnerabilityInfoJsonPath = yield (0, githubVulnerabilityProvider_1.getVulnerabilityInfo)(jsonOutputPath, outputDirectory, 'SBOM_NUGET_API.json');
            if (!vulnerabilityInfoJsonPath) {
                tl.setResult(tl.TaskResult.Failed, `Unable to get the vulnerability information`);
                return;
            }
            const reportOutputNamesArray = reportOutputNames.split(',');
            reportOutputNamesArray.forEach((reportOutputName) => {
                const htmlOutputPath = (0, htmlProducer_1.convertToHTML)(vulnerabilityInfoJsonPath, outputDirectory, reportOutputName);
            });
            tl.setResult(tl.TaskResult.Succeeded, `SBOM analysis completed successfully. SBOM reports generated at: ${outputDirectory}`);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
// Helper function to find the solution file
function findSolutionFile(directory) {
    const files = fs_1.default.readdirSync(directory);
    for (const file of files) {
        const fullPath = path_1.default.join(directory, file);
        if (fs_1.default.statSync(fullPath).isDirectory()) {
            const result = findSolutionFile(fullPath);
            if (result)
                return result;
        }
        else if (file.endsWith('.sln')) {
            return fullPath;
        }
    }
    return null;
}
run();
