import React from 'react';
import { AbsoluteFill, Freeze } from 'remotion';
import { reelsBul } from '../icerik';
import { FPS, reelsZamanla } from '../lib/zaman';
import { FONT } from '../tema';
import { SoruReels } from './SoruReels';

// Bir reels'in kilit anlarını tek sayfada gösteren kontrol sayfası (4x2)
export const ReelsOnizleme: React.FC<{ id: string; palet?: string }> = ({ id, palet }) => {
  const z = reelsZamanla(reelsBul(id));
  const kareler: Array<[string, number]> = [
    ['Kanca', z.kanca ? z.kanca.bas + Math.round(z.kanca.sure * 0.9) : 20],
    ['Soru', z.soru.bas + Math.round(z.soru.sure * 0.5)],
    ['Seçenekler', z.sayacBas - 3],
    ['Sayaç', z.sayacBas + 36],
    ['Cevap', z.cevapBas + 14],
    ['Çözüm', z.aciklama ? z.aciklama.bas + Math.round(z.aciklama.sure * 0.85) : z.cevapBas + 40],
    ['Kapanış', z.kapanisBas + 8],
    ['Kapanış', z.kapanisBas + 50],
  ];
  return (
    <AbsoluteFill style={{ background: '#1a1a1a', flexDirection: 'row', flexWrap: 'wrap', fontFamily: FONT }}>
      {kareler.map(([ad, kare], i) => (
        <div key={i} style={{ width: 270, height: 520, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 1080, height: 1920, transform: 'scale(0.25)', transformOrigin: 'top left' }}>
            <Freeze frame={kare}>
              <SoruReels id={id} palet={palet} />
            </Freeze>
          </div>
          <div style={{ position: 'absolute', top: 484, left: 10, color: '#ddd', fontSize: 20, fontWeight: 600 }}>
            {ad} · {(kare / FPS).toFixed(1)} sn
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
