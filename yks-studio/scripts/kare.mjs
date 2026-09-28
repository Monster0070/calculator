// Tek kare kontrolü: bir kompozisyonun istenen karelerini PNG olarak out/kare/ klasörüne alır.
// Kullanım: npm run kare -- reels-mat-uslu-sayilar 90 240 400 [--palet=mor]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { tarayiciBul, yol } from './lib/araclar.mjs';

const argumanlar = process.argv.slice(2);
const palet = argumanlar.find((a) => a.startsWith('--palet='))?.split('=')[1];
const [id, ...kareler] = argumanlar.filter((a) => !a.startsWith('--'));
const inputProps = palet ? { palet } : {};
const browserExecutable = tarayiciBul();
const serveUrl = await bundle({ entryPoint: yol('src', 'index.ts') });
const composition = await selectComposition({ serveUrl, id, browserExecutable, inputProps });
mkdirSync(yol('out', 'kare'), { recursive: true });
for (const kare of kareler.length ? kareler : ['0']) {
  const output = yol('out', 'kare', `${id}${palet ? `-${palet}` : ''}-${kare}.png`);
  await renderStill({
    composition,
    serveUrl,
    output,
    frame: Number(kare),
    inputProps,
    browserExecutable,
    onBrowserLog: (l) => console.log(`[tarayıcı ${l.type}]`, l.text),
  });
  console.log('✓', output);
}
