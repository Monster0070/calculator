# @resesifnet: Hesap Planı

## 1. Hesabı kurma

Instagram hesabını sen açacaksın. Adımlar:

1. Instagram'da yeni hesap aç, kullanıcı adı: **resesifnet**
2. **Profil fotoğrafı:** `cikti/marka/profil-foto.png`. Instagram daire olarak kırpar, logo tam oturur.
3. **Ad alanı** (aramada çıkar, 30 karakter): `YKS Soru & Not | TYT AYT`
4. **Biyografi** (150 karakter):

   ```
   ⏱️ YKS'ye 3-2-1!
   🎬 Her gün 3 saniyelik soru
   📚 Kaydetmelik kısa notlar
   🎯 TYT • AYT | Soru isteğin DM'e
   ```

5. Ayarlar'dan **profesyonel hesaba** geç (Üretici, kategori: Eğitim). Böylece hangi içeriğin tuttuğunu istatistiklerden görebilirsin.
6. **Öne çıkanlar** için dört başlık aç: `Anketler`, `Cevaplar`, `Formüller`, `Notlar`. Kapakları: `cikti/marka/onecikan-*.png`

## 2. İlk hafta takvimi

Her gün bir **reels** ve aynı konuda bir **bilgi notu** paylaşılıyor. Reels'i izleyen notu kaydediyor, notu gören de reels'e gidiyor. Akşam saatleri (19:00–22:00) öğrencilerin en aktif olduğu zaman gibi görünüyor, ama en doğru saati 1–2 haftalık istatistiklerine bakarak bul.

| Gün | Reels (`cikti/reels/`) | Gönderi (`cikti/gonderiler/`) | Hikâye (`cikti/anketler/`) |
| --- | --- | --- | --- |
| 1 | `mat-uslu-sayilar` | `mat-uslu-kurallar` | `zor-ders` (anket) |
| 2 | `tr-yazim-kurallari` | `tr-yanlis-yazilanlar` | `hicbir-quiz` (quiz) |
| 3 | `fiz-serbest-dusme` | `fiz-hareket-formulleri` | `hicbir-quiz-cevap` |
| 4 | `kim-fiziksel-degisim` | `kim-asit-baz` | `uslu-quiz` (quiz) |
| 5 | `bio-hucre` | `bio-organeller` | `uslu-quiz-cevap` |
| 6 | `tar-gokturkler` | `tar-ilk-turk-devletleri` | `calisma-saati` (kaydırıcı) |
| 7 | `cog-yagis` | `tr-paragraf-taktikleri` | — |

### "ÖSYM SORDU" serisi (12 reels)

2024, 2025 ve 2026 TYT kitapçıklarından seçildi. Hepsi şekilsiz sorular, cevapları ÖSYM'nin cevap anahtarıyla kontrol edildi. İlk haftadan sonra her gün bir tane paylaşabilirsin. İki seriyi dönüşümlü paylaşmak da iyi olur: bir gün klasik soru, ertesi gün ÖSYM sorusu.

| Gün | Reels (`cikti/reels/`) | Ders |
| --- | --- | --- |
| 8 | `osym-2025-fiz-2` | TYT Fizik (ortalama hız tuzağı) |
| 9 | `osym-2025-mat-12` | TYT Matematik (asalız sayı) |
| 10 | `osym-2026-bio-17` | TYT Biyoloji |
| 11 | `osym-2025-tr-12` | TYT Türkçe (yazım) |
| 12 | `osym-2024-kim-13` | TYT Kimya |
| 13 | `osym-2024-tar-2` | TYT Tarih |
| 14 | `osym-2026-cog-9` | TYT Coğrafya |
| 15 | `osym-2026-mat-40` | TYT Matematik |
| 16 | `osym-2024-bio-16` | TYT Biyoloji |
| 17 | `osym-2026-fiz-7` | TYT Fizik |
| 18 | `osym-2024-kim-9` | TYT Kimya |
| 19 | `osym-2025-mat-32` | TYT Matematik |

