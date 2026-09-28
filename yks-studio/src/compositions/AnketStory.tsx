import { Check, Lightbulb } from 'lucide-react';
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arkaplan } from '../components/Arkaplan';
import { HesapEtiketi, Rozet, UstBar } from '../components/Marka';
import { anketBul } from '../icerik';
import { ZenginMetin } from '../lib/zengin-metin';
import { EL_YAZISI, FONT, PaletSaglayici, saydam, usePalet } from '../tema';
import type { AnketIcerik } from '../tipler';

// Hikâye (9:16) görseli. Anket/Test/Kaydırıcı çıkartması Instagram'da okun gösterdiği boş alana eklenir.
export const AnketStory: React.FC<{ id: string; palet?: string; cevap?: boolean }> = ({ id, palet, cevap = false }) => (
  <PaletSaglayici palet={palet}>
    <AnketIcerigi a={anketBul(id)} cevap={cevap} />
  </PaletSaglayici>
);

const AnketIcerigi: React.FC<{ a: AnketIcerik; cevap: boolean }> = ({ a, cevap }) => {
  const p = usePalet();
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: p.metin }}>
      <Arkaplan genislik={1080} yukseklik={1920} tohum={a.id} hareket={false} />
      <UstBar rozet={[a.sinav, a.ders].filter(Boolean).join(' · ')} y={250} />
      {cevap ? <CevapYuzu a={a} /> : <SoruYuzu a={a} />}
    </AbsoluteFill>
  );
};

const ELE_YAZI: Record<AnketIcerik['tip'], string> = {
  anket: 'Buraya oy ver!',
  quiz: 'Doğru cevabı seç!',
  kaydirici: 'Kaydır bakalım!',
};

const SoruYuzu: React.FC<{ a: AnketIcerik }> = ({ a }) => {
  const p = usePalet();
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 440,
          left: 72,
          right: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          textAlign: 'center',
        }}
      >
        <Rozet metin={a.ust ?? 'ANKET'} boyut={32} renk={p.vurgu} yaziRenk={p.vurguMetin} />
        <div style={{ fontSize: 90, fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.01em' }}>
          <ZenginMetin metin={a.soru} />
        </div>
        {a.not && <div style={{ fontSize: 40, fontWeight: 600, color: p.metinSoluk }}>{a.not}</div>}
      </div>
      <div style={{ position: 'absolute', top: 1040, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10 }}>
        <span style={{ fontFamily: EL_YAZISI, fontWeight: 700, fontSize: 72, color: p.vurguYazi, transform: 'rotate(-4deg)' }}>
          {ELE_YAZI[a.tip]}
        </span>
        <svg viewBox="0 0 120 200" width={84} height={140} style={{ marginBottom: -110 }}>
          <path d="M20 12 C 90 30, 100 110, 52 176" stroke={p.vurguYazi} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M28 150 L 52 178 L 80 156" stroke={p.vurguYazi} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

const CevapYuzu: React.FC<{ a: AnketIcerik }> = ({ a }) => {
  const p = usePalet();
  const dogru = a.secenekler?.[a.dogru ?? 0] ?? '';
  return (
    <div
      style={{
        position: 'absolute',
        top: 420,
        left: 72,
        right: 72,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 44,
        textAlign: 'center',
      }}
    >
      <Rozet metin="CEVAP" boyut={32} renk={p.dogru} yaziRenk={p.dogruMetin} />
      <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.2, color: p.metinSoluk }}>
        <ZenginMetin metin={a.soru.replace(/==/g, '')} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          background: p.dogru,
          color: p.dogruMetin,
          borderRadius: 48,
          padding: '34px 56px 34px 34px',
          transform: 'rotate(-2deg)',
          boxShadow: `0 0 0 12px ${saydam(p.dogru, 0.22)}, 0 24px 60px rgba(0,0,0,0.3)`,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: p.dogruMetin,
            color: p.dogru,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Check size={72} strokeWidth={3.6} />
        </div>
        <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1 }}>
          <ZenginMetin metin={dogru} />
        </div>
      </div>
      {a.aciklama && (
        <div
          style={{
            width: '100%',
            background: p.yuzey,
            border: `3px solid ${p.yuzeyKenar}`,
            borderRadius: 36,
            padding: '30px 40px 36px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: p.vurguYazi,
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: '0.16em',
              marginBottom: 12,
            }}
          >
            <Lightbulb size={38} strokeWidth={2.6} /> ÇÖZÜM
          </div>
          <div style={{ fontSize: 46, fontWeight: 600, lineHeight: 1.36 }}>
            <ZenginMetin metin={a.aciklama} />
          </div>
        </div>
      )}
      <div style={{ fontFamily: EL_YAZISI, fontWeight: 700, fontSize: 72, color: p.vurguYazi, transform: 'rotate(-3deg)', marginTop: 10 }}>
        Sen doğru bildin mi?
      </div>
      <HesapEtiketi logo={64} yazi={34} />
    </div>
  );
};
