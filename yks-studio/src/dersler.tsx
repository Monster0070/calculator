import { Atom, BookOpenText, Brain, Dna, Earth, Feather, FlaskConical, Landmark, type LucideIcon, MoonStar, Pi } from 'lucide-react';
import React from 'react';
import { saydam } from './tema';

// Her dersin kendi rengi ve logosu (ikon). Yeni ders eklemek için buraya bir satır yeter.
export type Ders = { renk: string; Ikon: LucideIcon };

export const DERSLER: Record<string, Ders> = {
  Matematik: { renk: '#7B93FF', Ikon: Pi },
  Türkçe: { renk: '#FF6B7A', Ikon: BookOpenText },
  Edebiyat: { renk: '#FF8A65', Ikon: Feather },
  Fizik: { renk: '#B892FF', Ikon: Atom },
  Kimya: { renk: '#2DD4BF', Ikon: FlaskConical },
  Biyoloji: { renk: '#8BE05B', Ikon: Dna },
  Tarih: { renk: '#FF9F45', Ikon: Landmark },
  Coğrafya: { renk: '#38CFF5', Ikon: Earth },
  Felsefe: { renk: '#FF7AC0', Ikon: Brain },
  'Din Kültürü': { renk: '#E9C78C', Ikon: MoonStar },
};

// Ders renklerinin üstündeki yazı/ikon rengi (hepsi açık renk olduğu için koyu lacivert)
export const DERS_YAZI = '#0A0F2C';

export const dersBul = (ad?: string): Ders | null => (ad ? (DERSLER[ad] ?? null) : null);

// Dersin logosu: ders renginde, hafif eğik yuvarlak kare içinde ikon
export const DersLogosu: React.FC<{ ders: string; boyut: number; aci?: number }> = ({ ders, boyut, aci = -6 }) => {
  const d = dersBul(ders);
  if (!d) return null;
  const { Ikon } = d;
  return (
    <div
      style={{
        width: boyut,
        height: boyut,
        borderRadius: boyut * 0.3,
        background: d.renk,
        color: DERS_YAZI,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        boxShadow: `0 0 0 ${boyut * 0.07}px ${saydam(d.renk, 0.22)}`,
        transform: `rotate(${aci}deg)`,
      }}
    >
      <Ikon size={boyut * 0.58} strokeWidth={2.4} />
    </div>
  );
};
