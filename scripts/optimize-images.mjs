/*
 * One-off image conversion for the public site.
 *
 * The landing page was shipping 11.7 MB of images -- a 4032x2268 hero photo, a
 * 4096x3072 PNG portrait, and several PNGs stored at many times the size they
 * are ever displayed at. Each target width below is the element's real layout
 * width at the 1180px container, doubled for 2x screens; there is no point
 * shipping more pixels than that.
 *
 * sharp is deliberately NOT a dependency of this project -- it pulls platform
 * native binaries that nobody needs for a normal build. Install it only when
 * re-running this:
 *
 *   npm install --no-save sharp
 *   node scripts/optimize-images.mjs
 */
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const IMAGES = 'src/assets/images';
const HOME_IMAGES = 'src/pages/home/images';

// [source path relative to the repo, target width, what decides that width]
const TARGETS = [
  [`${IMAGES}/landing_page_image.jpg`, 2000, 'hero, full-bleed behind an overlay'],
  [`${IMAGES}/landing_page_image_2.png`, 1000, 'about portrait, ~490px column'],
  [`${IMAGES}/dryness.png`, 800, 'parameter card, ~369px'],
  [`${IMAGES}/ncg.png`, 800, 'parameter card, ~369px'],
  [`${IMAGES}/tds.png`, 800, 'parameter card, ~369px'],
  [`${IMAGES}/sampelncg.png`, 1000, 'sampling row, ~470px'],
  [`${IMAGES}/DrynessFraction.jpg`, 1000, 'sampling row, ~470px'],
  [`${IMAGES}/SC4500.png`, 1000, 'sampling row, ~470px'],
  [`${IMAGES}/PLTPKMJ.jpg`, 1100, 'how-it-works figure, ~530px'],
  [`${IMAGES}/Indonesiaku.png`, 1200, 'map, ~600px'],
  [`${IMAGES}/logo-unpad1.png`, 300, 'logo, never drawn above 96px'],
  [`${IMAGES}/LOGOPertamina.png`, 300, 'partner logo, never drawn above 96px'],
  [`${IMAGES}/LOGOPGE.png`, 300, 'partner logo, never drawn above 96px'],
  [`${IMAGES}/LOGOHach.png`, 300, 'partner logo, never drawn above 96px'],
  [`${IMAGES}/LOGOHW.png`, 300, 'partner logo, never drawn above 96px'],
  [`${HOME_IMAGES}/ulubelu.jpg`, 1200, 'site card, ~574px']
  // kamojang.webp is left alone: it is already a 1200px webp, and re-encoding
  // a lossy format into itself costs quality for no size saving.
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

let before = 0;
let after = 0;

for (const [file, width, reason] of TARGETS) {
  const source = path.resolve(file);
  const output = path.join(path.dirname(source), `${path.parse(source).name}.webp`);

  const input = await readFile(source);
  const meta = await sharp(input).metadata();

  const data = await sharp(input)
    // `withoutEnlargement` so a source already smaller than the target is
    // re-encoded rather than upscaled.
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: meta.hasAlpha ? 90 : 80, alphaQuality: 100, effort: 6 })
    .toBuffer();

  await writeFile(output, data);

  const originalSize = (await stat(source)).size;
  before += originalSize;
  after += data.length;

  const resized = meta.width > width ? `${meta.width}→${width}px` : `${meta.width}px`;
  const name = path.basename(file);
  console.log(`${name.padEnd(26)} ${kb(originalSize).padStart(8)} → ${kb(data.length).padStart(7)}   ${resized.padEnd(13)} ${reason}`);
}

console.log(`\ntotal ${kb(before)} → ${kb(after)}  (${(100 - (after / before) * 100).toFixed(0)}% smaller)`);
