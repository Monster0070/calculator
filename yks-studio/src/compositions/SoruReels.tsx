import { ArrowDown, Bookmark, Check, Lightbulb, MessageCircle, Send, UserPlus, X } from 'lucide-react';
import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  interpolateColors,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Arkaplan } from '../components/Arkaplan';
import { GeriSayimHalkasi, Konfeti } from '../components/Efektler';
import { Logo, UstBar } from '../components/Marka';
import { DersLogosu, dersBul } from '../dersler';
import { HARFLER, hesap, reelsBul, trBuyuk } from '../icerik';
import { duzMetin, kelimeBaslangiclari, kelimeler } from '../lib/metin';
import { FPS, GERI_SAYIM, type ReelsZaman, reelsZamanla, type SesParca } from '../lib/zaman';
import { ZenginMetin } from '../lib/zengin-metin';
import { FONT, PaletSaglayici, saydam, usePalet } from '../tema';
import type { ReelsIcerik } from '../tipler';

export type ReelsProps = { id: string; palet?: string };

const KENAR = 64;
const DURUM_Y = 430; // kanca / ÖSYM damgası / geri sayım / cevap damgasının merkezi
const ICERIK_Y = 596; // soru kartının üst kenarı
const ALT_SINIR = 1520; // Instagram'ın alt yazı alanına taşmamak için
const SINIRLA = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const GOLGE = (koyu: boolean) => (koyu ? '0 30px 60px rgba(0,0,0,0.35)' : '0 20px 40px rgba(29,42,91,0.12)');

// Kelime kaydırmayı taklit ederek satır sayısını tahmin eder (\n yeni paragraf)
const satirSayisi = (metin: string, punto: number, genislik: number) =>
  metin.split('\n').reduce((toplam, paragraf) => {
    let satir = 1;
    let dolu = 0;
    for (const k of kelimeler(paragraf)) {
      const w = k.length * punto * 0.57;
      if (dolu > 0 && dolu + punto * 0.28 + w > genislik) {
        satir++;
        dolu = w;
      } else {
        dolu += (dolu > 0 ? punto * 0.28 : 0) + w;
      }
    }
    return toplam + satir;
  }, 0);

type Duzen = 'yatay' | 'izgara' | 'satir';

// Seçenekler kısaysa yan yana (yatay/ızgara) dizilir; böylece uzun ÖSYM sorularına yer kalır
const yerlesimHesapla = (r: ReelsIcerik) => {
  const n = r.secenekler.length;
  const enUzun = Math.max(...r.secenekler.map((s) => duzMetin(s).length));
  const duzen: Duzen = enUzun <= 5 ? 'yatay' : enUzun <= 14 ? 'izgara' : 'satir';
  const satirAraligi = r.soru.includes('[[') ? 1.85 : 1.3;
  const secenekler =
    duzen === 'yatay'
      ? [{ satirH: 170, bosluk: 14 }]
      : duzen === 'izgara'
        ? [{ satirH: 96, bosluk: 16 }]
        : [
            { satirH: 98, bosluk: 18 },
            { satirH: 86, bosluk: 13 },
          ];
  const satirSayisiSecenek = duzen === 'yatay' ? 1 : duzen === 'izgara' ? Math.ceil(n / 2) : n;
  let en = { punto: 32, ...secenekler[secenekler.length - 1] };
  bul: for (const punto of [68, 64, 60, 56, 52, 48, 44, 40, 37, 34]) {
    for (const s of secenekler) {
      const kart = satirSayisi(r.soru, punto, 820) * punto * satirAraligi + 114;
      const secenekYuk = satirSayisiSecenek * s.satirH + (satirSayisiSecenek - 1) * s.bosluk;
      if (ICERIK_Y + kart + 40 + secenekYuk <= ALT_SINIR) {
        en = { punto, ...s };
        break bul;
      }
    }
  }
  const metinGenislik = duzen === 'satir' ? 720 : 280;
  const secenekPunto = duzen === 'yatay' ? 60 : Math.min(duzen === 'satir' ? 52 : 46, Math.floor(metinGenislik / (enUzun * 0.57)));
  const mevcut = ALT_SINIR - ICERIK_Y - 150 - 30 - 130 - (r.osym ? 50 : 0);
  const aciklamaPunto = r.aciklama
    ? ([64, 60, 56, 52, 48, 44, 40, 36].find((f) => satirSayisi(r.aciklama!, f, 840) * f * 1.4 <= mevcut) ?? 34)
    : 40;
  return { duzen, soruPunto: en.punto, satirAraligi, satirH: en.satirH, bosluk: en.bosluk, secenekPunto, aciklamaPunto };
};
type Yerlesim = ReturnType<typeof yerlesimHesapla>;

