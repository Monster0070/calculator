// Reels seslendirmelerini üretir (Google Çeviri'nin Türkçe sesi).
// Kullanım: npm run ses            → sadece değişen/eksik satırlar
//           npm run ses -- --hepsi → hepsini baştan üret
// Çıktı: public/ses/<id>/<satir>.mp3 ve src/generated/ses.json (süreler)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ffmpeg, jsonOku, proxyIleYenidenBaslat, yol } from './lib/araclar.mjs';

await proxyIleYenidenBaslat();

const SR = 24000; // Google TTS çıkış örnekleme hızı
const SURUM = 3; // ses işleme değişirse artır → hepsi yeniden üretilir
const MANIFEST = yol('src', 'generated', 'ses.json');

const hesap = jsonOku('icerik', 'hesap.json');
const reels = jsonOku('icerik', 'reels.json');
const hiz = hesap.sesHizi ?? 1.1;
const hepsi = process.argv.includes('--hepsi');
const eski = existsSync(MANIFEST) && !hepsi ? jsonOku('src', 'generated', 'ses.json') : {};

// İşaretlemeyi (**vurgu**, ==işaret==, ^{üs}) düz metne çevirir
const duzMetin = (s) =>
  s
    .replace(/\*\*|==|~~/g, '')
    .replace(/\^\{([^}]*)\}/g, ' üssü $1')
    .replace(/_\{([^}]*)\}/g, '$1');

const isler = [
  { anahtar: 'ortak/uc', metin: 'Üç.' },
  { anahtar: 'ortak/iki', metin: 'İki.' },
  { anahtar: 'ortak/bir', metin: 'Bir.' },
  { anahtar: 'ortak/kapanis', metin: hesap.kapanisSes },
];
for (const r of reels) {
  const ekle = (satir, metin) => metin && isler.push({ anahtar: `${r.id}/${satir}`, metin });
  ekle('kanca', r.kancaSes ?? (r.kanca && duzMetin(r.kanca)));
  ekle('soru', r.soruSes ?? duzMetin(r.soru));
  ekle('cevap', r.cevapSes);
  ekle('aciklama', r.aciklamaSes ?? (r.aciklama && duzMetin(r.aciklama)));
  ekle('kapanis', r.kapanisSes);
}

// Google TTS istek başına ~200 karakter kabul eder; cümle/virgül/boşluktan böl
const parcala = (metin, sinir = 180) => {
  const parcalar = [];
  let kalan = metin.trim();
  while (kalan.length > sinir) {
    const aday = kalan.slice(0, sinir);
    let kes = Math.max(aday.lastIndexOf('. '), aday.lastIndexOf('! '), aday.lastIndexOf('? '));
    if (kes < sinir * 0.4) kes = Math.max(aday.lastIndexOf(', '), aday.lastIndexOf('; '), aday.lastIndexOf(': '));
    if (kes < sinir * 0.4) kes = aday.lastIndexOf(' ');
    parcalar.push(kalan.slice(0, kes + 1).trim());
    kalan = kalan.slice(kes + 1).trim();
  }
  if (kalan) parcalar.push(kalan);
  return parcalar;
};

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

const googleTts = async (parca, idx, toplam) => {
  const url =
    'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=tr' +
    `&total=${toplam}&idx=${idx}&textlen=${parca.length}&q=${encodeURIComponent(parca)}`;
  for (let deneme = 1; ; deneme++) {
    try {
      const yanit = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' } });
      if (!yanit.ok) throw new Error(`HTTP ${yanit.status}`);
      return Buffer.from(await yanit.arrayBuffer());
    } catch (hata) {
      if (deneme >= 4) throw new Error(`Seslendirme alınamadı ("${parca}"): ${hata.message}`);
      await bekle(1000 * 2 ** deneme);
    }
  }
};

