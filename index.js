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
const unist_util_visit_1 = require("unist-util-visit");
const node_path_1 = __importDefault(require("node:path"));
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
const staticImages = (options) => (tree, file, done) => {
    const tasks = [];
    (0, unist_util_visit_1.visit)(tree, "element", (node) => {
        if (node.tagName === "img") {
            tasks.push(processImage(options, file, node));
        }
    });
    Promise.all(tasks).then(() => done());
};
const processImage = (options, file, node) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const root = file.dirname || process.cwd();
    // Get raw document data from ContentLayer, which contains source file directory e.g. "reflection"
    const data = file.data;
    const directory = data.rawDocumentData.sourceFileDir;
    // Get src attribute of the <img src="..."/> tag, or empty. e.g. "images/example.png"
    const filePath = ((_a = node.properties) === null || _a === void 0 ? void 0 : _a.src) || "";
    // Get the path of the image with the root folder prepended. e.g. "/home/aelliixx/WebstormProjects/ue-docs/ue-docs-pages/documentation/images/example.png"
    const imagePath = node_path_1.default.join(root, filePath);
    // Get image metadata, including width and height.
    const image = yield (0, sharp_1.default)(imagePath);
    const { width, height } = yield image.metadata();
    // Filter out the source dir (e.g. "/images/") because we don't want to add another images folder in the public folder.
    const src = node_path_1.default.join(directory, filePath.replace(options.sourceDir, "")); // e.g. "reflection/example.png"
    const target = node_path_1.default.join(process.cwd(), options.publicDir, src); // e.g. "/home/aelliixx/WebstormProjects/ue-docs/public/docs/reflection/example.png"
    const targetDir = node_path_1.default.dirname(target); // e.g. "/home/aelliixx/WebstormProjects/ue-docs/public/docs/reflection"
    yield promises_1.default.mkdir(targetDir, { recursive: true });
    yield promises_1.default.copyFile(imagePath, target);
    node.properties = Object.assign(Object.assign({}, node.properties), { width,
        height, src: node_path_1.default.join(options.resourceDir, src) });
});
exports.default = staticImages;
