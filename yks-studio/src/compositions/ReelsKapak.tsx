import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arkaplan } from '../components/Arkaplan';
import { UstBar } from '../components/Marka';
import { DersLogosu, dersBul } from '../dersler';
import { HARFLER, reelsBul, trBuyuk } from '../icerik';
import { ZenginMetin } from '../lib/zengin-metin';
import { EL_YAZISI, FONT, PaletSaglayici, saydam, usePalet } from '../tema';
import type { ReelsIcerik } from '../tipler';
import type { ReelsProps } from './SoruReels';

// Reels kapak görseli. Profil ızgarası ortadaki 3:4 alanı gösterdiği için içerik ortada toplanır.
export const ReelsKapak: React.FC<ReelsProps> = ({ id, palet }) => (
  <PaletSaglayici palet={palet}>
    <KapakIcerik r={reelsBul(id)} />
  </PaletSaglayici>
);

const KapakIcerik: React.FC<{ r: ReelsIcerik }> = ({ r }) => {
  const p = usePalet();
  const d = dersBul(r.ders);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: p.metin }}>
      <Arkaplan genislik={1080} yukseklik={1920} tohum={r.id} hareket={false} parilti={d?.renk} />
      <UstBar rozet={`${r.sinav} · ${r.ders}`} ders={r.ders} />
      <div
        style={{
          position: 'absolute',
          top: 320,
          bottom: 320,
          left: 72,
          right: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <DersLogosu ders={r.ders} boyut={150} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '0.12em', padding: '6px 18px 2px', border: `5px solid ${p.metin}`, borderRadius: 16 }}>
              {r.sinav}
            </span>
            <span style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, color: d?.renk ?? p.vurgu }}>{trBuyuk(r.ders)}</span>
          </div>
        </div>
        {r.osym ? (
          <div
            style={{
              transform: 'rotate(-6deg)',
              border: `12px double ${p.vurgu}`,
              borderRadius: 22,
              background: saydam(p.vurgu, 0.07),
              padding: '16px 44px 12px',
            }}
          >
            <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1.05, color: p.vurgu }}>ÖSYM SORDU</div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '0.14em', marginTop: 4 }}>
              {r.osym.yil} · {r.sinav} · {r.osym.soruNo}. SORU
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            <ZenginMetin metin={r.kanca ?? r.konu ?? r.ders} />
          </div>
        )}
        <div
          style={{
            position: 'relative',
            width: '100%',
            transform: 'rotate(-2.5deg)',
            marginTop: 14,
            background: p.yuzey,
            border: `3px solid ${p.yuzeyKenar}`,
            borderRadius: 40,
            padding: '60px 44px 40px',
            textAlign: 'left',
            boxShadow: p.koyu ? '0 30px 60px rgba(0,0,0,0.35)' : '0 20px 40px rgba(29,42,91,0.12)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -26,
              left: 40,
              background: p.vurgu,
              color: p.vurguMetin,
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: '0.18em',
              padding: '12px 24px 10px',
              borderRadius: 999,
              lineHeight: 1,
            }}
          >
            {r.osym ? `ÖSYM ${r.osym.yil}` : 'SORU'}
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: r.soru.includes('[[') ? 1.85 : 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            <ZenginMetin metin={r.soru} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 30 }}>
            {HARFLER.slice(0, r.secenekler.length).map((h) => (
              <div
                key={h}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: `3px solid ${p.vurguYazi}`,
                  color: p.vurguYazi,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 34,
                  fontWeight: 800,
                  paddingTop: 3,
                }}
              >
                {h}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 10 }}>
          {[3, 2, 1].map((n) => (
            <div
              key={n}
              style={{
                width: 124,
                height: 124,
                borderRadius: '50%',
                border: `6px solid ${p.vurguYazi}`,
                background: n === 1 ? p.vurguYazi : 'transparent',
                color: n === 1 ? p.vurguMetin : p.vurguYazi,
                display: 'grid',
                placeItems: 'center',
                fontSize: 66,
                fontWeight: 900,
                paddingTop: 6,
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: EL_YAZISI, fontWeight: 700, fontSize: 84, color: p.vurguYazi, transform: 'rotate(-3deg)', marginTop: -24 }}>
          Cevap videoda!
        </div>
      </div>
    </AbsoluteFill>
  );
};
