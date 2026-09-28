import React, { createContext, useContext } from 'react';
import { hesap } from './icerik';

// Renk paletleri. Hesabın paleti icerik/hesap.json → "palet" alanından seçilir.
export type Palet = {
  id: string;
  ad: string;
  aciklama: string;
  koyu: boolean;
  arkaplan: string;
  arkaplan2: string;
  yuzey: string;
  yuzeyKenar: string;
  metin: string;
  metinSoluk: string;
  vurgu: string; // marka rengi: işaretleme, kapanış ekranı
  vurguMetin: string; // vurgu zemin üstündeki yazı
  vurguYazi: string; // **kalın** vurgular, geri sayım halkası
  ikincil: string; // ders rozeti
  ikincilMetin: string;
  dogru: string;
  dogruMetin: string;
  yanlis: string;
  desen: 'izgara' | 'nokta' | 'defter';
  desenRenk: string;
  isaret: 'blok' | 'fosforlu'; // ==işaret== görünümü
};

export const paletler: Record<string, Palet> = {
  gece: {
    id: 'gece',
    ad: 'Gece Mesaisi',
    aciklama: 'Lacivert + fosforlu sarı',
    koyu: true,
    arkaplan: '#0A0F2C',
    arkaplan2: '#1B2466',
    yuzey: '#141B47',
    yuzeyKenar: 'rgba(255,255,255,0.10)',
    metin: '#F5F7FF',
    metinSoluk: '#A8B0D9',
    vurgu: '#FFD23F',
    vurguMetin: '#0A0F2C',
    vurguYazi: '#FFD23F',
    ikincil: '#7C9CFF',
    ikincilMetin: '#0A0F2C',
    dogru: '#2EE59D',
    dogruMetin: '#04261A',
    yanlis: '#FF5C7A',
    desen: 'izgara',
    desenRenk: 'rgba(255,255,255,0.045)',
    isaret: 'blok',
  },
  defter: {
    id: 'defter',
    ad: 'Defter',
    aciklama: 'Krem kâğıt + mürekkep mavisi + fosforlu kalem',
    koyu: false,
    arkaplan: '#FFF8EB',
    arkaplan2: '#FFFDF8',
    yuzey: '#FFFFFF',
    yuzeyKenar: 'rgba(29,42,91,0.14)',
    metin: '#1D2A5B',
    metinSoluk: '#5F6B8F',
    vurgu: '#FFE14D',
    vurguMetin: '#1D2A5B',
    vurguYazi: '#D62839',
    ikincil: '#1D2A5B',
    ikincilMetin: '#FFF8EB',
    dogru: '#15A36F',
    dogruMetin: '#FFFFFF',
    yanlis: '#D62839',
    desen: 'defter',
    desenRenk: 'rgba(66,120,204,0.18)',
    isaret: 'fosforlu',
  },
  mor: {
    id: 'mor',
    ad: 'Elektrik Moru',
    aciklama: 'Mor + mercan + camgöbeği',
    koyu: true,
    arkaplan: '#13072E',
    arkaplan2: '#3A0CA3',
    yuzey: '#221052',
    yuzeyKenar: 'rgba(255,255,255,0.14)',
    metin: '#FFFFFF',
    metinSoluk: '#C9B8F2',
    vurgu: '#FF7A45',
    vurguMetin: '#1B0633',
    vurguYazi: '#FF9A6C',
    ikincil: '#4CC9F0',
    ikincilMetin: '#0B1633',
    dogru: '#44F0A0',
    dogruMetin: '#06281A',
    yanlis: '#FF4D8D',
    desen: 'nokta',
    desenRenk: 'rgba(255,255,255,0.08)',
    isaret: 'blok',
  },
  nane: {
    id: 'nane',
    ad: 'Nane & Grafit',
    aciklama: 'Grafit + nane yeşili + mercan',
    koyu: true,
    arkaplan: '#0E1316',
    arkaplan2: '#1C2A2E',
    yuzey: '#172024',
    yuzeyKenar: 'rgba(255,255,255,0.09)',
    metin: '#EEF4F3',
    metinSoluk: '#94A6A6',
    vurgu: '#3DDC97',
    vurguMetin: '#07251A',
    vurguYazi: '#3DDC97',
    ikincil: '#FF7A59',
    ikincilMetin: '#2A0D05',
    dogru: '#3DDC97',
    dogruMetin: '#07251A',
    yanlis: '#FF6B6B',
    desen: 'nokta',
    desenRenk: 'rgba(255,255,255,0.07)',
    isaret: 'blok',
  },
};

export const paletBul = (id?: string): Palet => paletler[id ?? hesap.palet] ?? paletler.gece;

const PaletContext = createContext<Palet>(paletler.gece);
export const usePalet = () => useContext(PaletContext);

export const PaletSaglayici: React.FC<{ palet?: string; children: React.ReactNode }> = ({ palet, children }) => (
  <PaletContext.Provider value={paletBul(palet)}>{children}</PaletContext.Provider>
);

// Rengi saydamlaştır (#RRGGBB → rgba)
export const saydam = (renk: string, oran: number) => `color-mix(in srgb, ${renk} ${Math.round(oran * 100)}%, transparent)`;

export const FONT = "'Poppins', sans-serif";
export const EL_YAZISI = "'Caveat', cursive";
