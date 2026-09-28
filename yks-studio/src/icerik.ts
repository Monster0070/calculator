import anketlerJson from '../icerik/anketler.json';
import gonderilerJson from '../icerik/gonderiler.json';
import hesapJson from '../icerik/hesap.json';
import reelsJson from '../icerik/reels.json';
import sesJson from './generated/ses.json';
import type { AnketIcerik, GonderiIcerik, Hesap, ReelsIcerik, SesKaydi } from './tipler';

export const hesap = hesapJson as Hesap;
export const reelsListesi = reelsJson as ReelsIcerik[];
export const gonderiListesi = gonderilerJson as GonderiIcerik[];
export const anketListesi = anketlerJson as AnketIcerik[];

const sesler = sesJson as Record<string, SesKaydi>;
export const sesBul = (anahtar: string): SesKaydi | null => sesler[anahtar] ?? null;

const bul = <T extends { id: string }>(liste: T[], id: string, tur: string): T => {
  const kayit = liste.find((x) => x.id === id);
  if (!kayit) throw new Error(`${tur} bulunamadı: "${id}"`);
  return kayit;
};

export const reelsBul = (id: string) => bul(reelsListesi, id, 'Reels');
export const gonderiBul = (id: string) => bul(gonderiListesi, id, 'Gönderi');
export const anketBul = (id: string) => bul(anketListesi, id, 'Anket');

export const HARFLER = ['A', 'B', 'C', 'D', 'E'];
export const trBuyuk = (s: string) => s.toLocaleUpperCase('tr-TR');
