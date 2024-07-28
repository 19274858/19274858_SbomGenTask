"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToHTML = void 0;
const tl = require("azure-pipelines-task-lib/task");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function convertToHTML(jsonInputPath, htmloutputDirectory, htmlOutputName) {
    const htmlOutputPath = path_1.default.join(htmloutputDirectory, htmlOutputName);
    fs_1.default.readFile(jsonInputPath, 'utf8', (err, data) => {
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
        fs_1.default.writeFile(htmlOutputPath, htmlContent, 'utf8', (err) => {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, `Unable to write HTML output: ${err.message}`);
            }
            console.log(`HTML report generated at: ${htmlOutputPath}`);
        });
    });
}
exports.convertToHTML = convertToHTML;
