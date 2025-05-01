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
    // Ensure this path is correct and matches the output directory in imageUp.ts
    const uploadDir = path_1.default.resolve(__dirname, '../../images');
    let app;
    let jpgBuffer;
    // Use beforeEach to set up and clean before *each* test
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create the upload directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // *** MODIFIED CLEANUP LOGIC ***
        // Clear only the files uploaded by this test suite based on filename pattern
        fs_1.default.readdirSync(uploadDir).forEach((f) => {
            const filePath = path_1.default.join(uploadDir, f);
            // Check if the file name matches the expected uploaded file pattern
            if (f.match(/^photo-\d+-\d+\.jpg$/)) {
                try {
                    // Use unlinkSync to synchronously remove the file
                    fs_1.default.unlinkSync(filePath);
                }
                catch (e) {
                    // Ignore errors if the file is already removed or if there are directory issues
                    console.error(`Error removing test artifact file ${filePath}: ${e}`); // Log potential issues with cleanup
                }
            }
        });
        // *** END MODIFIED CLEANUP LOGIC ***
        // Create a dummy JPG buffer for testing
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
        // Initialize the express app and mount the router
        app = (0, express_1.default)();
        app.use('/upload', imageUp_1.default);
    }));
    // Use afterEach to clean up after *each* test
    afterEach(() => {
        // *** MODIFIED CLEANUP LOGIC ***
        // Clean up only the files uploaded by this test suite based on filename pattern
        fs_1.default.readdirSync(uploadDir).forEach((f) => {
            const filePath = path_1.default.join(uploadDir, f);
            // Check if the file name matches the expected uploaded file pattern
            if (f.match(/^photo-\d+-\d+\.jpg$/)) {
                try {
                    // Use unlinkSync to synchronously remove the file
                    fs_1.default.unlinkSync(filePath);
                }
                catch (e) {
                    // Ignore errors during cleanup
                    console.error(`Error removing test artifact file ${filePath}: ${e}`); // Log potential issues with cleanup
                }
            }
        });
        // *** END MODIFIED CLEANUP LOGIC ***
    });
    it('should accept a .jpg upload and save it to disk', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/upload')
            .attach('image', jpgBuffer, 'photo.jpg');
        // Expect a 200 status code for a successful upload
        expect(res.status).toBe(200);
        const files = fs_1.default.readdirSync(uploadDir);
        // Filter for files matching the expected naming convention
        const uploadedFiles = files.filter((f) => f.match(/^photo-\d+-\d+\.jpg$/));
        // Expect exactly one file to be uploaded
        expect(uploadedFiles.length).toBe(1);
        // Expect the uploaded file's name to match the pattern
        expect(uploadedFiles[0]).toMatch(/^photo-\d+-\d+\.jpg$/);
    }));
    it('should reject non-.jpg uploads with a 500 error', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a fake PNG buffer
        const fakePng = Buffer.from('not a jpeg');
        const res = yield (0, supertest_1.default)(app)
            .post('/upload')
            .attach('image', fakePng, 'image.png');
        // Expect a 500 status code for a rejected upload
        expect(res.status).toBe(500);
        // Expect the response text to contain the specific error message
        expect(res.text).toContain('Only .jpg images are allowed!');
        const files = fs_1.default.readdirSync(uploadDir);
        // Filter for files matching the expected naming convention (should be none from this failed upload)
        const uploadedFiles = files.filter((f) => f.match(/^photo-\d+-\d+\.jpg$/));
        // Expect no files matching the JPG pattern to be saved by this failed upload
        expect(uploadedFiles.length).toBe(0);
    }));
});
