// Ses efektlerini ve fon müziğini sıfırdan sentezler (telif derdi yok).
// Kullanım: npm run sfx  → public/sfx/*.wav
import { mkdirSync, writeFileSync } from 'node:fs';
import { yol } from './lib/araclar.mjs';

const SR = 44100;
const TAU = Math.PI * 2;

// Her çalıştırmada aynı sesi üretmek için tohumlu gürültü
let tohum = 20240601;
const gurultu = () => {
  tohum = (Math.imul(tohum, 1664525) + 1013904223) >>> 0;
  return (tohum / 4294967296) * 2 - 1;
};

const bos = (saniye) => new Float32Array(Math.ceil(saniye * SR));

const normalize = (buf, tepe) => {
  let m = 0;
  for (const v of buf) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < buf.length; i++) buf[i] *= tepe / m;
  return buf;
};

const wavYaz = (ad, buf) => {
  const veri = Buffer.alloc(44 + buf.length * 2);
  veri.write('RIFF', 0);
  veri.writeUInt32LE(36 + buf.length * 2, 4);
  veri.write('WAVE', 8);
  veri.write('fmt ', 12);
  veri.writeUInt32LE(16, 16);
  veri.writeUInt16LE(1, 20); // PCM
  veri.writeUInt16LE(1, 22); // mono
  veri.writeUInt32LE(SR, 24);
  veri.writeUInt32LE(SR * 2, 28);
  veri.writeUInt16LE(2, 32);
  veri.writeUInt16LE(16, 34);
  veri.write('data', 36);
  veri.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-1, Math.min(1, buf[i]));
    veri.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(yol('public', 'sfx', `${ad}.wav`), veri);
  console.log(`✓ sfx/${ad}.wav  (${(buf.length / SR).toFixed(2)} sn)`);
};

// Tahta blok "tik" sesi — geri sayımın her saniyesi
const tik = () => {
  const b = bos(0.12);
  let faz = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = 1150 * (1 + 0.18 * Math.exp(-t / 0.004));
    faz += (TAU * f) / SR;
    const govde = Math.exp(-t / 0.02) * (Math.sin(faz) + 0.3 * Math.sin(faz * 2.63));
    const vurus = Math.exp(-t / 0.002) * gurultu() * 0.6;
    b[i] = govde + vurus;
  }
  return normalize(b, 0.85);
};

// Yumuşak "pop" — seçenekler belirirken
const pop = () => {
  const b = bos(0.14);
  let faz = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = 360 + 640 * (1 - Math.exp(-t / 0.02));
    faz += (TAU * f) / SR;
    b[i] = Math.sin(faz) * Math.min(1, t / 0.003) * Math.exp(-t / 0.035);
  }
  return normalize(b, 0.75);
};

// Rezonanslı bant geçiren filtreden geçmiş gürültü — geçiş "vuuş" sesi
const whoosh = () => {
  const sure = 0.6;
  const b = bos(sure);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, govde = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / sure;
    const f0 = 300 * Math.pow(11, Math.sin(Math.PI * Math.min(1, u * 1.1)) ** 1.5);
    const w0 = (TAU * f0) / SR;
    const alfa = Math.sin(w0) / (2 * 1.1);
    const a0 = 1 + alfa;
    const x = gurultu();
    const y = (alfa * x - alfa * x2 + 2 * Math.cos(w0) * y1 - (1 - alfa) * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    govde += (x - govde) * 0.03;
    const zarf = u < 0.4 ? (u / 0.4) ** 2 : Math.exp(-(u - 0.4) / 0.18);
    b[i] = zarf * (y + 0.6 * govde);
  }
  return normalize(b, 0.8);
};

// Doğru cevap zili — Do-Mi-Sol-Do arpeji
const ding = () => {
  const b = bos(1.9);
  const notalar = [
    [1046.5, 0],
    [1318.5, 0.075],
    [1568.0, 0.15],
    [2093.0, 0.225],
  ];
  for (const [f, bas] of notalar) {
    const b0 = Math.floor(bas * SR);
    for (let i = b0; i < b.length; i++) {
      const t = (i - b0) / SR;
      const atak = Math.min(1, t / 0.002);
      b[i] +=
        0.5 *
        atak *
        (Math.exp(-t / 0.55) * Math.sin(TAU * f * t) +
          0.25 * Math.exp(-t / 0.18) * Math.sin(TAU * f * 2.01 * t) +
          0.08 * Math.exp(-t / 0.08) * Math.sin(TAU * f * 3.2 * t));
    }
  }
  return normalize(b, 0.8);
};

