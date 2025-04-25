import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const resize = express.Router();

export const resizer = async (img: string): Promise<string> => {
  const parsed = path.parse(img);
  const imgName = parsed.name;
  const outDir = path.resolve(__dirname, '../../../output-images');
  const inputFile = path.resolve(__dirname, `../../../images/${imgName}.jpg`);
  const outputFile = path.join(outDir, `${imgName}-300x200.jpg`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (fs.existsSync(outputFile)) {
    return `♻️ Retrieved from cache: ${outputFile}`;
  }

  try {
    await sharp(inputFile).resize(300, 200).toFile(outputFile);
    return `✅ Saved resized image to ${outputFile}`;
  } catch (err) {
    console.error(err);
    throw new Error('Image processing failed.');
  }
};

resize.get('/:file', async (req, res) => {
  try {
    await resizer(req.params.file);

    const outputFile = path.resolve(
      __dirname,
      '../../../output-images',
      `${req.params.file}-300x200.jpg`,
    );

    // NO return here — we’re just sending the file
    res.sendFile(outputFile);
  } catch (err) {
    console.error(err);
    // NO return here, either
    res.status(500).send('Image processing failed.');
  }
});

export default resize;
