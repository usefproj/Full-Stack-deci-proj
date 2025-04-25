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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const imageUp_1 = __importDefault(require("../routes/api/imageUp"));
describe('Image Uploader', () => {
    const uploadDir = path_1.default.resolve(__dirname, '../../images/uploaded-images');
    let app;
    let jpgBuffer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Ensure upload dir exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // Clean up any leftovers
        fs_1.default.readdirSync(uploadDir).forEach((f) => fs_1.default.unlinkSync(path_1.default.join(uploadDir, f)));
        // Create a tiny in-memory JPEG
        jpgBuffer = yield (0, sharp_1.default)({
            create: {
                width: 5,
                height: 5,
                channels: 3,
                background: { r: 128, g: 0, b: 128 },
            },
        })
            .jpeg()
            .toBuffer();
        // Mount router
        app = (0, express_1.default)();
        app.use('/upload', imageUp_1.default);
    }));
    afterAll(() => {
        // Remove test artifacts
        fs_1.default.readdirSync(uploadDir).forEach((f) => fs_1.default.unlinkSync(path_1.default.join(uploadDir, f)));
    });
    it('should accept a .jpg upload and save it to disk', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/upload')
            .attach('image', jpgBuffer, 'photo.jpg');
        expect(res.status).toBe(200);
        const files = fs_1.default.readdirSync(uploadDir);
        expect(files.length).toBe(1);
        // Updated regex: one hyphen, then digits, then .jpg
        expect(files[0]).toMatch(/^photo-\d+\.jpg$/); // ← fixed line :contentReference[oaicite:6]{index=6}
    }));
    it('should reject non-.jpg uploads with a 500 error', () => __awaiter(void 0, void 0, void 0, function* () {
        const fakePng = Buffer.from('not a jpeg');
        const res = yield (0, supertest_1.default)(app)
            .post('/upload')
            .attach('image', fakePng, 'image.png');
        expect(res.status).toBe(500);
        expect(res.text).toContain('Only .jpg images are allowed!'); // from fileFilter :contentReference[oaicite:7]{index=7}
        const files = fs_1.default.readdirSync(uploadDir);
        expect(files.length).toBe(1); // still only the one from the first test
    }));
});
