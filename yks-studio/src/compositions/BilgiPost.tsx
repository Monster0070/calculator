import { ArrowRight, Bookmark, Check, Lightbulb, X } from 'lucide-react';
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arkaplan } from '../components/Arkaplan';
import { HesapEtiketi, Rozet } from '../components/Marka';
import { dersBul } from '../dersler';
import { gonderiBul, hesap, trBuyuk } from '../icerik';
import { ZenginMetin } from '../lib/zengin-metin';
import { FONT, PaletSaglayici, saydam, usePalet } from '../tema';
import type { GonderiIcerik } from '../tipler';

// Bilgi notu gönderisi (4:5, 1080x1350)
export const BilgiPost: React.FC<{ id: string; palet?: string }> = ({ id, palet }) => (
  <PaletSaglayici palet={palet}>
    <GonderiIcerigi g={gonderiBul(id)} />
  </PaletSaglayici>
);

const kart = (p: ReturnType<typeof usePalet>): React.CSSProperties => ({
  background: p.yuzey,
  border: `3px solid ${p.yuzeyKenar}`,
  borderRadius: 24,
  boxShadow: p.koyu ? '0 14px 30px rgba(0,0,0,0.25)' : '0 10px 24px rgba(29,42,91,0.08)',
});

const GonderiIcerigi: React.FC<{ g: GonderiIcerik }> = ({ g }) => {
  const p = usePalet();
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: p.metin }}>
      <Arkaplan genislik={1080} yukseklik={1350} tohum={g.id} hareket={false} sembolSayisi={9} parilti={dersBul(g.ders)?.renk} />
      <div style={{ position: 'absolute', top: 60, bottom: 54, left: 64, right: 64, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <HesapEtiketi logo={56} yazi={30} />
          <Rozet metin={[g.sinav, g.ders].filter(Boolean).join(' · ')} ders={g.ders} />
        </div>
        <div style={{ marginTop: 40 }}>
          {g.ust && (
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.2em', color: p.vurguYazi }}>{trBuyuk(g.ust)}</div>
          )}
          <div style={{ fontSize: 74, fontWeight: 900, lineHeight: 1.1, marginTop: 8, letterSpacing: '-0.01em' }}>
            <ZenginMetin metin={g.baslik} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '28px 0 24px' }}>
          {g.tip === 'formul' && <FormulListesi g={g} />}
          {g.tip === 'tablo' && <Tablo g={g} />}
          {g.tip === 'liste' && <MaddeListesi g={g} />}
        </div>
        {g.ipucu && <Ipucu metin={g.ipucu} />}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 24,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <span style={{ color: p.metinSoluk }}>{hesap.slogan}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: p.vurguYazi }}>
            <Bookmark size={32} strokeWidth={2.6} /> Kaydet, tekrar et!
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Numara: React.FC<{ n: number; boyut?: number }> = ({ n, boyut = 46 }) => {
  const p = usePalet();
  return (
    <div
      style={{
        width: boyut,
        height: boyut,
        borderRadius: '50%',
        background: p.vurgu,
        color: p.vurguMetin,
        display: 'grid',
        placeItems: 'center',
        fontSize: boyut * 0.52,
        fontWeight: 800,
        paddingTop: 2,
        flexShrink: 0,
      }}
    >
      {n}
    </div>
  );
};