export const SoruReels: React.FC<ReelsProps> = ({ id, palet }) => {
  const r = reelsBul(id);
  const z = useMemo(() => reelsZamanla(r), [r]);
  return (
    <PaletSaglayici palet={palet}>
      <Sahne r={r} z={z} />
    </PaletSaglayici>
  );
};

const Sahne: React.FC<{ r: ReelsIcerik; z: ReelsZaman }> = ({ r, z }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  const y = useMemo(() => yerlesimHesapla(r), [r]);
  // Cevap anında tüm sahne hafifçe "zıplar"
  const zipla = kare >= z.cevapBas ? Math.sin(Math.min(1, (kare - z.cevapBas) / 10) * Math.PI) * 0.018 : 0;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: p.metin }}>
      <Arkaplan genislik={1080} yukseklik={1920} tohum={r.id} parilti={dersBul(r.ders)?.renk} />
      <AbsoluteFill style={{ transform: `scale(${1 + zipla})` }}>
        <UstBar rozet={`${r.sinav} · ${r.ders}`} ders={r.ders} giris={z.baslikSon - 4} />
        <Baslik r={r} z={z} />
        <Kanca r={r} z={z} />
        <GeriSayimHalkasi bas={z.sayacBas} adet={GERI_SAYIM} merkezY={DURUM_Y} />
        <CevapDamgasi r={r} z={z} />
        <SoruBlogu r={r} z={z} y={y} />
        <CozumBlogu r={r} z={z} y={y} />
      </AbsoluteFill>
      <Konfeti bas={z.cevapBas + 2} x={540} y={DURUM_Y} tohum={r.id} />
      <Kapanis z={z} />
      <Sesler r={r} z={z} fps={fps} />
    </AbsoluteFill>
  );
};

