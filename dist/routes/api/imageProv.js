"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const provider = express_1.default.Router();
const imagesDir = path_1.default.resolve(__dirname, `../../../images`);
provider.use('/', express_1.default.static(imagesDir));
exports.default = provider;
