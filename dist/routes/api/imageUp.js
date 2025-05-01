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
const outDir = path_1.default.resolve(__dirname, `../../../images`);
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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
    const filetypes = /jpeg|jpg/;
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Error: Only .jpg images are allowed!'));
    }
}
uploader.post('/', (req, res) => {
    upload(req, res, (err) => {
        var _a, _b;
        if (err instanceof multer_1.default.MulterError) {
            console.error('Multer error:', err);
            return res.status(500).send(`Multer uploading error: ${err.message}`);
        }
        else if (err) {
            console.error('Upload error:', err);
            return res.status(500).send(err.message || 'File upload error');
        }
        console.log('File uploaded successfully:', req.file);
        res.status(200).json({
            message: 'File uploaded successfully',
            filename: (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename,
            path: (_b = req.file) === null || _b === void 0 ? void 0 : _b.path,
        });
    });
});
exports.default = uploader;
