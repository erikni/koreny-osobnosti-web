import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';

const manifestPath = 'design/public-photo-licenses.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
await fs.mkdir('public/images/optimized', {recursive: true});
await fs.mkdir('public/images/social', {recursive: true});
const variants = {}, social = {}, derivatives = {};
let originalBytes = 0, largestVariantBytes = 0;
for (const [collection, photos] of Object.entries({portraits: manifest.portraits, plants: manifest.plants})) {
  for (const [id, photo] of Object.entries(photos)) {
    if (photo.rights_status !== 'licensed') continue;
    const source = await fs.readFile(`public${photo.src}`);
    const hash = crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
    const metadata = await sharp(source).metadata();
    const rotated = [5, 6, 7, 8].includes(metadata.orientation);
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
    const sizes = [...new Set([400, 800, 1400].filter(n => n < width).concat(Math.min(width, 1400)))];
    const outputs = [];
    for (const size of sizes) {
      const src = `/images/optimized/${collection}-${id}-${hash}-${size}.webp`;
      const info = await sharp(source).rotate().resize({width: size, withoutEnlargement: true})
        .webp({quality: 82, effort: 4}).toFile(`public${src}`);
      outputs.push({src, width: info.width, height: info.height, bytes: info.size});
      derivatives[src] = {...photo, src, original_src: photo.src,
        changes: 'EXIF orientation normalized; proportionally resized without cropping; encoded as WebP. Original file retained.'};
    }
    variants[photo.src] = {width, height, variants: outputs};
    originalBytes += source.length;
    largestVariantBytes += outputs.at(-1).bytes;
    // Social derivatives require a licence explicitly allowing adaptation.
    // Individual permissions and gallery terms keep their original scope.
    if (/^CC (BY|BY-SA)\b/.test(photo.license) || ['CC0', 'Public domain', 'Copyrighted free use'].includes(photo.license)) {
      const src = `/images/social/${collection}-${id}-${hash}.jpg`;
      await sharp(source).rotate().resize(1200, 630, {fit: 'contain', background: '#fbf8ef'})
        .jpeg({quality: 86, mozjpeg: true}).toFile(`public${src}`);
      social[`${collection}/${id}`] = {src, width: 1200, height: 630, type: 'image/jpeg', photo_src: photo.src};
      derivatives[src] = {...photo, src, original_src: photo.src,
        changes: 'EXIF orientation normalized; whole photograph proportionally resized without cropping and placed on a cream 1200 × 630 canvas; JPEG encoding. Original licence retained.'};
    }
  }
}
manifest.derivatives = derivatives;
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile('src/lib/image-assets.json', JSON.stringify({variants, social}, null, 2) + '\n');
// Keep the existing authoritative photo definitions byte-for-byte in sync.
await fs.writeFile('src/lib/photos.ts', 'export const publicPhotos = ' + JSON.stringify(manifest.portraits, null, 2) + ';\nexport const plantPhotos = ' + JSON.stringify(manifest.plants, null, 2) + ';\n');
console.log(JSON.stringify({photographs: Object.keys(variants).length, social_images: Object.keys(social).length,
  original_bytes: originalBytes, largest_webp_bytes: largestVariantBytes,
  reduction_percent: Math.round((1 - largestVariantBytes / originalBytes) * 100)}, null, 2));
