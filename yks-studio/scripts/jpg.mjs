// Instagram API görselleri yalnızca JPEG kabul ediyor: kapak ve gönderi PNG'lerinin JPEG kopyalarını üretir.
// Kullanım: npm run jpg   (npm run render de sonunda bunu çalıştırır)
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ffmpeg, yol } from './lib/araclar.mjs';

export const jpgleriGuncelle = async () => {
  const kaynaklar = [
    ...(existsSync(yol('cikti', 'reels')) ? readdirSync(yol('cikti', 'reels')).filter((d) => d.endsWith('-kapak.png')).map((d) => yol('cikti', 'reels', d)) : []),
    ...(existsSync(yol('cikti', 'gonderiler')) ? readdirSync(yol('cikti', 'gonderiler')).filter((d) => d.endsWith('.png')).map((d) => yol('cikti', 'gonderiler', d)) : []),
  ];
  let sayi = 0;
  for (const png of kaynaklar) {
    const jpg = png.replace(/\.png$/, '.jpg');
    if (existsSync(jpg) && statSync(jpg).mtimeMs >= statSync(png).mtimeMs) continue;
    await ffmpeg(['-y', '-i', png, '-q:v', '2', jpg]);
    sayi++;
  }
  console.log(`✓ ${sayi} JPEG güncellendi (${kaynaklar.length} görsel)`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await jpgleriGuncelle();
