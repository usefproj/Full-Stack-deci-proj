import express from 'express';
import resize from './api/sharpResize';
import uploader from './api/imageUp';
const routes = express.Router();

routes.use('/img', resize);

routes.use('/upload', uploader);

export default routes;
