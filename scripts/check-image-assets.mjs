import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const assets = JSON.parse(await fs.readFile('src/lib/image-assets.json', 'utf8'));
const registry = JSON.parse(await fs.readFile('design/public-photo-licenses.json', 'utf8'));
const originals = new Map(Object.values({...registry.portraits, ...registry.plants}).map(photo => [photo.src, photo]));
let originalBytes = 0, largestBytes = 0;
const seenFiles = new Set();
for (const [original, image] of Object.entries(assets.variants)) {
  originalBytes += (await fs.stat(`public${original}`)).size;
  largestBytes += (await fs.stat(`public${image.variants.at(-1).src}`)).size;
  for (const variant of image.variants) {
    const info = await sharp(`public${variant.src}`).metadata();
    assert.equal(info.format, 'webp'); assert.equal(info.width, variant.width); assert.equal(info.height, variant.height);
    assert(info.width <= image.width, `${variant.src}: upscaled`);
    assert(Math.abs(info.height - info.width * image.height / image.width) <= 1, `${variant.src}: changed aspect ratio`);
    const licence = registry.derivatives[variant.src], source = originals.get(original);
    assert(licence && source && licence.original_src === original, `${variant.src}: missing provenance`);
    for (const key of ['source', 'author', 'license', 'licenseUrl', 'rights_status']) assert.equal(licence[key], source[key]);
    assert(licence.changes); seenFiles.add(variant.src);
  }
}
for (const image of Object.values(assets.social)) {
  const info = await sharp(`public${image.src}`).metadata();
  assert.equal(info.format, 'jpeg'); assert.equal(info.width, 1200); assert.equal(info.height, 630);
  const licence = registry.derivatives[image.src]; assert(licence?.changes && licence.source && licence.author && licence.licenseUrl);
  assert(/^CC (BY|BY-SA)\b/.test(licence.license) || ['CC0', 'Public domain', 'Copyrighted free use'].includes(licence.license), `${image.src}: social use outside adaptation licence`);
  seenFiles.add(image.src);
}
const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
let distinctSocial = new Set(), responsiveImages = 0;
for (const [, canonical] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const html = await fs.readFile(`dist${new URL(canonical).pathname}index.html`, 'utf8');
  const meta = key => html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
  const imagePath = new URL(meta('og:image')).pathname;
  assert.equal(meta('og:image'), meta('twitter:image')); assert.equal(meta('og:image:alt'), meta('twitter:image:alt'));
  assert(meta('og:image:alt')); assert.equal(meta('og:image:width'), '1200'); assert.equal(meta('og:image:height'), '630');
  assert.equal(meta('og:image:type'), imagePath.endsWith('.jpg') ? 'image/jpeg' : 'image/png');
  await fs.access(`public${imagePath}`);
  if (imagePath.startsWith('/images/social/')) {assert(seenFiles.has(imagePath)); distinctSocial.add(imagePath);}
  for (const [, tag] of html.matchAll(/(<img\b[^>]*>)/g)) {
    const src = tag.match(/src="([^"]+)"/)?.[1];
    if (src?.startsWith('/images/optimized/')) {
      assert(seenFiles.has(src), `${canonical}: unlicensed derivative`);
      assert(tag.includes('srcset=') && tag.includes('sizes='), `${canonical}: missing responsive sizes`);
      assert(tag.includes('width=') && tag.includes('height=')); responsiveImages++;
    }
  }
}
const publicCredits = JSON.parse(await fs.readFile('dist/image-credits.json', 'utf8'));
assert.deepEqual(publicCredits.derivatives, registry.derivatives);
console.log(JSON.stringify({photographs: Object.keys(assets.variants).length, original_bytes: originalBytes,
  largest_webp_bytes: largestBytes, reduction_percent: Math.round((1 - largestBytes / originalBytes) * 100),
  generated_social_images: Object.keys(assets.social).length, used_social_images: distinctSocial.size,
  responsive_image_occurrences: responsiveImages}, null, 2));
