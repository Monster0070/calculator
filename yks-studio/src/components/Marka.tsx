import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DERS_YAZI, dersBul } from '../dersler';
import { hesap, trBuyuk } from '../icerik';
import { FONT, usePalet } from '../tema';

// Logo: marka renginde daire, içinde geri sayım halkası ve "YKS"
export const Logo: React.FC<{ boyut: number; ters?: boolean; ilerleme?: number }> = ({ boyut, ters = false, ilerleme = 0.78 }) => {
  const p = usePalet();
  const zemin = ters ? p.vurguMetin : p.vurgu;
  const yazi = ters ? p.vurgu : p.vurguMetin;
  const r = 41;
  const cevre = 2 * Math.PI * r;
  return (
    <div
      style={{
        width: boyut,
        height: boyut,
        borderRadius: '50%',
        background: zemin,
        position: 'relative',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke={yazi} strokeOpacity={0.18} strokeWidth={6} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={yazi}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${cevre * ilerleme} ${cevre}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: boyut * 0.27,
          color: yazi,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginTop: boyut * 0.03,
        }}
      >
        {hesap.logoMetin}
      </span>
    </div>
  );
};

export const Rozet: React.FC<{ metin: string; boyut?: number; renk?: string; yaziRenk?: string; ders?: string }> = ({
  metin,
  boyut = 28,
  renk,
  yaziRenk,
  ders,
}) => {
  const p = usePalet();
  // Ders verilirse rozet o dersin renginde ve logosuyla çıkar
  const d = dersBul(ders);
  const Ikon = d?.Ikon;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: boyut * 0.35,
        background: renk ?? d?.renk ?? p.ikincil,
        color: yaziRenk ?? (d ? DERS_YAZI : p.ikincilMetin),
        fontSize: boyut,
        fontWeight: 800,
        letterSpacing: '0.08em',
        padding: `${boyut * 0.42}px ${boyut * 0.8}px ${boyut * 0.36}px`,
        borderRadius: 999,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {Ikon && <Ikon size={boyut * 1.15} strokeWidth={2.6} style={{ marginTop: -boyut * 0.08 }} />}
      {trBuyuk(metin)}
    </div>
  );
};

export const HesapEtiketi: React.FC<{ logo?: number; yazi?: number; renk?: string }> = ({ logo = 60, yazi = 32, renk }) => {
  const p = usePalet();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: logo * 0.26 }}>
      <Logo boyut={logo} />
      <span style={{ fontSize: yazi, fontWeight: 700, color: renk ?? p.metin }}>@{hesap.kullaniciAdi}</span>
    </div>
  );
};

// Üst şerit: solda hesap, sağda sınav/ders rozeti
export const UstBar: React.FC<{ rozet?: string; ders?: string; y?: number; giris?: number; yanKenar?: number }> = ({
  rozet,
  ders,
  y = 196,
  giris = -100,
  yanKenar = 64,
}) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: kare - giris, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: yanKenar,
        right: yanKenar,
        top: y,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: s,
        transform: `translateY(${(1 - s) * -30}px)`,
      }}
    >
      <HesapEtiketi />
      {rozet && <Rozet metin={rozet} ders={ders} />}
    </div>
  );
};