// Açılış kartı: ders logosu + "TYT" + ders adı (ders renginde)
const Baslik: React.FC<{ r: ReelsIcerik; z: ReelsZaman }> = ({ r, z }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  if (kare > z.baslikSon + 12) return null;
  const renk = dersBul(r.ders)?.renk ?? p.vurgu;
  const logo = spring({ frame: kare - 2, fps, config: { damping: 11, stiffness: 150, mass: 0.8 } });
  const yazi = spring({ frame: kare - 9, fps, config: { damping: 14, stiffness: 140 } });
  const cik = interpolate(kare, [z.baslikSon - 6, z.baslikSon + 10], [0, 1], SINIRLA);
  const dalga = interpolate(kare, [4, 36], [0, 1], SINIRLA);
  const ad = trBuyuk(r.ders);
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - cik,
        transform: `translateY(${-cik * 140}px) scale(${1 - cik * 0.3})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1100 * dalga,
          height: 1100 * dalga,
          borderRadius: '50%',
          border: `6px solid ${renk}`,
          opacity: 0.55 * (1 - dalga),
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, marginTop: -60 }}>
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -45}deg)` }}>
          <DersLogosu ders={r.ders} boyut={260} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            opacity: yazi,
            transform: `translateY(${(1 - yazi) * 60}px)`,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: '0.12em',
              padding: '12px 32px 6px',
              border: `6px solid ${p.metin}`,
              borderRadius: 22,
              lineHeight: 1.1,
            }}
          >
            {r.sinav}
          </span>
          <span
            style={{
              fontSize: Math.min(150, Math.floor(940 / (ad.length * 0.7))),
              fontWeight: 900,
              color: renk,
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {ad}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Başlıktan sonra: ÖSYM damgası ya da kanca cümlesi. Ortada belirir, sonra yukarı küçülerek yerleşir.
const Kanca: React.FC<{ r: ReelsIcerik; z: ReelsZaman }> = ({ r, z }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  const baslar = useMemo(() => kelimeBaslangiclari(r.kanca ?? ''), [r.kanca]);
  const bas = z.kanca?.bas ?? z.baslikSon + 8;
  const sure = z.kanca?.sure ?? 40;
  if (kare < bas - 4 || kare > z.sayacBas) return null;

  const gecis = spring({ frame: kare - (z.girisSon - 10), fps, config: { damping: 18, stiffness: 110 } });
  const cikis = interpolate(kare, [z.sayacBas - 18, z.sayacBas - 7], [0, 1], SINIRLA);
  const merkezY = interpolate(gecis, [0, 1], [880, DURUM_Y]) - cikis * 30;
  // ÖSYM sorularında kanca cümlesi damganın altında küçük durur
  const kancaBas = r.osym ? bas + 12 : bas;
  const kelimeStili = (i: number): React.CSSProperties => {
    const s = spring({
      frame: kare - (kancaBas + baslar[i] * sure * 0.7 - 4),
      fps,
      config: { damping: 12, mass: 0.5, stiffness: 170 },
    });
    return { opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 50}px) scale(${0.65 + 0.35 * s})` };
  };
  const isaretBas = kancaBas + sure * 0.7;
  const kancaMetni = r.kanca && (
    <ZenginMetin metin={r.kanca} kelimeStili={kelimeStili} isaretIlerleme={interpolate(kare, [isaretBas, isaretBas + 10], [0, 1], SINIRLA)} />
  );

  if (!r.osym) {
    if (!r.kanca) return null;
    return (
      <div
        style={{
          position: 'absolute',
          left: KENAR,
          right: KENAR,
          top: merkezY,
          transform: `translateY(-50%) scale(${interpolate(gecis, [0, 1], [1, 0.6])})`,
          opacity: 1 - cikis,
          textAlign: 'center',
          fontSize: 98,
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.01em',
        }}
      >
        {kancaMetni}
      </div>
    );
  }

  const carp = spring({ frame: kare - bas, fps, config: { damping: 12, stiffness: 210, mass: 0.9 } });
  const toz = interpolate(kare, [bas + 2, bas + 26], [0, 1], SINIRLA);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 540 - 450 * toz,
          top: 860 - 250 * toz,
          width: 900 * toz,
          height: 500 * toz,
          borderRadius: '50%',
          border: `5px solid ${p.vurgu}`,
          opacity: 0.45 * (1 - toz) * (1 - gecis),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: merkezY,
          display: 'flex',
          justifyContent: 'center',
          transform: 'translateY(-50%)',
          opacity: (1 - cikis) * Math.min(1, carp * 2),
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(carp, [0, 1], [2.4, 1]) * interpolate(gecis, [0, 1], [1, 0.66])}) rotate(-6deg)`,
            border: `12px double ${p.vurgu}`,
            borderRadius: 22,
            background: saydam(p.vurgu, 0.07),
            padding: '18px 48px 14px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.05, color: p.vurgu, letterSpacing: '0.03em' }}>ÖSYM SORDU</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '0.14em', color: p.metin, marginTop: 6 }}>
            {r.osym.yil} · {r.sinav} · {r.osym.soruNo}. SORU
          </div>
        </div>
      </div>
      {r.kanca && (
        <div
          style={{
            position: 'absolute',
            left: KENAR,
            right: KENAR,
            top: 1120,
            textAlign: 'center',
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.12,
            opacity: 1 - gecis,
            transform: `translateY(${gecis * 60}px)`,
          }}
        >
          {kancaMetni}
        </div>
      )}
    </>
  );
};

const SoruBlogu: React.FC<{ r: ReelsIcerik; z: ReelsZaman; y: Yerlesim }> = ({ r, z, y }) => {
  const kare = useCurrentFrame();
  // Çözüm başlarken soru ve seçenekler yukarı kayarak çekilir, yerine çözüm ekranı gelir
  const cik = z.aciklama ? interpolate(kare, [z.aciklamaBas, z.aciklamaBas + 12], [0, 1], SINIRLA) : 0;
  if (kare < z.soruBas - 2 || cik >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: ICERIK_Y,
        left: KENAR,
        right: KENAR,
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
        opacity: 1 - cik,
        transform: `translateY(${-cik * 90}px)`,
      }}
    >
      <SoruKarti r={r} z={z} y={y} />
      <Secenekler r={r} z={z} y={y} />
    </div>
  );
};

