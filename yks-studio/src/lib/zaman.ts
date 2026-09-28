import { hesap, sesBul } from '../icerik';
import type { ReelsIcerik } from '../tipler';
import { duzMetin } from './metin';

export const FPS = 30;
export const sn = (saniye: number) => Math.round(saniye * FPS);

// Bir seslendirme parçası: başlangıç karesi ve süresi (kare). Ses dosyası yoksa süre tahmin edilir.
export type SesParca = { dosya: string | null; bas: number; sure: number };

const parca = (anahtar: string, metin: string | undefined, bas: number): SesParca | null => {
  const kayit = sesBul(anahtar);
  if (kayit) return { dosya: kayit.dosya, bas, sure: sn(kayit.sure) };
  if (!metin) return null;
  return { dosya: null, bas, sure: sn(duzMetin(metin).length / 14 / (hesap.sesHizi || 1) + 0.3) };
};

export const GERI_SAYIM = 3;

// Soru reels'inin zaman çizelgesi: başlık → kanca/ÖSYM damgası → soru → seçenekler → 3-2-1 → cevap → açıklama → kapanış
export const reelsZamanla = (r: ReelsIcerik) => {
  // Açılış: "TYT Kimya" başlığı, ardından kanca cümlesi ya da ÖSYM damgası
  const baslik = parca(`${r.id}/baslik`, `${r.sinav} ${r.ders}`, sn(0.3))!;
  const baslikSon = Math.max(sn(1.6), baslik.bas + baslik.sure + sn(0.15));
  const kanca = parca(`${r.id}/kanca`, r.kancaSes ?? r.kanca, baslikSon + sn(0.25));
  const girisSon = Math.max(baslikSon + sn(1.5), kanca ? kanca.bas + kanca.sure + sn(0.3) : 0);

  const soruBas = girisSon;
  const soru = parca(`${r.id}/soru`, r.soruSes ?? r.soru, soruBas + sn(0.5))!;

  const secenekBas = soru.bas + soru.sure + sn(0.1);
  const secenekAralik = 5;
  const sayacBas = secenekBas + (r.secenekler.length - 1) * secenekAralik + sn(0.7);
  const sayacSesleri = ['uc', 'iki', 'bir'].map((k, i) => parca(`ortak/${k}`, k, sayacBas + i * FPS + 2));

  const cevapBas = sayacBas + GERI_SAYIM * FPS;
  const cevap = parca(`${r.id}/cevap`, r.cevapSes, cevapBas + sn(0.45))!;

  const aciklamaBas = cevap.bas + cevap.sure + sn(0.15);
  const aciklama = r.aciklama ? parca(`${r.id}/aciklama`, r.aciklamaSes ?? r.aciklama, aciklamaBas + sn(0.5)) : null;

  const kapanisBas = aciklama ? aciklama.bas + aciklama.sure + sn(1.1) : aciklamaBas + sn(1);
  const kapanis = r.kapanisSes
    ? parca(`${r.id}/kapanis`, r.kapanisSes, kapanisBas + sn(0.45))!
    : parca('ortak/kapanis', hesap.kapanisSes, kapanisBas + sn(0.45))!;

  const toplam = Math.max(kapanis.bas + kapanis.sure + sn(0.9), kapanisBas + sn(3.2));
  const konusmalar = [baslik, kanca, soru, cevap, aciklama, kapanis].filter((x): x is SesParca => x !== null);

  return {
    baslik,
    baslikSon,
    kanca,
    girisSon,
    soruBas,
    soru,
    secenekBas,
    secenekAralik,
    sayacBas,
    sayacSesleri,
    cevapBas,
    cevap,
    aciklamaBas,
    aciklama,
    kapanisBas,
    kapanis,
    konusmalar,
    toplam,
  };
};

export type ReelsZaman = ReturnType<typeof reelsZamanla>;
