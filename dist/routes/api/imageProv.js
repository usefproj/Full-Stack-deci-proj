"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const provider = express_1.default.Router();
const imagesDir = path_1.default.resolve(__dirname, `../../../images`);
const getImageFilesRecursively = (dir, fileList = []) => {
    const files = fs_1.default.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path_1.default.join(dir, file);
        const stat = fs_1.default.statSync(filePath);
        if (stat.isDirectory()) {
            getImageFilesRecursively(filePath, fileList);
        }
        else {
            if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
                const relativePath = path_1.default.relative(imagesDir, filePath);
                fileList.push(relativePath);
            }
        }
    });
    return fileList;
};
provider.get('/list', (req, res) => {
    try {
        const imageFiles = getImageFilesRecursively(imagesDir);
        res.json(imageFiles);
    }
    catch (err) {
        res.status(500).json({ error: 'Unable to list images' });
    }
});
provider.use('/', express_1.default.static(imagesDir));
exports.default = provider;
