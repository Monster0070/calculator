// Tüm içerikleri (veya seçtiklerini) render eder ve Instagram açıklamalarını yazar.
// Kullanım:
//   npm run render                       → hepsi (reels, kapaklar, gönderiler, anketler, marka)
//   npm run render -- reels gonderiler   → gruplar: reels | gonderiler | anketler | marka | onizleme
//   npm run render -- reels-mat-uslu-sayilar   → tek bir kompozisyon (kimliğiyle)
//   npm run render -- onizleme --palet=mor     → farklı bir paletle dene (çıktı out/ klasörüne)
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia, renderStill } from '@remotion/renderer';
import { mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { jsonOku, tarayiciBul, yol } from './lib/araclar.mjs';

const argumanlar = process.argv.slice(2);
const bayraklar = Object.fromEntries(
  argumanlar.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.slice(2).split('=');
    return [k, v ?? true];
  }),
);
const hedefler = argumanlar.filter((a) => !a.startsWith('--'));

const GRUPLAR = {
  reels: ['reels-', 'kapak-'],
  gonderiler: ['gonderi-'],
  anketler: ['anket-'],
  marka: ['profil-', 'onecikan-', 'palet-'],
  onizleme: ['onizleme-'],
};
// Bu önekler tek kare (PNG) olarak alınır; diğerleri video
const TEK_KARE = ['kapak-', 'gonderi-', 'anket-', 'profil-', 'onecikan-', 'palet-', 'onizleme-'];
const VARSAYILAN = [...GRUPLAR.reels, ...GRUPLAR.gonderiler, ...GRUPLAR.anketler, ...GRUPLAR.marka];

const secildiMi = (id) => {
  if (hedefler.length === 0 || hedefler.includes('hepsi')) return VARSAYILAN.some((on) => id.startsWith(on));
  return hedefler.some((h) => (GRUPLAR[h] ? GRUPLAR[h].some((on) => id.startsWith(on)) : id === h));
};

const hesap = jsonOku('icerik', 'hesap.json');
const reels = jsonOku('icerik', 'reels.json');
const gonderiler = jsonOku('icerik', 'gonderiler.json');
const anketler = jsonOku('icerik', 'anketler.json');

// --- Instagram açıklamaları ---------------------------------------------------------------
const UST = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻', m: 'ᵐ', n: 'ⁿ' };
const ALT = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
const duz = (s = '') =>
  s
    .replace(/\*\*|==|~~/g, '')
    .replace(/\^\{([^}]*)\}/g, (_, x) => [...x].map((c) => UST[c] ?? c).join(''))
    .replace(/_\{([^}]*)\}/g, (_, x) => [...x].map((c) => ALT[c] ?? c).join(''));
const etiketler = (liste = []) => [...hesap.genelEtiketler, ...liste].slice(0, 5).join(' ');
const takip = `🔔 Her gün yeni içerik için takip et: @${hesap.kullaniciAdi}`;

const aciklamaYaz = (id) => {
  const [tur, ...kalan] = id.split('-');
  const icerikId = kalan.join('-').replace(/-cevap$/, '');
  if (tur === 'reels') {
    const r = reels.find((x) => x.id === icerikId);
    if (r.aciklamaMetni) return r.aciklamaMetni;
    return [
      `${duz(r.kanca ?? r.konu)} 🤔`,
      '',
      `${r.sinav} ${r.ders}${r.konu ? ` • ${r.konu}` : ''}`,
      `❓ ${duz(r.soru)}`,
      '',
      '⏱️ 3 saniyen var! Cevabını yorumlara yaz 👇',
      '📌 Kaydet, sınavdan önce tekrar çöz.',
      takip,
      '',
      etiketler(r.etiketler),
    ].join('\n');
  }
  if (tur === 'gonderi') {
    const g = gonderiler.find((x) => x.id === icerikId);
    if (g.aciklamaMetni) return g.aciklamaMetni;
    return [
      `${duz(g.baslik)} 📚`,
      '',
      `${g.sinav ?? ''} ${g.ders} • ${g.ust ?? 'Kısa not'}`.trim(),
      '📌 Kaydet, tekrar ederken işine yarayacak!',
      '💬 Eklemek istediğin bir bilgi var mı? Yorumlara yaz.',
      takip,
      '',
      etiketler(g.etiketler),
    ].join('\n');
  }
  if (tur === 'anket') {
    const a = anketler.find((x) => x.id === icerikId);
    const cikartma = { anket: 'Anket', quiz: 'Test (quiz)', kaydirici: 'Emoji kaydırıcı' }[a.tip];
    const satirlar = [
      'HİKÂYE PAYLAŞIM NOTU',
      `1) ${a.id}.png görselini hikâyene ekle.`,
      `2) Çıkartmalar → "${cikartma}" çıkartmasını seç.`,
      `3) Çıkartma sorusu: ${duz(a.soru)}`,
    ];
    if (a.secenekler) satirlar.push(`4) Seçenekler: ${a.secenekler.map(duz).join(' / ')}`);
    if (a.tip === 'kaydirici') satirlar.push('4) Kaydırıcı emojisi: 📚 ya da 🔥');
    satirlar.push('5) Çıkartmayı okun gösterdiği boş alana yerleştir.');
    if (a.tip === 'quiz') {
      satirlar.push(`6) Doğru cevabı işaretle: ${duz(a.secenekler[a.dogru])}`);
      satirlar.push(`7) Ertesi gün ${a.id}-cevap.png görselini paylaş.`);
    }
    return satirlar.join('\n');
  }
  return null;
};

