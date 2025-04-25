import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const resize = express.Router();

export const resizer = async (
  img: string,
  width: number,
  hieght: number,
): Promise<string> => {
  const parsed = path.parse(img);
  const imgName = parsed.name;
  const outDir = path.resolve(__dirname, '../../../output-images');
  const inputFile = path.resolve(__dirname, `../../../images/${imgName}.jpg`);
  const outputFile = path.join(outDir, `${imgName}-${width}x${hieght}.jpg`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (fs.existsSync(outputFile)) {
    return `♻️ Retrieved from cache: ${outputFile}`;
  }

  try {
    await sharp(inputFile).resize(width, hieght).toFile(outputFile);
    return `✅ Saved resized image to ${outputFile}`;
  } catch (err) {
    console.error(err);
    throw new Error('Image processing failed.');
  }
};

resize.get('/:file', async (req, res) => {
  const fileName: string = req.params.file;
  const { width, height } = req.query;
  try {
    await resizer(fileName, Number(width), Number(height));

    const outputFile = path.resolve(
      __dirname,
      '../../../output-images',
      `${fileName}-${width}x${height}.jpg`,
    );

    res.status(200).sendFile(outputFile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Image processing failed.');
  }
});

export default resize;
