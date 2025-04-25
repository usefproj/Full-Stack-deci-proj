"use strict";
// spec/sharp-endpoint-and-function.spec.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const sharp_2 = __importStar(require("../routes/api/sharp"));
describe('Resize API endpoint and resizer()', () => {
    const testImgName = 'jasmine-test';
    // Match your router’s resolution logic via process.cwd()
    const imagesDir = path_1.default.join(process.cwd(), 'images');
    const outputDir = path_1.default.join(process.cwd(), 'output-images');
    const inputFile = path_1.default.join(imagesDir, `${testImgName}.jpg`);
    const outputFile = path_1.default.join(outputDir, `${testImgName}-300x200.jpg`);
    let app;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Ensure source and output directories exist
        if (!fs_1.default.existsSync(imagesDir))
            fs_1.default.mkdirSync(imagesDir, { recursive: true });
        if (!fs_1.default.existsSync(outputDir))
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        // Create a tiny in-memory JPEG for testing
        yield (0, sharp_1.default)({
            create: {
                width: 10,
                height: 10,
                channels: 3,
                background: { r: 150, g: 50, b: 100 },
            },
        })
            .jpeg()
            .toFile(inputFile);
        // Clean up any stale output
        if (fs_1.default.existsSync(outputFile))
            fs_1.default.unlinkSync(outputFile);
        // Mount the router in a fresh Express app
        app = (0, express_1.default)();
        app.use('/resize', sharp_2.default);
    }));
    afterAll(() => {
        // Remove test artifacts
        if (fs_1.default.existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        if (fs_1.default.existsSync(outputFile))
            fs_1.default.unlinkSync(outputFile);
    });
    describe('GET /resize/:file', () => {
        it('responds 200 and streams the resized image', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/resize/${testImgName}`)
                .buffer() // collect the binary response
                .parse((res, callback) => {
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => callback(null, Buffer.concat(chunks)));
            });
            // Should return a JPEG image
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toBe('image/jpeg');
            // The resized file should now exist on disk
            expect(fs_1.default.existsSync(outputFile)).toBeTrue();
            // And the response body should contain image data
            expect(res.body.length).toBeGreaterThan(0);
        }));
        it('responds 500 when the image does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).get('/resize/nonexistent');
            expect(res.status).toBe(500);
            expect(res.text).toContain('Image processing failed');
        }));
    });
    describe('resizer() function', () => {
        it('returns success message and writes file when input exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Ensure clean state
            if (fs_1.default.existsSync(outputFile))
                fs_1.default.unlinkSync(outputFile);
            const msg = yield (0, sharp_2.resizer)(testImgName);
            expect(msg).toContain('✅ Saved resized image');
            expect(fs_1.default.existsSync(outputFile)).toBeTrue();
        }));
        it('throws an error when the input image is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expectAsync((0, sharp_2.resizer)('definitely-not-there')).toBeRejectedWithError('Image processing failed.');
        }));
    });
});
