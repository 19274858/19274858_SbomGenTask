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
exports.getSbom = void 0;
const tl = require("azure-pipelines-task-lib/task");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
function getSbom(solutionName, outputDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Installing CycloneDX tool...');
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)('dotnet tool install --global CycloneDX', (err, stdout, stderr) => {
                if (err) {
                    tl.setResult(tl.TaskResult.Failed, `Unable to install CycloneDX tool: ${stderr}`);
                    return reject(err);
                }
                console.log(stdout);
                const jsonOutputName = 'SBOM.json';
                // Execute CycloneDX
                const command = `dotnet CycloneDX ${solutionName} --output ${outputDirectory} --filename ${jsonOutputName} --json`;
                console.log(`Executing: ${command}`);
                (0, child_process_1.exec)(command, (err, stdout, stderr) => {
                    if (err) {
                        tl.setResult(tl.TaskResult.Failed, `Unable to execute CycloneDX tool: ${stderr}`);
                        return reject(err);
                    }
                    console.log(stdout);
                    // Read JSON output
                    const jsonOutputPath = path_1.default.join(outputDirectory, jsonOutputName);
                    console.log(`Produced SBOM with CycloneDX tool: ${jsonOutputPath}`);
                    resolve(jsonOutputPath);
                });
            });
        });
    });
}
exports.getSbom = getSbom;
