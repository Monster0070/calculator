// İçerik dosyalarının (icerik/*.json) biçimi

export type Hesap = {
  kullaniciAdi: string;
  slogan: string;
  logoMetin: string;
  palet: string;
  sesHizi: number;
  seslendirme: boolean; // false: videoya yapay ses konmaz, süreler yine seslendirmeye göre ayarlanır
  fonMuzigi: boolean;
  kapanisSes: string;
  genelEtiketler: string[];
};

export type ReelsIcerik = {
  id: string;
  sinav: string;
  ders: string;
  konu?: string;
  // ÖSYM'nin sorduğu soru ise kaynağı (girişte "ÖSYM SORDU" damgası çıkar)
  osym?: { yil: number; test: string; soruNo: number };
  kanca?: string;
  kancaSes?: string;
  soru: string;
  soruSes?: string;
  secenekler: string[];
  dogru: string;
  cevapSes: string;
  aciklama?: string;
  aciklamaSes?: string;
  kapanisSes?: string;
  etiketler?: string[];
  aciklamaMetni?: string;
};

export type GonderiIcerik = {
  id: string;
  sinav?: string;
  ders: string;
  ust?: string;
  baslik: string;
  tip: 'formul' | 'tablo' | 'liste';
  basliklar?: [string, string];
  ikonlar?: boolean; // yanlış → doğru tablosu
  stil?: 'karsilastirma'; // iki sütun eşit ağırlıkta
  maddeler: Array<string | string[]>;
  ipucu?: string;
  etiketler?: string[];
  aciklamaMetni?: string;
};

export type AnketIcerik = {
  id: string;
  tip: 'anket' | 'quiz' | 'kaydirici';
  sinav?: string;
  ders?: string;
  ust?: string;
  soru: string;
  secenekler?: string[];
  dogru?: number;
  aciklama?: string;
  not?: string;
};

export type SesKaydi = { dosya: string; sure: number; hash: string };
