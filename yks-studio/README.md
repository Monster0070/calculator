# YKS İçerik Stüdyosu — @resesifnet

Instagram hesabı için YKS içeriklerini **kodla motion design** yaparak üreten stüdyo.
Videolar [Remotion](https://www.remotion.dev) ile, yani React bileşenleriyle çiziliyor. Her kare kodla hesaplanıyor.

| Tür | Biçim | Ne yapıyor? |
| --- | --- | --- |
| **Soru Reels'i** | 1080×1920 MP4, ~25 sn, müzik + efektler | Kanca cümlesi → soru (kelimeler okuma hızında parlar) → seçenekler → **3-2-1** geri sayım → doğru cevap + konfeti → çözüm → "yorumlara yaz / takip et". Seslendirmeyi sen ekliyorsun, metinler hazır. |
| **Reels kapağı** | 1080×1920 PNG | Profil ızgarasında görünen kapak. "Cevap videoda!" |
| **Bilgi notu gönderisi** | 1080×1350 PNG (4:5) | Formül kartı, yanlış→doğru tablosu, karşılaştırma, madde listesi |
| **Anket hikâyesi** | 1080×1920 PNG | Anket / test (quiz) / kaydırıcı çıkartması için boşluk bırakılmış hikâye + quizler için ertesi günün **cevap** hikâyesi |
| **Profil fotoğrafı** | 1080×1080 PNG | Geri sayım halkalı "YKS" logosu |

Renk teması: **Gece Mesaisi** (lacivert `#0A0F2C` + fosforlu sarı `#FFD23F` + mavi `#7C9CFF` + yeşil `#2EE59D`).
Karşılaştırma: `cikti/marka/palet-karsilastirma.png`.

## Hazır içerikler nerede?

Hepsi `cikti/` klasöründe:

- `cikti/reels/<id>.mp4`: video. `<id>-kapak.png`: kapak. `<id>.txt`: açıklama ve hashtag'ler. `<id>-seslendirme.txt`: zaman damgalı seslendirme metni.
- `cikti/SESLENDIRME-METINLERI.txt`: bütün reels'lerin seslendirme metinleri tek dosyada
- `cikti/gonderiler/<id>.png` ve `<id>.txt`
- `cikti/anketler/<id>.png`, quizlerde `<id>-cevap.png`. `<id>.txt` dosyasında çıkartma adım adım anlatılıyor.
- `cikti/marka/profil-foto.png`

Paylaşım takvimi ve hesap kurulumu: [HESAP-PLANI.md](HESAP-PLANI.md)

## Kurulum (bilgisayarda çalıştırmak istersen)

Node.js 18+ gerekiyor.

```bash
cd yks-studio
npm install
npm run studio        # Tarayıcıda Remotion Studio açılır, tüm videoları önizleyebilirsin
```

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run metin` | Zaman damgalı seslendirme metinlerini `cikti/` klasörüne yazar. `npm run render` reels'leri render edince bunu kendisi de çalıştırır. |
| `npm run ses` | `icerik/reels.json` içindeki metinleri Google sesiyle seslendirir (sadece değişenleri). `-- --hepsi` ile hepsini baştan üretir. Bu sesler videoya konmuyor, sadece zamanlamada kullanılıyor (aşağıya bak). |
| `npm run sfx` | Ses efektlerini ve fon müziğini yeniden sentezler (normalde gerekmez) |
| `npm run render` | Her şeyi `cikti/` klasörüne render eder |
| `npm run render -- reels` | Sadece reels'ler ve kapakları. Diğer gruplar: `gonderiler`, `anketler`, `marka`, `onizleme` |
| `npm run render -- reels-mat-uslu-sayilar` | Tek bir içerik |
| `npm run render -- onizleme --palet=mor` | Başka bir paletle deneme (çıktı `out/` klasörüne gider, `cikti/` bozulmaz) |
| `npm run kare -- reels-mat-uslu-sayilar 90 300` | Belirli karelerin PNG'si (`out/kare/`) |
| `npm run studio` | Remotion Studio (canlı önizleme) |

## Yeni içerik ekleme

Bütün içerik `icerik/` klasöründeki JSON dosyalarında. Kod değiştirmeye gerek yok.

### Soru reels'i: `icerik/reels.json`

```json
{
  "id": "mat-uslu-sayilar",
  "sinav": "TYT",
  "ders": "Matematik",
  "konu": "Üslü Sayılar",
  "kanca": "Bu soruda çoğu kişi ==yanılıyor!==",
  "soru": "2^{5} + 2^{5} işleminin sonucu **kaçtır?**",
  "soruSes": "İki üssü beş, artı iki üssü beş işleminin sonucu kaçtır?",
  "secenekler": ["4^{5}", "2^{10}", "4^{10}", "2^{6}", "2^{25}"],
  "dogru": "D",
  "cevapSes": "Doğru cevap D: iki üssü altı!",
  "aciklama": "2^{5} + 2^{5} = 2 · 2^{5} = **2^{6} = 64**",
  "aciklamaSes": "İki tane iki üssü beş, iki üssü altı eder. Yani altmış dört!",
  "etiketler": ["#tytmatematik", "#üslüsayılar"]
}
```

- `id`: yalnızca İngilizce küçük harf, rakam ve `-` kullan (dosya adı olur).
- `...Ses` alanları seslendirme metnidir. Yazılmazsa ekrandaki metin okunur. Formüllerde ("2 üssü 5") mutlaka yaz.
- Sonra `npm run ses` ve `npm run render -- reels-<id>` çalıştır. Render bitince `cikti/reels/<id>-seslendirme.txt` de güncellenir.

### Bilgi notu: `icerik/gonderiler.json`

`tip` üç türden biri olabilir:

- `formul`: `maddeler` içinde `["formül", "etiket"]` çiftleri
- `tablo`: `["sol", "sağ"]` çiftleri ve `basliklar`. `"ikonlar": true` verilirse yanlış→doğru tablosu olur, `"stil": "karsilastirma"` verilirse iki sütun eşit ağırlıkta gösterilir.
- `liste`: düz metin maddeler

`ipucu` alanı alttaki sarı kutuyu doldurur.

### Anket hikâyesi: `icerik/anketler.json`

`tip`: `anket`, `quiz` veya `kaydirici`. Quizlerde `dogru` (0'dan başlayan sıra) ve `aciklama` verilirse cevap hikâyesi de üretilir.

### Metin işaretleme dili

| Yazım | Görünüm |
| --- | --- |
| `**metin**` | sarı kalın vurgu |
| `==metin==` | fosforlu kalem işareti (sarı blok) |
| `~~metin~~` | üstü çizili |
| `2^{5}`, `H_{2}O` | üs ve alt simge |
| `→` | ok |
| `\n` | alt satıra geç |

## Ayarlar: `icerik/hesap.json`

```json
{
  "kullaniciAdi": "resesifnet",
  "slogan": "Her gün yeni soru, yeni not",
  "logoMetin": "YKS",
  "palet": "gece",
  "sesHizi": 1.1,
  "seslendirme": false,
  "fonMuzigi": true,
  "kapanisSes": "Doğru bildiysen yorumlara yaz, takip etmeyi unutma!",
  "genelEtiketler": ["#yks", "#yks2027", "#tyt"]
}
```

- `palet`: `gece` (seçilen), `defter`, `mor`, `nane`. Paletler `src/tema.tsx` içinde tanımlı.
- `seslendirme: false` (şu anki ayar) videoya yapay ses koymaz. Google'ın Türkçe sesi yeterince iyi bulunmadı, seslendirme sonradan ekleniyor.
- `sesHizi` değişirse `npm run ses -- --hepsi` çalıştır.
- `fonMuzigi: false` fon müziğini kapatır. Instagram'da trend bir ses eklemek istersen bunu kapatabilirsin.

## Nasıl çalışıyor?

- `src/compositions/SoruReels.tsx`: reels sahnesi. Zamanlama `src/lib/zaman.ts` içinde seslendirme sürelerinden hesaplanıyor. Soru uzarsa video da kendiliğinden uzuyor.
- `scripts/ses.mjs`: Google Çeviri'nin ücretsiz Türkçe sesiyle her satırı seslendiriyor, sessizlikleri kırpıyor, 1.1× hızlandırıyor ve süreleri `src/generated/ses.json` dosyasına yazıyor. `seslendirme: false` olduğunda bu sesler videoya girmiyor, sadece sahnelerin ne kadar süreceğini belirliyor (doğal konuşma hızı). Uç nokta resmî bir API değil, çalışmazsa süreler metin uzunluğundan tahmin edilir.
- **Kendi sesinle tam senkron:** Her satırı ayrı bir mp3 olarak kaydedip (`kanca`, `soru`, `cevap`, `aciklama`) `public/ses/<id>/` klasörüne koyarsan ve `ses.json` dosyasındaki süreleri güncellersen, video senin sesine göre yeniden zamanlanır. Karaoke vurgusu da senin konuşmana uyar. Sonra `seslendirme` ayarını `true` yap.
- `scripts/sfx.mjs`: tik, pop, geçiş sesi, zil, gerilim ve fon müziği kodla sentezleniyor, telif sorunu yok.
- Fontlar Poppins ve Caveat (SIL OFL lisanslı, `public/fonts`).
- Remotion bireysel kullanıcılar ve 3 kişiye kadar olan şirketler için ücretsiz.