// --- Çıktı yolları ----------------------------------------------------------------------------
const deneme = Boolean(bayraklar.palet);
const kokKlasor = (id) => (deneme || id.startsWith('onizleme-') ? yol('out', bayraklar.palet ?? 'onizleme') : yol('cikti'));
const ciktiYolu = (id) => {
  const [tur, ...kalan] = id.split('-');
  const ad = kalan.join('-');
  const kok = kokKlasor(id);
  switch (tur) {
    case 'reels':
      return path.join(kok, 'reels', `${ad}.mp4`);
    case 'kapak':
      return path.join(kok, 'reels', `${ad}-kapak.png`);
    case 'gonderi':
      return path.join(kok, 'gonderiler', `${ad}.png`);
    case 'anket':
      return path.join(kok, 'anketler', `${ad}.png`);
    case 'onizleme':
      return path.join(kok, `${ad}.png`);
    default:
      return path.join(kok, 'marka', `${id}.png`);
  }
};

// --- Render -----------------------------------------------------------------------------------
const browserExecutable = tarayiciBul();
const inputProps = bayraklar.palet ? { palet: bayraklar.palet } : {};

console.log('📦 Proje paketleniyor...');
const serveUrl = await bundle({ entryPoint: yol('src', 'index.ts') });
const hepsi = await getCompositions(serveUrl, { browserExecutable, inputProps });
const secilenler = hepsi.filter((k) => secildiMi(k.id));
if (secilenler.length === 0) {
  console.log('Seçilen kimlikle eşleşen kompozisyon yok. Mevcut olanlar:\n' + hepsi.map((k) => `  ${k.id}`).join('\n'));
  process.exit(1);
}

for (const [i, komp] of secilenler.entries()) {
  const cikti = ciktiYolu(komp.id);
  mkdirSync(path.dirname(cikti), { recursive: true });
  const etiket = `[${i + 1}/${secilenler.length}] ${komp.id}`;
  const baslangic = Date.now();
  if (!TEK_KARE.some((on) => komp.id.startsWith(on))) {
    let son = -1;
    await renderMedia({
      composition: komp,
      serveUrl,
      codec: 'h264',
      outputLocation: cikti,
      inputProps,
      browserExecutable,
      crf: 18,
      audioBitrate: '192k',
      jpegQuality: 92,
      concurrency: os.cpus().length,
      onProgress: ({ progress }) => {
        const yuzde = Math.floor(progress * 10) * 10;
        if (yuzde !== son) {
          son = yuzde;
          process.stdout.write(`\r🎬 ${etiket} %${yuzde}   `);
        }
      },
    });
    process.stdout.write('\n');
  } else {
    await renderStill({ composition: komp, serveUrl, output: cikti, inputProps, browserExecutable, imageFormat: 'png' });
  }
  const metin = !deneme && !komp.id.startsWith('kapak-') && aciklamaYaz(komp.id);
  if (metin && !komp.id.endsWith('-cevap')) writeFileSync(cikti.replace(/\.(mp4|png)$/, '.txt'), `${metin}\n`);
  console.log(`✓ ${etiket} → ${path.relative(yol(), cikti)} (${((Date.now() - baslangic) / 1000).toFixed(1)} sn)`);
}

if (!deneme && secilenler.some((k) => k.id.startsWith('reels-'))) await import('./metin.mjs');
