import React, { useMemo } from 'react';
import { interpolateColors } from 'remotion';
import { saydam, usePalet } from '../tema';

// İçerik metinlerindeki küçük işaretleme dili:
//   **kalın vurgu**   ==fosforlu işaret==   ~~üstü çizili~~   2^{5} üs   H_{2} alt simge   → ok   \n alt satır
//   [[söz|IV]]  altı çizili ve altına numara yazılmış söz (ÖSYM'nin numaralı söz soruları için)
type Etiket = 'ust' | 'alt' | 'vurgu' | 'isaret' | 'ciz' | 'numara';
type Dugum = string | { tip: Etiket; cocuk: Dugum[]; etiket?: string };

const CIFT_ISARETLER: Array<[string, Etiket]> = [
  ['**', 'vurgu'],
  ['==', 'isaret'],
  ['~~', 'ciz'],
];

const kapanisBul = (s: string, acilis: number) => {
  let derinlik = 0;
  for (let j = acilis; j < s.length; j++) {
    if (s[j] === '{') derinlik++;
    else if (s[j] === '}' && --derinlik === 0) return j;
  }
  return -1;
};

export const cozumle = (s: string): Dugum[] => {
  const sonuc: Dugum[] = [];
  let metin = '';
  const bosalt = () => {
    if (metin) sonuc.push(metin);
    metin = '';
  };
  let i = 0;
  dongu: while (i < s.length) {
    if (s.startsWith('[[', i)) {
      const son = s.indexOf(']]', i + 2);
      const ayrac = s.indexOf('|', i + 2);
      if (son > 0 && ayrac > 0 && ayrac < son) {
        bosalt();
        sonuc.push({ tip: 'numara', cocuk: cozumle(s.slice(i + 2, ayrac)), etiket: s.slice(ayrac + 1, son) });
        i = son + 2;
        continue;
      }
    }
    if ((s[i] === '^' || s[i] === '_') && s[i + 1] === '{') {
      const son = kapanisBul(s, i + 1);
      if (son > 0) {
        bosalt();
        sonuc.push({ tip: s[i] === '^' ? 'ust' : 'alt', cocuk: cozumle(s.slice(i + 2, son)) });
        i = son + 1;
        continue;
      }
    }
    for (const [isaret, tip] of CIFT_ISARETLER) {
      if (s.startsWith(isaret, i)) {
        const son = s.indexOf(isaret, i + 2);
        if (son > 0) {
          bosalt();
          sonuc.push({ tip, cocuk: cozumle(s.slice(i + 2, son)) });
          i = son + 2;
          continue dongu;
        }
      }
    }
    metin += s[i++];
  }
  bosalt();
  return sonuc;
};

const Ok: React.FC = () => (
  <svg viewBox="0 0 24 24" style={{ width: '0.95em', height: '0.95em', verticalAlign: '-0.12em' }}>
    <path d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5" stroke="currentColor" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const okluMetin = (parca: string) => {
  if (!parca.includes('→')) return parca;
  return parca.split('→').flatMap((p, i) => (i === 0 ? [p] : [<Ok key={i} />, p]));
};

type Props = {
  metin: string;
  kelimeStili?: (indeks: number) => React.CSSProperties | undefined;
  isaretIlerleme?: number;
};

export const ZenginMetin: React.FC<Props> = ({ metin, kelimeStili, isaretIlerleme = 1 }) => {
  const p = usePalet();
  const dugumler = useMemo(() => cozumle(metin), [metin]);
  const sayac = { kelime: -1, bosluk: true };
  let anahtar = 0;

  // Animasyonlu kelimeler inline-block olmalı (transform için); inline-block'a üstü çizili süs geçmediğinden
  // çizgi, ciz() ile kelimelere ayrıca aktarılır.
  const ciz = (liste: Dugum[], kelimeEk?: React.CSSProperties): React.ReactNode[] =>
    liste.map((d) => {
      const k = anahtar++;
      if (typeof d === 'string') {
        return d.split(/([ \t\n]+)/).map((parca, m) => {  // bölünmez boşluk (\u00a0) kelimeyi bölmez
          if (!parca) return null;
          if (/^[ \t\n]+$/.test(parca)) {
            sayac.bosluk = true;
            return parca.includes('\n') ? <br key={`${k}-${m}`} /> : ' ';
          }
          if (sayac.bosluk) {
            sayac.kelime++;
            sayac.bosluk = false;
          }
          return (
            <span
              key={`${k}-${m}`}
              style={{ display: kelimeStili ? 'inline-block' : 'inline', whiteSpace: 'pre', ...kelimeEk, ...kelimeStili?.(sayac.kelime) }}
            >
              {okluMetin(parca)}
            </span>
          );
        });
      }
      const cizgi: React.CSSProperties = { textDecoration: `line-through ${p.yanlis}`, textDecorationThickness: '0.09em' };
      const altCizgi: React.CSSProperties = {
        textDecoration: `underline ${p.vurguYazi}`,
        textDecorationThickness: '0.08em',
        textUnderlineOffset: '0.18em',
      };
      const ek = d.tip === 'ciz' ? cizgi : d.tip === 'numara' ? altCizgi : null;
      const icerik = ciz(d.cocuk, ek ? { ...kelimeEk, ...ek } : kelimeEk);
      switch (d.tip) {
        case 'ust':
          return (
            <span key={k} style={{ fontSize: '0.6em', position: 'relative', top: '-0.72em', lineHeight: 0, marginLeft: '0.03em' }}>
              {icerik}
            </span>
          );
        case 'alt':
          return (
            <span key={k} style={{ fontSize: '0.6em', position: 'relative', top: '0.3em', lineHeight: 0, marginLeft: '0.02em' }}>
              {icerik}
            </span>
          );
        case 'vurgu':
          return (
            <span key={k} style={{ color: p.vurguYazi, fontWeight: 800 }}>
              {icerik}
            </span>
          );
        case 'numara':
          return (
            <span
              key={k}
              style={{
                position: 'relative',
                display: 'inline-block',
                ...altCizgi,
              }}
            >
              {icerik}
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '100%',
                  transform: 'translate(-50%, 0.12em)',
                  fontSize: '0.56em',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: p.vurguYazi,
                }}
              >
                {d.etiket}
              </span>
            </span>
          );
        case 'ciz':
          return (
            <span key={k} style={{ ...cizgi, opacity: 0.8 }}>
              {icerik}
            </span>
          );
        case 'isaret': {
          const blok = p.isaret === 'blok';
          return (
            <span
              key={k}
              style={{
                color: blok ? interpolateColors(isaretIlerleme, [0.35, 0.75], [p.metin, p.vurguMetin]) : undefined,
                backgroundImage: `linear-gradient(${blok ? p.vurgu : saydam(p.vurgu, 0.95)}, ${blok ? p.vurgu : saydam(p.vurgu, 0.95)})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${isaretIlerleme * 100}% ${blok ? '100%' : '0.5em'}`,
                backgroundPosition: blok ? '0 0' : '0 88%',
                padding: blok ? '0 0.14em' : '0 0.06em',
                borderRadius: blok ? '0.14em' : 0,
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
              }}
            >
              {icerik}
            </span>
          );
        }
      }
      return null;
    });

  return <>{ciz(dugumler)}</>;
};