**Telif notu:** ÖSYM kitapçıklarında "soruların her hakkı ÖSYM'ye aittir, yazılı izin olmadan yayımlanamaz" yazıyor. Çıkmış soru paylaşan hesaplar çok yaygın ve eğitim amaçlı, kaynak gösterilerek yapılan paylaşımlara genelde bir işlem yapılmıyor. Yine de risk tamamen yok değil. Videolarda ve açıklamalarda kaynak (yıl, test, soru no) her zaman yazıyor, bunu kaldırma. Soruları çözümsüz, toplu hâlde (kitapçık gibi) paylaşma.

## 3. Paylaşırken

**Reels**

1. **Seslendirme:** `cikti/reels/<id>-seslendirme.txt` dosyasını aç. Her metnin yanında hangi saniyede başlayıp en geç hangi saniyede bitmesi gerektiği yazıyor. İki yol var:
   - Instagram'ın Reels düzenleyicisinde **Seslendirme** ile kendi sesini doğrudan kaydet.
   - CapCut'ta kaydet ya da metinden sese çevir, kaydı başlangıç saniyesine sürükle, videoyu dışa aktar.

   Kendi sesin genelde yapay sesten daha samimi durur ve etkileşimi artırır.
2. `<id>.mp4` dosyasını (seslendirilmiş hâlini) yükle.
3. Kapak olarak "Film rulosundan" `<id>-kapak.png` görselini seç. Profil ızgarası düzenli görünür.
4. Açıklamayı `<id>.txt` dosyasından kopyala. Hashtag'ler 5 tane, hepsi hazır.
5. Videoda sakin bir fon müziği zaten var. Instagram'dan trend bir ses eklersen sesini düşük tut ki seslendirme duyulsun.

**Bilgi notu:** `<id>.png` + `<id>.txt`. Bu gönderiler kaydedilmek için tasarlandı. İlk üçünü profilde sabitleyebilirsin.

**Hikâye:** `<id>.txt` dosyasında çıkartmanın nasıl ekleneceği adım adım yazıyor. Görseldeki el yazısı ok, çıkartmanın konacağı boş alanı gösteriyor. Quiz'in cevap hikâyesini ertesi gün paylaş, sonra `Cevaplar` öne çıkanına ekle.

## 4. Etkileşim

- Reels'in sonunda "cevabını yorumlara yaz" çağrısı var. İlk saatte gelen yorumlara cevap vermek erişimi artırır.
- Cevabı yorumlarda erken verme. Videoyu sonuna kadar izletmek istiyoruz.
- Anket sonuçlarını yeni içerik fikri olarak kullan: en zor bulunan dersten daha çok soru üret.

## 5. Sonraki içerikler

Yeni içerik için Claude'a şöyle yazman yeterli:

> "resesifnet için 5 yeni soru reels'i üret: AYT Matematik türev, TYT Türkçe anlam bilgisi, …"
> "Gece Mesaisi temasıyla 3 yeni bilgi notu: Osmanlı kuruluş dönemi, mol kavramı, hücre bölünmesi"

Fikir havuzu:

- **TYT:** problemler (yaş, işçi, yüzde), sayı basamakları, paragrafta anlatım biçimleri, ses olayları, kuvvet ve hareket, mol kavramı, ekosistem, Osmanlı kuruluş dönemi, harita bilgisi
- **AYT:** limit–türev, logaritma, trigonometri, edebi akımlar, divan edebiyatı nazım biçimleri, organik kimya, elektrik, genetik (**resesif** gen soruları hesabın adına da uyar 😉)
- **Seri fikirleri:** "Bu formülü bilmeyen kalmasın", "YKS'de çıkmış tuzak", "Haftanın sorusu (anket)", "Pazar tekrarı" (haftanın notlarını topluca paylaşan bir reels)
