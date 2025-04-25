"use strict";
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
const fs_1 = __importDefault(require("fs"));
const mock_fs_1 = __importDefault(require("mock-fs"));
const sharp_1 = __importDefault(require("sharp"));
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const sharpResize_1 = __importStar(require("../routes/api/sharpResize"));
describe('Checking the resize endpoint', () => {
    const testImgName = 'fjord'; // an always availble img
    const testImgheight = 300;
    const testImgwidth = 300;
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use('/img', sharpResize_1.default);
    });
    it('should give a status code of 200 and a valid request body when given a valid image', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/img/${testImgName}`)
            .query({ width: testImgwidth, height: testImgheight });
        expect(response.status).toBe(200);
    }));
});
describe('tests the resizer function', () => {
    beforeAll(() => {
        (0, mock_fs_1.default)({
            images: {
                'sample.jpg': 'dummy-image-bytes',
            },
        });
        spyOn(sharp_1.default.prototype, 'resize').and.returnValue(sharp_1.default.prototype);
        spyOn(sharp_1.default.prototype, 'toFile').and.callFake((outPath) => __awaiter(void 0, void 0, void 0, function* () {
            // simulate writing the resized file
            fs_1.default.writeFileSync(outPath, 'dummy-resized-bytes');
        }));
    });
    afterAll(() => mock_fs_1.default.restore());
    it('saves a new resized image', () => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield (0, sharpResize_1.resizer)('sample.jpg', 50, 50);
        expect(msg).toMatch(/^✅ Saved resized image to .*sample-50x50\.jpg$/);
        expect(fs_1.default.existsSync(msg.replace(/^✅ Saved resized image to /, ''))).toBeTrue();
    }));
    it('returns cached message on second call', () => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield (0, sharpResize_1.resizer)('sample.jpg', 50, 50);
        expect(msg).toMatch(/^♻️ Retrieved from cache: .*sample-50x50\.jpg$/);
    }));
});
