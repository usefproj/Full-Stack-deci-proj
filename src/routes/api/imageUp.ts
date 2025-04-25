import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploader = express.Router();
const outDir = path.resolve(__dirname, `../../../images/uploaded-images`);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, outDir);
  },
  filename: function (req, file, callback) {
    const parsed = path.parse(file.originalname);
    const imgName = parsed.name;
    const uniqueSuffix = Date.now() + Math.round(Math.random());
    callback(null, imgName + '-' + uniqueSuffix + '.jpg');
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');

function checkFileType(file: any, cb: any) {
  // Extention Checking
  const isJpg =
    path.extname(file.originalname).toLowerCase() === '.jpg' &&
    file.mimetype === 'image/jpeg';

  if (isJpg) {
    return cb(null, true);
  } else {
    cb('Error: Only .jpg images are allowed!');
  }
}
uploader.post('/', upload, (req, res, next) => {
  res.redirect(301, 'http://example.com');
});

export default uploader;
