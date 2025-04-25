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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const resizer = (img) => __awaiter(void 0, void 0, void 0, function* () {
    const outDir = path.resolve(__dirname, '../../../output-images');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    const inputFile = path.resolve(__dirname, '../../../images/fjord.jpg');
    const outputFile = path.join(outDir, 'fjord-300x200.jpg');
    try {
        yield sharp(inputFile).resize(300, 200).toFile(outputFile);
        return `✅ Saved resized image to ${outputFile}`;
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = resizer;
