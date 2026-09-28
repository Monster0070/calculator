import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arkaplan } from '../components/Arkaplan';
import { Rozet, UstBar } from '../components/Marka';
import { HARFLER, reelsBul } from '../icerik';
import { ZenginMetin } from '../lib/zengin-metin';
import { EL_YAZISI, FONT, PaletSaglayici, usePalet } from '../tema';
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
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: p.metin }}>
      <Arkaplan genislik={1080} yukseklik={1920} tohum={r.id} hareket={false} />
      <UstBar rozet={`${r.sinav} · ${r.ders}`} />
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
          gap: 52,
          textAlign: 'center',
        }}
      >
        {r.konu && <Rozet metin={r.konu} boyut={34} renk={p.yuzey} yaziRenk={p.metin} />}
        <div style={{ fontSize: 108, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
          <ZenginMetin metin={r.kanca ?? r.konu ?? r.ders} />
        </div>
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
            SORU
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.3 }}>
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
