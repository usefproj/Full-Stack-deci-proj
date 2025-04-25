// spec/sharp-endpoint-and-function.spec.ts

import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import resizeRouter, { resizer } from '../routes/api/sharp';

describe('Resize API endpoint and resizer()', () => {
  const testImgName = 'jasmine-test';

  // Match your router’s resolution logic via process.cwd()
  const imagesDir = path.join(process.cwd(), 'images');
  const outputDir = path.join(process.cwd(), 'output-images');
  const inputFile = path.join(imagesDir, `${testImgName}.jpg`);
  const outputFile = path.join(outputDir, `${testImgName}-300x200.jpg`);

  let app: express.Application;

  beforeAll(async () => {
    // Ensure source and output directories exist
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Create a tiny in-memory JPEG for testing
    await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 150, g: 50, b: 100 },
      },
    })
      .jpeg()
      .toFile(inputFile);

    // Clean up any stale output
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

    // Mount the router in a fresh Express app
    app = express();
    app.use('/resize', resizeRouter);
  });

  afterAll(() => {
    // Remove test artifacts
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  });

  describe('GET /resize/:file', () => {
    it('responds 200 and streams the resized image', async () => {
      const res = await request(app)
        .get(`/resize/${testImgName}`)
        .buffer() // collect the binary response
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      // Should return a JPEG image
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpeg');

      // The resized file should now exist on disk
      expect(fs.existsSync(outputFile)).toBeTrue();

      // And the response body should contain image data
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('responds 500 when the image does not exist', async () => {
      const res = await request(app).get('/resize/nonexistent');
      expect(res.status).toBe(500);
      expect(res.text).toContain('Image processing failed');
    });
  });

  describe('resizer() function', () => {
    it('returns success message and writes file when input exists', async () => {
      // Ensure clean state
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

      const msg = await resizer(testImgName);
      expect(msg).toContain('✅ Saved resized image');
      expect(fs.existsSync(outputFile)).toBeTrue();
    });

    it('throws an error when the input image is missing', async () => {
      await expectAsync(resizer('definitely-not-there')).toBeRejectedWithError(
        'Image processing failed.',
      );
    });
  });
});