const SoruKarti: React.FC<{ r: ReelsIcerik; z: ReelsZaman; y: Yerlesim }> = ({ r, z, y }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  const baslar = useMemo(() => kelimeBaslangiclari(r.soru), [r.soru]);
  const s = spring({ frame: kare - z.soruBas, fps, config: { damping: 15, stiffness: 120 } });
  const d = dersBul(r.ders);

  // Karaoke: kelimeler soluk başlar, seslendirildikçe (okuma hızında) yanar
  const karaoke = (i: number): React.CSSProperties => {
    const t0 = z.soru.bas + baslar[i] * z.soru.sure * 0.95;
    const t1 = i + 1 < baslar.length ? z.soru.bas + baslar[i + 1] * z.soru.sure * 0.95 : z.soru.bas + z.soru.sure;
    const yan = interpolate(kare, [t0 - 3, t0 + 3], [0, 1], SINIRLA);
    return { opacity: 0.3 + 0.7 * yan, color: kare >= t0 && kare < t1 + 2 ? p.vurguYazi : undefined };
  };

  return (
    <div
      style={{
        position: 'relative',
        background: p.yuzey,
        border: `3px solid ${p.yuzeyKenar}`,
        borderRadius: 40,
        padding: '64px 44px 50px',
        boxShadow: GOLGE(p.koyu),
        opacity: Math.min(1, s * 1.4),
        transform: `translateY(${(1 - s) * 160}px) scale(${0.94 + 0.06 * s})`,
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
      {r.konu && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 26,
            fontWeight: 600,
            color: d?.renk ?? p.metinSoluk,
          }}
        >
          {d && <d.Ikon size={28} strokeWidth={2.6} />}
          {r.konu}
        </div>
      )}
      <div style={{ fontSize: y.soruPunto, fontWeight: 700, lineHeight: y.satirAraligi }}>
        <ZenginMetin metin={r.soru} kelimeStili={karaoke} />
      </div>
    </div>
  );
};