const FormulListesi: React.FC<{ g: GonderiIcerik }> = ({ g }) => {
  const p = usePalet();
  const n = g.maddeler.length;
  const punto = n <= 4 ? 46 : n <= 5 ? 42 : 39;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {g.maddeler.map((m, i) => {
        const [formul, etiket] = Array.isArray(m) ? m : [m, ''];
        return (
          <div key={i} style={{ ...kart(p), display: 'flex', alignItems: 'center', gap: 20, padding: '18px 26px' }}>
            <Numara n={i + 1} />
            <div style={{ flex: 1, fontSize: punto, fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1.3 }}>
              <ZenginMetin metin={formul} />
            </div>
            {etiket && (
              <div style={{ fontSize: 24, fontWeight: 600, color: p.metinSoluk, textAlign: 'right', maxWidth: 250, lineHeight: 1.25 }}>
                {etiket}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Tablo: React.FC<{ g: GonderiIcerik }> = ({ g }) => {
  const p = usePalet();
  const n = g.maddeler.length;
  const punto = n <= 5 ? 36 : n <= 7 ? 32 : 30;
  const [solBaslik, sagBaslik] = g.basliklar ?? ['', ''];
  const esit = g.stil === 'karsilastirma';
  const ikonlu = Boolean(g.ikonlar);
  const sutunlar = ikonlu ? '1fr 40px 1fr' : '1fr 1fr';
  const baslikStili: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '0.14em',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: sutunlar, gap: 16, padding: '0 26px 4px' }}>
        <div style={{ ...baslikStili, color: ikonlu ? p.yanlis : p.vurguYazi }}>
          {ikonlu && <X size={32} strokeWidth={3.2} />}
          {trBuyuk(solBaslik)}
        </div>
        {ikonlu && <div />}
        <div style={{ ...baslikStili, color: ikonlu ? p.dogru : esit ? p.ikincil : p.metinSoluk }}>
          {ikonlu && <Check size={32} strokeWidth={3.2} />}
          {trBuyuk(sagBaslik)}
        </div>
      </div>
      {g.maddeler.map((m, i) => {
        const [sol, sag] = Array.isArray(m) ? m : [m, ''];
        return (
          <div
            key={i}
            style={{
              ...kart(p),
              display: 'grid',
              gridTemplateColumns: sutunlar,
              gap: 16,
              alignItems: 'center',
              padding: '14px 26px',
              fontSize: punto,
              lineHeight: 1.3,
            }}
          >
            <div
              style={
                ikonlu
                  ? { color: p.yanlis, fontWeight: 600, textDecoration: 'line-through', textDecorationThickness: '0.08em' }
                  : { fontWeight: esit ? 600 : 800 }
              }
            >
              <ZenginMetin metin={sol} />
            </div>
            {ikonlu && <ArrowRight size={34} strokeWidth={3} color={p.metinSoluk} />}
            <div
              style={{
                fontWeight: ikonlu ? 800 : esit ? 600 : 500,
                color: ikonlu ? p.dogru : undefined,
                borderLeft: ikonlu ? 'none' : `3px solid ${p.yuzeyKenar}`,
                paddingLeft: ikonlu ? 0 : 20,
              }}
            >
              <ZenginMetin metin={sag} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MaddeListesi: React.FC<{ g: GonderiIcerik }> = ({ g }) => {
  const p = usePalet();
  const punto = g.maddeler.length <= 4 ? 35 : 31;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {g.maddeler.map((m, i) => (
        <div key={i} style={{ ...kart(p), display: 'flex', alignItems: 'flex-start', gap: 22, padding: '18px 26px' }}>
          <Numara n={i + 1} boyut={52} />
          <div style={{ flex: 1, fontSize: punto, fontWeight: 500, lineHeight: 1.38, paddingTop: 2 }}>
            <ZenginMetin metin={Array.isArray(m) ? m.join(' ') : m} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const Ipucu: React.FC<{ metin: string; punto?: number }> = ({ metin, punto = 30 }) => {
  const p = usePalet();
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        background: saydam(p.vurgu, p.koyu ? 0.12 : 0.35),
        border: `3px solid ${saydam(p.vurgu, 0.6)}`,
        borderRadius: 24,
        padding: '20px 26px',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: p.vurgu,
          color: p.vurguMetin,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Lightbulb size={32} strokeWidth={2.6} />
      </div>
      <div style={{ fontSize: punto, fontWeight: 600, lineHeight: 1.35 }}>
        <ZenginMetin metin={metin} />
      </div>
    </div>
  );
};
