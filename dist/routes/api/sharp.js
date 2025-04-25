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
exports.resizer = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const resize = express_1.default.Router();
const resizer = (img) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = path_1.default.parse(img);
    const imgName = parsed.name;
    const outDir = path_1.default.resolve(__dirname, '../../../output-images');
    const inputFile = path_1.default.resolve(__dirname, `../../../images/${imgName}.jpg`);
    const outputFile = path_1.default.join(outDir, `${imgName}-300x200.jpg`);
    if (!fs_1.default.existsSync(outDir)) {
        fs_1.default.mkdirSync(outDir, { recursive: true });
    }
    if (fs_1.default.existsSync(outputFile)) {
        return `♻️ Retrieved from cache: ${outputFile}`;
    }
    try {
        yield (0, sharp_1.default)(inputFile).resize(300, 200).toFile(outputFile);
        return `✅ Saved resized image to ${outputFile}`;
    }
    catch (err) {
        console.error(err);
        throw new Error('Image processing failed.');
    }
});
exports.resizer = resizer;
resize.get('/:file', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, exports.resizer)(req.params.file);
        const outputFile = path_1.default.resolve(__dirname, '../../../output-images', `${req.params.file}-300x200.jpg`);
        // NO return here — we’re just sending the file
        res.sendFile(outputFile);
    }
    catch (err) {
        console.error(err);
        // NO return here, either
        res.status(500).send('Image processing failed.');
    }
}));
exports.default = resize;