// Geri sayım boyunca yükselen gerilim sesi (3 sn)
const gerilim = () => {
  const sure = 3;
  const b = bos(sure + 0.05);
  let faz1 = 0, faz2 = 0, lp = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = Math.min(1, t / sure);
    const f = 110 * Math.pow(4, u);
    faz1 += (TAU * f) / SR;
    faz2 += (TAU * f * 1.5) / SR;
    lp += (gurultu() - lp) * (0.02 + 0.25 * u);
    const kapanis = t < sure ? 1 : Math.max(0, 1 - (t - sure) / 0.05);
    b[i] = Math.pow(u, 1.6) * kapanis * (0.5 * Math.sin(faz1) + 0.25 * Math.sin(faz2) + 0.35 * lp);
  }
  return normalize(b, 0.7);
};

// Sakin, döngüye uygun fon müziği: Fmaj7 – Em7 – Dm7 – Cmaj7, 84 BPM
const fon = () => {
  const bpm = 84;
  const vurus = 60 / bpm;
  const olcu = vurus * 4;
  const uzunluk = Math.round(olcu * 4 * SR);
  const b = new Float32Array(uzunluk);
  // Döngü sonunu taşan kuyruklar başa sarılır → dikişsiz döngü
  const ekle = (i, v) => {
    b[((i % uzunluk) + uzunluk) % uzunluk] += v;
  };
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const akorlar = [
    { bas: 41, notalar: [57, 60, 64, 67] },
    { bas: 40, notalar: [55, 59, 62, 67] },
    { bas: 38, notalar: [57, 60, 62, 65] },
    { bas: 36, notalar: [55, 59, 60, 64] },
  ];
  const piyano = (f, bas, sure, hiz) => {
    const b0 = Math.round(bas * SR);
    const n = Math.round((sure + 1.2) * SR);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const birak = t > sure ? Math.exp(-(t - sure) / 0.25) : 1;
      const zarf = Math.min(1, t / 0.01) * Math.exp(-t / 1.8) * birak;
      const fm = 0.9 * Math.exp(-t / 0.25) * Math.sin(TAU * f * t);
      const ton = Math.sin(TAU * f * t + fm) + 0.12 * Math.exp(-t / 0.4) * Math.sin(TAU * 2 * f * t);
      const tremolo = 1 + 0.1 * Math.sin(TAU * 4.2 * t);
      ekle(b0 + i, 0.11 * hiz * zarf * ton * tremolo);
    }
  };
  const basNota = (f, bas) => {
    const b0 = Math.round(bas * SR);
    const n = Math.round(1.4 * SR);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ekle(b0 + i, 0.28 * Math.min(1, t / 0.012) * Math.exp(-t / 0.5) * Math.sin(TAU * f * t));
    }
  };
  const davul = (bas) => {
    const b0 = Math.round(bas * SR);
    let faz = 0;
    for (let i = 0; i < 0.35 * SR; i++) {
      const t = i / SR;
      const f = 48 + 72 * Math.exp(-t / 0.03);
      faz += (TAU * f) / SR;
      ekle(b0 + i, 0.32 * Math.exp(-t / 0.13) * Math.sin(faz));
    }
  };
  const zil = (bas, siddet) => {
    const b0 = Math.round(bas * SR);
    let onceki = 0;
    for (let i = 0; i < 0.08 * SR; i++) {
      const t = i / SR;
      const n = gurultu();
      ekle(b0 + i, siddet * Math.exp(-t / 0.016) * (n - onceki));
      onceki = n;
    }
  };
  akorlar.forEach((akor, k) => {
    const bas = k * olcu;
    for (const nota of akor.notalar) {
      piyano(hz(nota), bas, vurus * 1.5, 1);
      piyano(hz(nota), bas + vurus * 1.5, vurus * 2.5, 0.55);
    }
    basNota(hz(akor.bas), bas);
    basNota(hz(akor.bas), bas + vurus * 2);
    davul(bas);
    davul(bas + vurus * 2);
    for (let v = 0; v < 4; v++) zil(bas + vurus * v + vurus * 0.56, v % 2 ? 0.05 : 0.035);
  });
  // Plak cızırtısı ve yumuşatma
  for (let i = 0; i < uzunluk; i++) {
    if (gurultu() > 0.9992) b[i] += 0.05 * gurultu();
    b[i] += 0.004 * gurultu();
  }
  let lp = 0;
  for (let k = 0; k < 2; k++) {
    for (let i = 0; i < uzunluk; i++) {
      lp += (b[i] - lp) * 0.35;
      b[i] = lp;
    }
  }
  return normalize(b, 0.8);
};

mkdirSync(yol('public', 'sfx'), { recursive: true });
wavYaz('tik', tik());
wavYaz('pop', pop());
wavYaz('whoosh', whoosh());
wavYaz('ding', ding());
wavYaz('gerilim', gerilim());
wavYaz('fon', fon());
