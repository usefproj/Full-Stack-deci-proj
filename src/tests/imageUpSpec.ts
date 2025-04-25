import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import uploader from '../routes/api/imageUp';

describe('Image Uploader', () => {
  const uploadDir = path.resolve(__dirname, '../../images/uploaded-images');
  let app: express.Application;
  let jpgBuffer: Buffer;

  beforeAll(async () => {
    // Ensure upload dir exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean up any leftovers
    fs.readdirSync(uploadDir).forEach((f) =>
      fs.unlinkSync(path.join(uploadDir, f)),
    );

    // Create a tiny in-memory JPEG
    jpgBuffer = await sharp({
      create: {
        width: 5,
        height: 5,
        channels: 3,
        background: { r: 128, g: 0, b: 128 },
      },
    })
      .jpeg()
      .toBuffer();

    // Mount router
    app = express();
    app.use('/upload', uploader);
  });

  afterAll(() => {
    // Remove test artifacts
    fs.readdirSync(uploadDir).forEach((f) =>
      fs.unlinkSync(path.join(uploadDir, f)),
    );
  });

  it('should accept a .jpg upload and save it to disk', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('image', jpgBuffer, 'photo.jpg');

    expect(res.status).toBe(200);

    const files = fs.readdirSync(uploadDir);
    expect(files.length).toBe(1);

    // Updated regex: one hyphen, then digits, then .jpg
    expect(files[0]).toMatch(/^photo-\d+\.jpg$/); // ← fixed line :contentReference[oaicite:6]{index=6}
  });

  it('should reject non-.jpg uploads with a 500 error', async () => {
    const fakePng = Buffer.from('not a jpeg');
    const res = await request(app)
      .post('/upload')
      .attach('image', fakePng, 'image.png');

    expect(res.status).toBe(500);
    expect(res.text).toContain('Only .jpg images are allowed!'); // from fileFilter :contentReference[oaicite:7]{index=7}

    const files = fs.readdirSync(uploadDir);
    expect(files.length).toBe(1); // still only the one from the first test
  });
});
