"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCsv = void 0;
var tl = require("azure-pipelines-task-lib/task");
var fs_1 = __importDefault(require("fs"));
function convertToCsv(jsonOutputPath, htmlOutputPath) {
    fs_1.default.readFile(jsonOutputPath, 'utf8', function (err, data) {
        if (err) {
            tl.setResult(tl.TaskResult.Failed, "Failed to read JSON output: ".concat(err.message));
            return;
        }
        var jsonData = JSON.parse(data);
        var htmlContent = "\n        <!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>CycloneDX Report</title>\n        </head>\n        <body>\n            <h1>CycloneDX Report</h1>\n            <pre>".concat(JSON.stringify(jsonData, null, 2), "</pre>\n        </body>\n        </html>");
        fs_1.default.writeFile(htmlOutputPath, htmlContent, 'utf8', function (err) {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, "Failed to write HTML output: ".concat(err.message));
            }
        });
    });
}
exports.convertToCsv = convertToCsv;
