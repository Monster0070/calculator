import React, { useMemo } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { FONT, type Palet, saydam, usePalet } from '../tema';

const SEMBOLLER = ['π', '√', '∑', '%', '÷', '×', '+', '?', '∞', 'Δ', '!', '=', 'x²', 'A', 'B', 'C'];

const desenStili = (p: Palet, t: number): React.CSSProperties => {
  const c = p.desenRenk;
  switch (p.desen) {
    case 'izgara':
      return {
        backgroundImage: `linear-gradient(${c} 2px, transparent 2px), linear-gradient(90deg, ${c} 2px, transparent 2px)`,
        backgroundSize: '72px 72px',
        backgroundPosition: `0 ${t * 0.6}px`,
      };
    case 'nokta':
      return {
        backgroundImage: `radial-gradient(${c} 3px, transparent 3.6px)`,
        backgroundSize: '46px 46px',
        backgroundPosition: `0 ${t * 0.5}px`,
      };
    case 'defter':
      return {
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 62px, ${c} 62px, ${c} 64px)`,
        backgroundPosition: '0 30px',
      };
  }
};

// Hareketli arka plan: degrade + desen + ışık lekeleri + süzülen semboller
// Boyut, önizlemelerde küçültülmüş hâlde de aynı görünmesi için dışarıdan verilir.
export const Arkaplan: React.FC<{ genislik: number; yukseklik: number; tohum?: string; hareket?: boolean; sembolSayisi?: number }> = ({
  genislik: width,
  yukseklik: height,
  tohum = 'yks',
  hareket = true,
  sembolSayisi = 14,
}) => {
  const p = usePalet();
  const kare = useCurrentFrame();
  const t = hareket ? kare : 0;

  const semboller = useMemo(
    () =>
      Array.from({ length: sembolSayisi }, (_, i) => ({
        karakter: SEMBOLLER[Math.floor(random(`${tohum}-k-${i}`) * SEMBOLLER.length)],
        x: random(`${tohum}-x-${i}`) * width - 60,
        y: random(`${tohum}-y-${i}`) * (height + 300),
        boyut: 70 + random(`${tohum}-b-${i}`) * 110,
        hiz: 0.25 + random(`${tohum}-h-${i}`) * 0.55,
        donus: (random(`${tohum}-d-${i}`) - 0.5) * 0.5,
        aci: random(`${tohum}-a-${i}`) * 360,
        opaklik: (p.koyu ? 0.045 : 0.06) + random(`${tohum}-o-${i}`) * 0.05,
      })),
    [tohum, sembolSayisi, width, height, p.koyu],
  );

  const alan = height + 300;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 15% 0%, ${p.arkaplan2} 0%, ${p.arkaplan} 62%)`, overflow: 'hidden' }}>
      <AbsoluteFill style={desenStili(p, t)} />
      {p.desen === 'defter' && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 118, width: 3, background: 'rgba(214,40,57,0.32)' }} />
      )}
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 30% at ${50 + 30 * Math.sin(t / 90)}% ${28 + 10 * Math.cos(t / 70)}%, ${saydam(p.vurgu, p.koyu ? 0.13 : 0.25)} 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 35% at ${45 + 30 * Math.cos(t / 110)}% ${78 + 8 * Math.sin(t / 80)}%, ${saydam(p.ikincil, p.koyu ? 0.16 : 0.07)} 0%, transparent 70%)`,
        }}
      />
      {semboller.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: ((((s.y - t * s.hiz) % alan) + alan) % alan) - 150,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: s.boyut,
            lineHeight: 1,
            color: p.metin,
            opacity: s.opaklik,
            transform: `rotate(${s.aci + t * s.donus}deg)`,
          }}
        >
          {s.karakter}
        </div>
      ))}
      {p.koyu && <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.35) 100%)' }} />}
    </AbsoluteFill>
  );
};
