import React from 'react';
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { saydam, usePalet } from '../tema';

const SINIRLA = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// 3-2-1 geri sayım halkası: her saniye rakam "çarpar", halka boşalır, bitince patlar
export const GeriSayimHalkasi: React.FC<{ bas: number; adet: number; merkezY: number }> = ({ bas, adet, merkezY }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  const bitis = bas + adet * fps;
  if (kare < bas - 8 || kare > bitis + 12) return null;

  const yerel = kare - bas;
  const giris = spring({ frame: yerel + 6, fps, config: { damping: 13, stiffness: 170 } });
  const cikis = interpolate(kare, [bitis, bitis + 9], [0, 1], SINIRLA);
  const sira = Math.min(adet - 1, Math.max(0, Math.floor(yerel / fps)));
  const tikYerel = yerel - sira * fps;
  const vurus = spring({ frame: tikYerel, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  const ilerleme = interpolate(yerel, [0, adet * fps], [1, 0], SINIRLA);
  const nabiz = Math.exp(-Math.max(0, tikYerel) / 8);
  const R = 100;
  const cevre = 2 * Math.PI * R;

  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 130,
        top: merkezY - 130,
        width: 260,
        height: 260,
        transform: `scale(${giris * (1 + cikis * 0.5)})`,
        opacity: Math.min(1, giris) * (1 - cikis),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -50 - nabiz * 30,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${saydam(p.vurguYazi, 0.1 + 0.3 * nabiz)} 0%, transparent 68%)`,
        }}
      />
      <svg viewBox="0 0 260 260" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={130} cy={130} r={R + 16} fill={p.yuzey} />
        <circle cx={130} cy={130} r={R} fill="none" stroke={p.yuzeyKenar} strokeWidth={16} />
        <circle
          cx={130}
          cy={130}
          r={R}
          fill="none"
          stroke={p.vurguYazi}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${cevre * ilerleme} ${cevre}`}
          transform="rotate(-90 130 130)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          paddingTop: 10,
          fontSize: 136,
          fontWeight: 900,
          lineHeight: 1,
          color: p.vurguYazi,
          transform: `scale(${interpolate(vurus, [0, 1], [1.7, 1])}) rotate(${interpolate(vurus, [0, 1], [-14, 0])}deg)`,
        }}
      >
        {adet - sira}
      </div>
    </div>
  );
};

// Doğru cevapta patlayan konfeti
export const Konfeti: React.FC<{ bas: number; x: number; y: number; adet?: number; tohum?: string }> = ({
  bas,
  x,
  y,
  adet = 56,
  tohum = 'konfeti',
}) => {
  const kare = useCurrentFrame();
  const p = usePalet();
  const t = kare - bas;
  if (t < 0 || t > 75) return null;
  const renkler = [p.vurgu, p.ikincil, p.dogru, p.metin, p.vurguYazi];
  const surtunme = 0.92;
  const yol = (1 - Math.pow(surtunme, t)) / (1 - surtunme);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: adet }, (_, i) => {
        const aci = random(`${tohum}a${i}`) * Math.PI * 2;
        const hiz = 14 + random(`${tohum}h${i}`) * 32;
        const w = 12 + random(`${tohum}w${i}`) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(aci) * hiz * yol,
              top: y + Math.sin(aci) * hiz * yol + 0.32 * t * t,
              width: w,
              height: w * (0.45 + random(`${tohum}r${i}`) * 0.4),
              background: renkler[i % renkler.length],
              borderRadius: i % 3 === 0 ? '50%' : 3,
              transform: `rotate(${random(`${tohum}d${i}`) * 720 * (t / 60)}deg)`,
              opacity: interpolate(t, [45, 75], [1, 0], SINIRLA),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
