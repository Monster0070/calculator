// İşaretleme dilinden bağımsız, saf metin yardımcıları (Node betikleri de kullanır)

// İşaretlemesiz düz metin (süre tahmini ve kelime sayımı için)
export const duzMetin = (s: string) =>
  s
    .replace(/\*\*|==|~~/g, '')
    .replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1')
    .replace(/[\^_]\{([^}]*)\}/g, '$1');

const UST_SIMGE: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', m: 'ᵐ', n: 'ⁿ', '·': '˙',
};
const ALT_SIMGE: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

// Instagram açıklaması için: üs/alt simgeleri Unicode karakterlere çevirir
export const unicodeMetin = (s: string) =>
  s
    .replace(/\*\*|==|~~/g, '')
    .replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1')
    .replace(/\^\{([^}]*)\}/g, (_, x: string) => [...x].map((c) => UST_SIMGE[c] ?? c).join(''))
    .replace(/_\{([^}]*)\}/g, (_, x: string) => [...x].map((c) => ALT_SIMGE[c] ?? c).join(''));

export const kelimeler = (s: string) => duzMetin(s).split(/[ \t\n]+/).filter(Boolean);

// Her kelimenin, seslendirme içinde başladığı an (0-1 arası oran; harf sayısına göre)
export const kelimeBaslangiclari = (s: string) => {
  const uzunluklar = kelimeler(s).map((k) => k.length + 2);
  const toplam = uzunluklar.reduce((a, b) => a + b, 0) || 1;
  let birikim = 0;
  return uzunluklar.map((u) => {
    const bas = birikim / toplam;
    birikim += u;
    return bas;
  });
};
