"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sharpResize_1 = __importDefault(require("./api/sharpResize"));
const imageUp_1 = __importDefault(require("./api/imageUp"));
const imageProv_1 = __importDefault(require("./api/imageProv"));
const routes = express_1.default.Router();
routes.use('/resize', sharpResize_1.default);
routes.use('/images', imageProv_1.default);
routes.use('/upload', imageUp_1.default);
exports.default = routes;
