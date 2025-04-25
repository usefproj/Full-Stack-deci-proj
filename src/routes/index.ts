import express from 'express';
import resize from './api/sharpResize';
import uploader from './api/imageUp';
import provider from './api/imageProv';

const routes = express.Router();

routes.use('/resize', resize);
routes.use('/images', provider);
routes.use('/upload', uploader);

export default routes;