// WAV içinden PCM örneklerini çıkar ("data" bölümünü bul)
const wavPcm = (wav) => {
  let konum = 12;
  while (konum + 8 <= wav.length) {
    const ad = wav.toString('ascii', konum, konum + 4);
    const boyut = wav.readUInt32LE(konum + 4);
    if (ad === 'data') {
      const son = boyut === 0xffffffff || konum + 8 + boyut > wav.length ? wav.length : konum + 8 + boyut;
      const veri = Buffer.from(wav.subarray(konum + 8, son - ((son - konum - 8) % 2)));
      return new Int16Array(veri.buffer, veri.byteOffset, veri.length / 2);
    }
    konum += 8 + boyut + (boyut % 2);
  }
  throw new Error('WAV verisi okunamadı');
};

// Baştaki/sondaki sessizliği kırp (10 ms'lik pencerelerde RMS eşiği)
const sessizlikKirp = (pcm) => {
  const pencere = SR / 100;
  const esik = 0.015;
  const rms = (bas) => {
    let t = 0;
    for (let i = bas; i < Math.min(bas + pencere, pcm.length); i++) t += (pcm[i] / 32768) ** 2;
    return Math.sqrt(t / pencere);
  };
  let bas = 0;
  while (bas < pcm.length && rms(bas) < esik) bas += pencere;
  let son = pcm.length - pencere;
  while (son > bas && rms(son) < esik) son -= pencere;
  return pcm.subarray(Math.max(0, bas - SR * 0.03), Math.min(pcm.length, son + pencere + SR * 0.08));
};

const sentezle = async (metin) => {
  const parcalar = parcala(metin);
  const sesler = [];
  for (let i = 0; i < parcalar.length; i++) {
    const mp3 = await googleTts(parcalar[i], i, parcalar.length);
    const wav = await ffmpeg(['-i', 'pipe:0', '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', '-f', 'wav', 'pipe:1'], mp3);
    sesler.push(sessizlikKirp(wavPcm(wav)));
    await bekle(250);
  }
  const ara = Math.round(SR * 0.16);
  const toplam = sesler.reduce((t, s) => t + s.length, 0) + ara * (sesler.length - 1);
  const birlesik = new Float32Array(toplam);
  let konum = 0;
  for (const s of sesler) {
    for (let i = 0; i < s.length; i++) birlesik[konum + i] = s[i] / 32768;
    konum += s.length + ara;
  }
  // Ses seviyesini eşitle: hedef RMS -16 dBFS, tepe en fazla -1 dBFS
  let kare = 0, tepe = 0;
  for (const v of birlesik) {
    kare += v * v;
    tepe = Math.max(tepe, Math.abs(v));
  }
  const kazanc = Math.min(10 ** (-16 / 20) / Math.sqrt(kare / birlesik.length), 10 ** (-1 / 20) / tepe);
  const pcm = Buffer.alloc(birlesik.length * 2);
  for (let i = 0; i < birlesik.length; i++) {
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, birlesik[i] * kazanc)) * 32767), i * 2);
  }
  return { pcm, sure: birlesik.length / SR / hiz };
};

const manifest = {};
let uretilen = 0;
for (const { anahtar, metin } of isler) {
  const hash = createHash('sha1').update(`${SURUM}|${hiz}|${metin}`).digest('hex').slice(0, 12);
  const dosya = `ses/${anahtar}.mp3`;
  const hedef = yol('public', dosya);
  if (eski[anahtar]?.hash === hash && existsSync(hedef)) {
    manifest[anahtar] = eski[anahtar];
    continue;
  }
  const { pcm, sure } = await sentezle(metin);
  mkdirSync(path.dirname(hedef), { recursive: true });
  await ffmpeg(
    ['-y', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', 'pipe:0', '-af', `atempo=${hiz}`,
      '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', hedef],
    pcm,
  );
  manifest[anahtar] = { dosya, sure: Number(sure.toFixed(3)), hash };
  uretilen++;
  console.log(`✓ ${anahtar.padEnd(34)} ${sure.toFixed(2)} sn  "${metin}"`);
}
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\n${uretilen} yeni seslendirme üretildi, ${isler.length - uretilen} tanesi zaten güncel.`);
