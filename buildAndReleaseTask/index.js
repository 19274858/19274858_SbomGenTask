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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tl = require("azure-pipelines-task-lib/task");
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var workingDirectory, outputDirectory_1, solution_1;
        return __generator(this, function (_a) {
            try {
                workingDirectory = tl.getVariable('System.DefaultWorkingDirectory');
                outputDirectory_1 = tl.getVariable('build.artifactstagingdirectory');
                // Find the .sln file in the working directory
                console.log('Searching for .sln file...');
                solution_1 = findSolutionFile(workingDirectory);
                if (!solution_1) {
                    tl.setResult(tl.TaskResult.Failed, 'No .sln file found in the working directory.');
                    return [2 /*return*/];
                }
                console.log("Solution file path: ".concat(solution_1));
                console.log("Output directory: ".concat(outputDirectory_1));
                // Install CycloneDX tool
                console.log('Installing CycloneDX tool...');
                (0, child_process_1.exec)('dotnet tool install --global CycloneDX', function (err, stdout, stderr) {
                    if (err) {
                        tl.setResult(tl.TaskResult.Failed, "Failed to install CycloneDX tool: ".concat(stderr));
                        return;
                    }
                    console.log(stdout);
                    // Execute CycloneDX
                    var command = "dotnet CycloneDX ".concat(solution_1, " --output ").concat(outputDirectory_1, " --json");
                    console.log("Executing: ".concat(command));
                    (0, child_process_1.exec)(command, function (err, stdout, stderr) {
                        if (err) {
                            tl.setResult(tl.TaskResult.Failed, "Failed to execute CycloneDX tool: ".concat(stderr));
                            return;
                        }
                        console.log(stdout);
                        // Read JSON output
                        var jsonOutputPath = path_1.default.join(outputDirectory_1, 'bom.json');
                        fs_1.default.readFile(jsonOutputPath, 'utf8', function (err, data) {
                            if (err) {
                                tl.setResult(tl.TaskResult.Failed, "Failed to read JSON output: ".concat(err.message));
                                return;
                            }
                            var jsonData = JSON.parse(data);
                            // Convert JSON to HTML
                            var htmlContent = "\n                    <!DOCTYPE html>\n                    <html lang=\"en\">\n                    <head>\n                        <meta charset=\"UTF-8\">\n                        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                        <title>CycloneDX Report</title>\n                    </head>\n                    <body>\n                        <h1>CycloneDX Report</h1>\n                        <pre>".concat(JSON.stringify(jsonData, null, 2), "</pre>\n                    </body>\n                    </html>");
                            var htmlOutputPath = path_1.default.join(outputDirectory_1, 'bom.html');
                            fs_1.default.writeFile(htmlOutputPath, htmlContent, 'utf8', function (err) {
                                if (err) {
                                    tl.setResult(tl.TaskResult.Failed, "Failed to write HTML output: ".concat(err.message));
                                    return;
                                }
                                console.log("HTML report generated at: ".concat(htmlOutputPath));
                                tl.setResult(tl.TaskResult.Succeeded, 'CycloneDX analysis completed successfully.');
                            });
                        });
                    });
                });
            }
            catch (err) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
            return [2 /*return*/];
        });
    });
}
// Helper function to find the solution file
function findSolutionFile(directory) {
    var files = fs_1.default.readdirSync(directory);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var fullPath = path_1.default.join(directory, file);
        if (fs_1.default.statSync(fullPath).isDirectory()) {
            var result = findSolutionFile(fullPath);
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
