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
var cycloneDxAgent_1 = require("./src/agents/cycloneDxAgent");
var htmlProducer_1 = require("./src/producers/htmlProducer");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var reportoutputname, includeColumns, workingDirectory, outputDirectory, solution, jsonOutputPath, htmlOutputPath, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    reportoutputname = tl.getInput('reportoutputname', true);
                    includeColumns = tl.getInput('includeColumns', true);
                    workingDirectory = tl.getVariable('System.DefaultWorkingDirectory');
                    outputDirectory = tl.getVariable('build.artifactstagingdirectory');
                    // Find the .sln file in the working directory
                    console.log('Searching for .sln file...');
                    solution = findSolutionFile(workingDirectory);
                    if (!solution) {
                        tl.setResult(tl.TaskResult.Failed, 'No .sln file found in the working directory.');
                        return [2 /*return*/];
                    }
                    console.log("Solution file path: ".concat(solution));
                    console.log("Output directory: ".concat(outputDirectory));
                    return [4 /*yield*/, (0, cycloneDxAgent_1.getSbom)(solution, outputDirectory)];
                case 1:
                    jsonOutputPath = _a.sent();
                    if (!jsonOutputPath) {
                        tl.setResult(tl.TaskResult.Failed, "Failed to install CycloneDX and run tool to get the output SBOM.json");
                        return [2 /*return*/];
                    }
                    htmlOutputPath = (0, htmlProducer_1.convertToHTML)(jsonOutputPath, outputDirectory);
                    tl.setResult(tl.TaskResult.Succeeded, "SBOM analysis completed successfully. SBOM HTML report generated at: ".concat(htmlOutputPath));
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    tl.setResult(tl.TaskResult.Failed, err_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
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
