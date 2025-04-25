import fs from 'fs';
import mockFs from 'mock-fs';
import * as path from 'path';
import sharp from 'sharp';
import request from 'supertest';
import express from 'express';
import resize, { resizer } from '../routes/api/sharpResize';

describe('Checking the resize endpoint', () => {
  const testImgName = 'fjord'; // an always availble img
  const testImgheight = 300;
  const testImgwidth = 300;
  let app: any;
  beforeAll(() => {
    app = express();
    app.use('/img', resize);
  });

  it('should give a status code of 200 and a valid request body when given a valid image', async () => {
    const response = await request(app)
      .get(`/img/${testImgName}`)
      .query({ width: testImgwidth, height: testImgheight });
    expect(response.status).toBe(200);
  });
});

describe('tests the resizer function', () => {
  beforeAll(() => {
    mockFs({
      images: {
        'sample.jpg': 'dummy-image-bytes',
      },
    });
    spyOn(sharp.prototype, 'resize').and.returnValue(sharp.prototype);
    spyOn(sharp.prototype, 'toFile').and.callFake(async (outPath: string) => {
      // simulate writing the resized file
      fs.writeFileSync(outPath, 'dummy-resized-bytes');
    });
  });

  afterAll(() => mockFs.restore());

  it('saves a new resized image', async () => {
    const msg = await resizer('sample.jpg', 50, 50);
    expect(msg).toMatch(/^✅ Saved resized image to .*sample-50x50\.jpg$/);
    expect(
      fs.existsSync(msg.replace(/^✅ Saved resized image to /, '')),
    ).toBeTrue();
  });

  it('returns cached message on second call', async () => {
    const msg = await resizer('sample.jpg', 50, 50);
    expect(msg).toMatch(/^♻️ Retrieved from cache: .*sample-50x50\.jpg$/);
  });
});
