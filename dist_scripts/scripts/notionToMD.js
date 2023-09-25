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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var client_1 = require("@notionhq/client");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var page_id = "e8ff4f278a5040d6b7b188ab36773668"; // Page ID
var database_id = "fc70cf18bfa94a969a42b4b06e777ead";
var secret = "secret_3WkfUjYJoXy5dYjb9Xfj0o8poF46cLkvykYCUXw5r96";
var notion = new client_1.Client({ auth: secret });
var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
    var items, database, _i, _a, techRadarElement, isLeft, isRight, name_1, link, stage, quadrant, revision;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                items = [];
                return [4 /*yield*/, notion.databases.query({ database_id: database_id })];
            case 1:
                database = _b.sent();
                for (_i = 0, _a = database.results; _i < _a.length; _i++) {
                    techRadarElement = _a[_i];
                    isLeft = techRadarElement.properties.Name.title.length === 0;
                    isRight = techRadarElement.properties.type.select === null ||
                        techRadarElement.properties.type.select.length === 0;
                    if (isLeft || isRight)
                        continue;
                    name_1 = techRadarElement.properties.Name.title.at(0).text.content;
                    link = techRadarElement.properties.Name.title.at(0).text.link;
                    stage = techRadarElement.properties.Stage.status.name.toLowerCase();
                    quadrant = techRadarElement.properties.type.select.name;
                    revision = { name: name_1, link: link, stage: stage, quadrant: quadrant };
                    items.push(revision);
                }
                return [2 /*return*/, items];
        }
    });
}); };
var generateMarkdownFiles = function (items, outputDirectory) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, items_1, item, markdownContent, filename, outputPath;
    return __generator(this, function (_a) {
        if (!fs_1.default.existsSync(outputDirectory)) {
            fs_1.default.mkdirSync(outputDirectory);
        }
        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
            item = items_1[_i];
            markdownContent = "---\n      title: \"".concat(item.name, "\"\n      ring: \"").concat(item.stage, "\"\n      quadrant: \"").concat(item.quadrant, "\"\n      ").concat(item.link ? "info: \"".concat(item.link, "\"") : "", "\n      featured: ").concat(item.link !== null ? item.link : true, "\n      ---\n      Text goes here. You can use **markdown** here.");
            filename = "".concat(item.name, ".md");
            outputPath = path_1.default.join(outputDirectory, filename);
            // Write the Markdown content to the file
            fs_1.default.writeFileSync(outputPath, markdownContent);
            console.log("Saved ".concat(filename, " to ").concat(outputPath));
        }
        console.log("Markdown files saved successfully.");
        return [2 /*return*/];
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchData()];
            case 1:
                items = _a.sent();
                return [4 /*yield*/, generateMarkdownFiles(items, "radar")];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
