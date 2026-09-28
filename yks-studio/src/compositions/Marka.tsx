import React from 'react';
import { AbsoluteFill, Freeze } from 'remotion';
import { Logo } from '../components/Marka';
import { gonderiListesi, reelsListesi } from '../icerik';
import { reelsZamanla } from '../lib/zaman';
import { FONT, PaletSaglayici, paletler, usePalet } from '../tema';
import { BilgiPost } from './BilgiPost';
import { SoruReels } from './SoruReels';

// Profil fotoğrafı (Instagram daire olarak kırpar)
export const ProfilFoto: React.FC<{ palet?: string }> = ({ palet }) => (
  <PaletSaglayici palet={palet}>
    <ProfilIcerik />
  </PaletSaglayici>
);

const ProfilIcerik: React.FC = () => {
  const p = usePalet();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, ${p.arkaplan2} 0%, ${p.arkaplan} 70%)`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Logo boyut={860} />
    </AbsoluteFill>
  );
};

const Kucuk: React.FC<{ genislik: number; yukseklik: number; olcek: number; children: React.ReactNode }> = ({
  genislik,
  yukseklik,
  olcek,
  children,
}) => (
  <div
    style={{
      width: genislik * olcek,
      height: yukseklik * olcek,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 18,
      boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
      flexShrink: 0,
    }}
  >
    <div style={{ position: 'absolute', width: genislik, height: yukseklik, transform: `scale(${olcek})`, transformOrigin: 'top left' }}>
      {children}
    </div>
  </div>
);

// Renk teması tartışması için: aynı içerik dört farklı palette
export const PaletKarsilastirma: React.FC = () => {
  const reels = reelsListesi[0];
  const gonderi = gonderiListesi[0];
  const z = reelsZamanla(reels);
  const sayacKaresi = z.sayacBas + 36;
  const cevapKaresi = z.aciklama ? z.aciklama.bas + Math.round(z.aciklama.sure * 0.9) : z.cevapBas + 40;
  return (
    <AbsoluteFill style={{ background: '#101014', color: '#F3F3F6', fontFamily: FONT, padding: '70px 60px' }}>
      <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1 }}>Renk paleti seçenekleri</div>
      <div style={{ fontSize: 30, fontWeight: 500, color: '#A9A9B8', marginTop: 12 }}>
        Aynı reels (geri sayım + cevap anı) ve aynı bilgi notu, dört farklı temada
      </div>
      {Object.values(paletler).map((palet, i) => (
        <div key={palet.id} style={{ marginTop: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: '#F3F3F6',
                color: '#101014',
                display: 'grid',
                placeItems: 'center',
                fontSize: 32,
                fontWeight: 900,
                paddingTop: 3,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>{palet.ad}</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: '#A9A9B8' }}>{palet.aciklama}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[palet.arkaplan, palet.yuzey, palet.metin, palet.vurgu, palet.ikincil, palet.dogru].map((renk, k) => (
                <div key={k} style={{ width: 40, height: 40, borderRadius: '50%', background: renk, border: '3px solid rgba(255,255,255,0.25)' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start' }}>
            <Kucuk genislik={1080} yukseklik={1920} olcek={0.25}>
              <Freeze frame={sayacKaresi}>
                <SoruReels id={reels.id} palet={palet.id} />
              </Freeze>
            </Kucuk>
            <Kucuk genislik={1080} yukseklik={1920} olcek={0.25}>
              <Freeze frame={cevapKaresi}>
                <SoruReels id={reels.id} palet={palet.id} />
              </Freeze>
            </Kucuk>
            <Kucuk genislik={1080} yukseklik={1350} olcek={0.3333}>
              <BilgiPost id={gonderi.id} palet={palet.id} />
            </Kucuk>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
