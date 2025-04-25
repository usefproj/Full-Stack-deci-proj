import express from 'express';
import path from 'path';
import fs from 'fs';

const provider = express.Router();
const imagesDir = path.resolve(__dirname, `../../../images`);

const getImageFilesRecursively = (dir: string, fileList: string[] = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getImageFilesRecursively(filePath, fileList);
    } else {
      if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
        const relativePath = path.relative(imagesDir, filePath);
        fileList.push(relativePath);
      }
    }
  });

  return fileList;
};

provider.get('/list', (req, res) => {
  try {
    const imageFiles = getImageFilesRecursively(imagesDir);
    res.json(imageFiles);
  } catch (err) {
    res.status(500).json({ error: 'Unable to list images' });
  }
});

provider.use('/', express.static(imagesDir));

export default provider;