const Secenekler: React.FC<{ r: ReelsIcerik; z: ReelsZaman; y: Yerlesim }> = ({ r, z, y }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  const acilis = kare >= z.cevapBas ? spring({ frame: kare - z.cevapBas, fps, config: { damping: 13, stiffness: 160 } }) : 0;
  const nabiz =
    kare < z.cevapBas
      ? Math.max(0, ...Array.from({ length: GERI_SAYIM }, (_, k) => z.sayacBas + k * FPS).map((t) => (kare >= t ? Math.exp(-(kare - t) / 5) : 0)))
      : 0;
  const yatay = y.duzen === 'yatay';

  return (
    <div
      style={
        y.duzen === 'satir'
          ? { display: 'flex', flexDirection: 'column', gap: y.bosluk }
          : y.duzen === 'izgara'
            ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: y.bosluk }
            : { display: 'flex', gap: y.bosluk }
      }
    >
      {r.secenekler.map((secenek, i) => {
        const harf = HARFLER[i];
        const dogruMu = harf === r.dogru;
        const g = spring({ frame: kare - (z.secenekBas + i * z.secenekAralik), fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });
        const zipla = dogruMu && kare >= z.cevapBas ? Math.sin(Math.min(1, (kare - z.cevapBas) / 12) * Math.PI) * 0.06 : 0;
        const opaklik = Math.min(1, g * 1.3) * (dogruMu ? 1 : interpolate(kare, [z.cevapBas, z.cevapBas + 10], [1, 0.3], SINIRLA));
        const giris = yatay ? `translateY(${(1 - g) * 90}px)` : `translateX(${(1 - g) * 110}px)`;
        const d = dogruMu ? acilis : 0;
        const isik = d > 0.5;
        const harfBoyut = yatay ? 54 : y.satirH - 34;
        return (
          <div
            key={harf}
            style={{
              position: 'relative',
              flex: yatay ? 1 : undefined,
              height: y.satirH,
              borderRadius: 30,
              background: interpolateColors(d, [0, 1], [p.yuzey, p.dogru]),
              border: `3px solid ${interpolateColors(d, [0, 1], [p.yuzeyKenar, p.dogru])}`,
              color: interpolateColors(d, [0, 1], [p.metin, p.dogruMetin]),
              display: 'flex',
              flexDirection: yatay ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: yatay ? 'center' : 'flex-start',
              padding: yatay ? '10px 6px' : '0 22px 0 18px',
              gap: yatay ? 10 : 20,
              opacity: opaklik,
              transform: `${giris} scale(${1 + zipla})`,
              boxShadow: isik ? `0 0 0 8px ${saydam(p.dogru, 0.22)}, 0 18px 40px rgba(0,0,0,0.25)` : 'none',
              zIndex: dogruMu ? 2 : 1,
            }}
          >
            <div
              style={{
                width: harfBoyut,
                height: harfBoyut,
                borderRadius: '50%',
                border: `3px solid ${isik ? p.dogruMetin : p.vurguYazi}`,
                background: isik ? p.dogruMetin : 'transparent',
                color: isik ? p.dogru : p.vurguYazi,
                display: 'grid',
                placeItems: 'center',
                fontSize: yatay ? 28 : 32,
                fontWeight: 800,
                paddingTop: 3,
                flexShrink: 0,
                transform: `scale(${1 + 0.14 * nabiz})`,
              }}
            >
              {harf}
            </div>
            <div style={{ flex: yatay ? undefined : 1, fontSize: y.secenekPunto, fontWeight: yatay ? 800 : 600, whiteSpace: 'nowrap', lineHeight: 1.1 }}>
              <ZenginMetin metin={secenek} />
            </div>
            {acilis > 0 &&
              (dogruMu ? (
                <div
                  style={{
                    position: yatay ? 'absolute' : 'relative',
                    top: yatay ? -18 : undefined,
                    right: yatay ? -12 : undefined,
                    width: yatay ? 48 : 54,
                    height: yatay ? 48 : 54,
                    borderRadius: '50%',
                    background: p.dogruMetin,
                    color: p.dogru,
                    display: 'grid',
                    placeItems: 'center',
                    transform: `scale(${acilis})`,
                  }}
                >
                  <Check size={yatay ? 32 : 38} strokeWidth={3.6} />
                </div>
              ) : (
                <X
                  size={yatay ? 34 : 42}
                  strokeWidth={3.4}
                  color={p.yanlis}
                  style={{ opacity: acilis, position: yatay ? 'absolute' : 'relative', top: yatay ? 8 : undefined, right: yatay ? 8 : undefined }}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
};

// Çözüm ekranı: doğru seçenek + açıklama (ÖSYM sorularında kaynak bilgisiyle)
const CozumBlogu: React.FC<{ r: ReelsIcerik; z: ReelsZaman; y: Yerlesim }> = ({ r, z, y }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  const baslar = useMemo(() => kelimeBaslangiclari(r.aciklama ?? ''), [r.aciklama]);
  if (!z.aciklama || !r.aciklama || kare < z.aciklamaBas) return null;
  const ses = z.aciklama;
  const s1 = spring({ frame: kare - z.aciklamaBas - 4, fps, config: { damping: 15, stiffness: 130 } });
  const s2 = spring({ frame: kare - z.aciklamaBas - 11, fps, config: { damping: 16, stiffness: 120 } });
  const dogruSecenek = r.secenekler[HARFLER.indexOf(r.dogru)] ?? '';
  const secenekPunto = Math.min(64, Math.floor(640 / (Math.max(3, duzMetin(dogruSecenek).length) * 0.57)));
  const karaoke = (i: number): React.CSSProperties => {
    const t0 = ses.bas + baslar[i] * ses.sure * 0.95;
    return { opacity: 0.35 + 0.65 * interpolate(kare, [t0 - 3, t0 + 3], [0, 1], SINIRLA) };
  };
  return (
    <div style={{ position: 'absolute', top: ICERIK_Y, left: KENAR, right: KENAR, display: 'flex', flexDirection: 'column', gap: 30 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          background: p.dogru,
          color: p.dogruMetin,
          borderRadius: 36,
          padding: '24px 32px',
          boxShadow: `0 0 0 10px ${saydam(p.dogru, 0.2)}, 0 20px 50px rgba(0,0,0,0.3)`,
          opacity: s1,
          transform: `translateY(${(1 - s1) * 90}px) scale(${0.9 + 0.1 * s1})`,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: p.dogruMetin,
            color: p.dogru,
            display: 'grid',
            placeItems: 'center',
            fontSize: 54,
            fontWeight: 900,
            paddingTop: 5,
            flexShrink: 0,
          }}
        >
          {r.dogru}
        </div>
        <div style={{ flex: 1, fontSize: secenekPunto, fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          <ZenginMetin metin={dogruSecenek} />
        </div>
        <Check size={64} strokeWidth={3.4} />
      </div>
      <div
        style={{
          background: p.yuzey,
          border: `3px solid ${p.yuzeyKenar}`,
          borderRadius: 36,
          padding: '30px 40px 36px',
          boxShadow: GOLGE(p.koyu),
          opacity: s2,
          transform: `translateY(${(1 - s2) * 80}px)`,
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
            marginBottom: 14,
          }}
        >
          <Lightbulb size={38} strokeWidth={2.6} /> ÇÖZÜM
        </div>
        <div style={{ fontSize: y.aciklamaPunto, fontWeight: 600, lineHeight: 1.4 }}>
          <ZenginMetin metin={r.aciklama} kelimeStili={karaoke} />
        </div>
        {r.osym && (
          <div style={{ marginTop: 22, fontSize: 25, fontWeight: 600, color: p.metinSoluk }}>
            Kaynak: ÖSYM {r.osym.yil}-{r.sinav}, {r.osym.test} Testi, {r.osym.soruNo}. soru
          </div>
        )}
      </div>
    </div>
  );
};

const CevapDamgasi: React.FC<{ r: ReelsIcerik; z: ReelsZaman }> = ({ r, z }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  if (kare < z.cevapBas) return null;
  const s = spring({ frame: kare - z.cevapBas - 3, fps, config: { damping: 11, stiffness: 190, mass: 0.8 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: DURUM_Y,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(-50%) scale(${interpolate(s, [0, 1], [1.8, 1])}) rotate(${interpolate(s, [0, 1], [-14, -3])}deg)`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          background: p.dogru,
          color: p.dogruMetin,
          borderRadius: 999,
          padding: '18px 20px 18px 46px',
          boxShadow: `0 0 0 10px ${saydam(p.dogru, 0.22)}, 0 20px 50px rgba(0,0,0,0.3)`,
        }}
      >
        <span style={{ fontSize: 46, fontWeight: 900, letterSpacing: '0.05em', paddingTop: 4 }}>DOĞRU CEVAP</span>
        <span
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: p.dogruMetin,
            color: p.dogru,
            display: 'grid',
            placeItems: 'center',
            fontSize: 60,
            fontWeight: 900,
            paddingTop: 6,
          }}
        >
          {r.dogru}
        </span>
      </div>
    </div>
  );
};

// Kapanış: marka renginde daire açılır → yorum / kaydet / takip çağrısı
const Kapanis: React.FC<{ z: ReelsZaman }> = ({ z }) => {
  const kare = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalet();
  if (kare < z.kapanisBas) return null;
  const t = kare - z.kapanisBas;
  const ac = spring({ frame: t, fps, config: { damping: 20, stiffness: 80 } });
  const e = (gecikme: number) => spring({ frame: t - gecikme, fps, config: { damping: 12, stiffness: 150, mass: 0.7 } });
  const eylemler: Array<[typeof Bookmark, string]> = [
    [Bookmark, 'Kaydet'],
    [Send, 'Paylaş'],
    [UserPlus, 'Takip et'],
  ];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${ac * 1500}px at 50% 55%)`, background: p.vurgu, color: p.vurguMetin }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${saydam(p.vurguMetin, 0.08)} 3px, transparent 3.6px)`,
          backgroundSize: '46px 46px',
          backgroundPosition: `0 ${t * 0.8}px`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 420,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.04, transform: `scale(${e(4)})` }}>
          Doğru
          <br />
          bildin mi?
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 46, fontWeight: 700, opacity: e(10), marginTop: 10 }}>
          <MessageCircle size={54} strokeWidth={2.6} /> Cevabını yorumlara yaz
        </div>
        <ArrowDown size={72} strokeWidth={3} style={{ opacity: e(14), transform: `translateY(${Math.sin(t / 5) * 12}px)` }} />
        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
          {eylemler.map(([Ikon, ad], i) => (
            <div
              key={ad}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: p.vurguMetin,
                color: p.vurgu,
                padding: '20px 30px 18px',
                borderRadius: 999,
                fontSize: 34,
                fontWeight: 800,
                transform: `scale(${e(18 + i * 4)})`,
              }}
            >
              <Ikon size={38} strokeWidth={2.8} /> {ad}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1210,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          opacity: e(28),
          transform: `translateY(${(1 - e(28)) * 40}px)`,
        }}
      >
        <Logo boyut={150} ters />
        <div style={{ fontSize: 56, fontWeight: 800 }}>@{hesap.kullaniciAdi}</div>
      </div>
    </AbsoluteFill>
  );
};

const Efekt: React.FC<{ ad: string; kare: number; ses: number }> = ({ ad, kare, ses }) => (
  <Sequence from={kare} durationInFrames={FPS * 4} layout="none">
    <Html5Audio src={staticFile(`sfx/${ad}.wav`)} volume={ses} />
  </Sequence>
);

const Sesler: React.FC<{ r: ReelsIcerik; z: ReelsZaman; fps: number }> = ({ r, z, fps }) => {
  const konusmalar = hesap.seslendirme
    ? [...z.konusmalar, ...z.sayacSesleri].filter((k): k is SesParca => k !== null && k.dosya !== null)
    : [];
  // Fon müziği konuşma sırasında kısılır (ducking)
  const fonSes = (f: number) => {
    const ortam = interpolate(f, [0, 15, z.toplam - 25, z.toplam - 2], [0, 1, 1, 0], SINIRLA);
    const kis = z.konusmalar.reduce(
      (m, k) => Math.max(m, interpolate(f, [k.bas - 10, k.bas, k.bas + k.sure, k.bas + k.sure + 10], [0, 1, 1, 0], SINIRLA)),
      interpolate(f, [z.sayacBas - 5, z.sayacBas, z.cevapBas, z.cevapBas + 10], [0, 0.6, 0.6, 0], SINIRLA),
    );
    return ortam * (0.17 - 0.1 * kis);
  };
  return (
    <>
      {hesap.fonMuzigi && <Html5Audio src={staticFile('sfx/fon.wav')} loop volume={fonSes} />}
      {konusmalar.map((k) => (
        <Sequence key={`${k.dosya}-${k.bas}`} from={k.bas} durationInFrames={k.sure + fps} layout="none">
          <Html5Audio src={staticFile(k.dosya!)} />
        </Sequence>
      ))}
      <Efekt ad="whoosh" kare={0} ses={0.3} />
      {z.kanca && <Efekt ad={r.osym ? 'tik' : 'whoosh'} kare={z.kanca.bas} ses={r.osym ? 0.8 : 0.3} />}
      <Efekt ad="whoosh" kare={z.soruBas} ses={0.45} />
      {r.secenekler.map((_, i) => (
        <Efekt key={i} ad="pop" kare={z.secenekBas + i * z.secenekAralik} ses={0.3} />
      ))}
      <Efekt ad="gerilim" kare={z.sayacBas} ses={0.22} />
      {Array.from({ length: GERI_SAYIM }, (_, k) => (
        <Efekt key={`tik${k}`} ad="tik" kare={z.sayacBas + k * fps} ses={0.55} />
      ))}
      <Efekt ad="ding" kare={z.cevapBas} ses={0.5} />
      {z.aciklama && <Efekt ad="whoosh" kare={z.aciklamaBas} ses={0.28} />}
      <Efekt ad="whoosh" kare={z.kapanisBas} ses={0.5} />
    </>
  );
};
