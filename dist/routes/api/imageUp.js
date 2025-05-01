"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploader = express_1.default.Router();
const outDir = path_1.default.resolve(__dirname, `../../../images/uploaded-images`);
if (!fs_1.default.existsSync(outDir)) {
    fs_1.default.mkdirSync(outDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, outDir);
    },
    filename: function (req, file, callback) {
        const parsed = path_1.default.parse(file.originalname);
        const imgName = parsed.name;
        const uniqueSuffix = Date.now() + Math.round(Math.random());
        callback(null, imgName + '-' + uniqueSuffix + '.jpg');
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
}).single('image');
function checkFileType(file, cb) {
    // Extention Checking
    const isJpg = path_1.default.extname(file.originalname).toLowerCase() === '.jpg' &&
        file.mimetype === 'image/jpeg';
    if (isJpg) {
        return cb(null, true);
    }
    else {
        cb('Error: Only .jpg images are allowed!');
    }
}
uploader.post('/', upload, (req, res, next) => {
    res.redirect(301, 'http://example.com');
});
exports.default = uploader;
