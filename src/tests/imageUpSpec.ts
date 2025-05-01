import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import uploader from '../routes/api/imageUp';

describe('Image Uploader', () => {
  // Ensure this path is correct and matches the output directory in imageUp.ts
  const uploadDir = path.resolve(__dirname, '../../images');
  let app: express.Application;
  let jpgBuffer: Buffer;

  // Use beforeEach to set up and clean before *each* test
  beforeEach(async () => {
    // Create the upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // *** MODIFIED CLEANUP LOGIC ***
    // Clear only the files uploaded by this test suite based on filename pattern
    fs.readdirSync(uploadDir).forEach((f) => {
      const filePath = path.join(uploadDir, f);
      // Check if the file name matches the expected uploaded file pattern
      if (f.match(/^photo-\d+-\d+\.jpg$/)) {
        try {
          // Use unlinkSync to synchronously remove the file
          fs.unlinkSync(filePath);
        } catch (e) {
          // Ignore errors if the file is already removed or if there are directory issues
          console.error(`Error removing test artifact file ${filePath}: ${e}`); // Log potential issues with cleanup
        }
      }
    });
    // *** END MODIFIED CLEANUP LOGIC ***

    // Create a dummy JPG buffer for testing
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

    // Initialize the express app and mount the router
    app = express();
    app.use('/upload', uploader);
  });

  // Use afterEach to clean up after *each* test
  afterEach(() => {
    // *** MODIFIED CLEANUP LOGIC ***
    // Clean up only the files uploaded by this test suite based on filename pattern
    fs.readdirSync(uploadDir).forEach((f) => {
      const filePath = path.join(uploadDir, f);
      // Check if the file name matches the expected uploaded file pattern
      if (f.match(/^photo-\d+-\d+\.jpg$/)) {
        try {
          // Use unlinkSync to synchronously remove the file
          fs.unlinkSync(filePath);
        } catch (e) {
          // Ignore errors during cleanup
          console.error(`Error removing test artifact file ${filePath}: ${e}`); // Log potential issues with cleanup
        }
      }
    });
    // *** END MODIFIED CLEANUP LOGIC ***
  });

  it('should accept a .jpg upload and save it to disk', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('image', jpgBuffer, 'photo.jpg');

    // Expect a 200 status code for a successful upload
    expect(res.status).toBe(200);

    const files = fs.readdirSync(uploadDir);
    // Filter for files matching the expected naming convention
    const uploadedFiles = files.filter((f) => f.match(/^photo-\d+-\d+\.jpg$/));
    // Expect exactly one file to be uploaded
    expect(uploadedFiles.length).toBe(1);

    // Expect the uploaded file's name to match the pattern
    expect(uploadedFiles[0]).toMatch(/^photo-\d+-\d+\.jpg$/);
  });

  it('should reject non-.jpg uploads with a 500 error', async () => {
    // Create a fake PNG buffer
    const fakePng = Buffer.from('not a jpeg');
    const res = await request(app)
      .post('/upload')
      .attach('image', fakePng, 'image.png');

    // Expect a 500 status code for a rejected upload
    expect(res.status).toBe(500);
    // Expect the response text to contain the specific error message
    expect(res.text).toContain('Only .jpg images are allowed!');
    const files = fs.readdirSync(uploadDir);
    // Filter for files matching the expected naming convention (should be none from this failed upload)
    const uploadedFiles = files.filter((f) => f.match(/^photo-\d+-\d+\.jpg$/));
    // Expect no files matching the JPG pattern to be saved by this failed upload
    expect(uploadedFiles.length).toBe(0);
  });
});
