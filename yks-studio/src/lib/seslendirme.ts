// Kendi sesini eklemek isteyenler için zaman damgalı seslendirme metinleri (npm run metin)
import { hesap, reelsListesi } from '../icerik';
import type { ReelsIcerik } from '../tipler';
import { duzMetin } from './metin';
import { FPS, GERI_SAYIM, reelsZamanla } from './zaman';

const SAYILAR = ['Bir', 'İki', 'Üç', 'Dört', 'Beş'];

const zaman = (kare: number) => {
  const saniye = kare / FPS;
  const dakika = Math.floor(saniye / 60);
  return `${String(dakika).padStart(2, '0')}:${(saniye - dakika * 60).toFixed(1).padStart(4, '0')}`;
};

export const seslendirmeMetni = (r: ReelsIcerik) => {
  const z = reelsZamanla(r);
  const satirlar = [`${r.id}.mp4 | ${r.sinav} ${r.ders}${r.konu ? ` • ${r.konu}` : ''} | ${(z.toplam / FPS).toFixed(1)} sn`, ''];
  const blok = (ad: string, bas: number, enGec: number, metin: string) =>
    satirlar.push(`[${zaman(bas)} → ${zaman(enGec)}]  ${ad}`, metin, '');

  if (z.kanca && r.kanca) blok('KANCA', z.kanca.bas, z.soruBas, r.kancaSes ?? duzMetin(r.kanca));
  blok('SORU', z.soru.bas, z.sayacBas, r.soruSes ?? duzMetin(r.soru));
  const sayac = Array.from({ length: GERI_SAYIM }, (_, i) => `[${zaman(z.sayacBas + i * FPS)}] ${SAYILAR[GERI_SAYIM - i - 1]}!`);
  satirlar.push(`${sayac.join('   ')}   (isteğe bağlı, videoda tik sesi var)`, '');
  blok('CEVAP', z.cevap.bas, z.aciklama?.bas ?? z.kapanisBas, r.cevapSes);
  if (z.aciklama && r.aciklama) blok('ÇÖZÜM', z.aciklama.bas, z.kapanisBas, r.aciklamaSes ?? duzMetin(r.aciklama));
  blok('KAPANIŞ', z.kapanis.bas, z.toplam, r.kapanisSes ?? hesap.kapanisSes);
  return satirlar.join('\n');
};

export const tumSeslendirmeler = () => reelsListesi.map((r) => ({ id: r.id, metin: seslendirmeMetni(r) }));
