import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploader = express.Router();

const outDir = path.resolve(__dirname, `../../../images`);

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, imgName + '-' + uniqueSuffix + '.jpg');
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');

function checkFileType(file: any, cb: multer.FileFilterCallback) {
  const filetypes = /jpeg|jpg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only .jpg images are allowed!'));
  }
}

uploader.post('/', (req, res) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).send(`Multer uploading error: ${err.message}`);
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).send(err.message || 'File upload error');
    }

    console.log('File uploaded successfully:', req.file);

    res.status(200).json({
      message: 'File uploaded successfully',
      filename: req.file?.filename,
      path: req.file?.path,
    });
  });
});

export default uploader;
