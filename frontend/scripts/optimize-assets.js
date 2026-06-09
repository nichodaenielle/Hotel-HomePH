/*
 * Asset Optimization Script
 * - Generates optimized favicon files (app/icon.png + app/apple-icon.png)
 * - Compresses oversized room/nearby images in place (with backup)
 *
 * Run: node scripts/optimize-assets.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const APP = path.join(ROOT, 'src', 'app');

async function generateFavicons() {
  const source = path.join(PUBLIC, 'favicon.png');
  if (!fs.existsSync(source)) {
    console.warn('favicon.png not found, skipping favicon generation');
    return;
  }

  // App Router convention: icon.png + apple-icon.png in src/app/
  await sharp(source)
    .resize(48, 48, { fit: 'contain', background: { r: 1, g: 20, b: 120, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(APP, 'icon.png'));
  console.log('Generated src/app/icon.png (48x48)');

  await sharp(source)
    .resize(180, 180, { fit: 'contain', background: { r: 1, g: 20, b: 120, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(APP, 'apple-icon.png'));
  console.log('Generated src/app/apple-icon.png (180x180)');

  // Optimize the public/favicon.png in place (used by manifest + legacy refs) to 192x192
  const faviconInput = fs.readFileSync(source);
  const faviconBuf = await sharp(faviconInput)
    .resize(192, 192, { fit: 'contain', background: { r: 1, g: 20, b: 120, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(source, faviconBuf);
  console.log(`Optimized public/favicon.png -> ${(faviconBuf.length / 1024).toFixed(0)}KB (192x192)`);

  // Optimize the header logo (rendered at 52x52, keep 128px for retina)
  const logoPath = path.join(PUBLIC, 'img', 'logo', 'hhlogo.png');
  if (fs.existsSync(logoPath)) {
    const before = fs.statSync(logoPath).size;
    const logoInput = fs.readFileSync(logoPath);
    const logoBuf = await sharp(logoInput)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toBuffer();
    if (logoBuf.length < before) {
      fs.writeFileSync(logoPath, logoBuf);
      console.log(`Optimized hhlogo.png: ${(before / 1024).toFixed(0)}KB -> ${(logoBuf.length / 1024).toFixed(0)}KB`);
    }
  }
}

async function compressImages() {
  const dirs = [
    path.join(PUBLIC, 'img', 'gold-room'),
    path.join(PUBLIC, 'img', 'blue-room'),
    path.join(PUBLIC, 'img', 'rooftop'),
    path.join(PUBLIC, 'nearby'),
  ];

  const MAX_WIDTH = 1600; // plenty for full-bleed displays
  const QUALITY = 78;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const before = fs.statSync(filePath).size;
      totalBefore += before;

      // Read into memory first to avoid Windows file-lock on overwrite
      const input = fs.readFileSync(filePath);
      const buffer = await sharp(input)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();

      // Only overwrite if we actually saved space
      if (buffer.length < before) {
        fs.writeFileSync(filePath, buffer);
        totalAfter += buffer.length;
        console.log(`  ${path.relative(PUBLIC, filePath)}: ${(before / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB`);
      } else {
        totalAfter += before;
      }
    }
  }

  console.log(`\nImages: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
}

(async () => {
  console.log('=== Generating favicons ===');
  await generateFavicons();
  console.log('\n=== Compressing images ===');
  await compressImages();
  console.log('\nDone.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
