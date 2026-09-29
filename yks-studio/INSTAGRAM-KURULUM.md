# Instagram'a otomatik paylaşım: kurulum

Paylaşım, Instagram'ın **resmî yayın API'si** ile yapılır. Şifren gerekmez, sadece "paylaşım izni" veren bir **token** kullanılır.
Token'ı sohbete **yazma**, aşağıdaki gibi ortam ayarlarına ekle.

## 1. Hesabı profesyonel yap (telefonda, 1 dk)

Instagram → Profil → ☰ → **Hesap türü ve araçlar** → **Profesyonel hesaba geç** → **Üretici**, kategori: **Eğitim**.

## 2. Meta geliştirici hesabı (bir kere)

1. Bilgisayardan <https://developers.facebook.com> adresine gir, Facebook hesabınla giriş yap.
2. **Başlayın** ile geliştirici olarak kaydol. Telefon doğrulaması isteyebilir.

## 3. Uygulama oluştur

Yapıldı: uygulaman **Enes Sosyal Yönetim** (Uygulama Kimliği `1095710539534908`), geliştirme modunda.
Sadece kendi hesabında paylaşım yapacağı için bu mod yeterli: uygulama incelemesi (App Review) ya da canlıya alma gerekmez.

Baştan kurman gerekirse:

1. **Uygulamalarım → Uygulama oluştur**
2. Kullanım durumu: **Instagram'da mesajları ve içeriği yönet** (Instagram API). Tür sorarsa **İşletme**.
3. İşletme portföyü sorarsa "şimdilik bağlama" seçeneğiyle devam et, ardından **Oluştur**.

## 4. Token al

1. Uygulama panelini aç: <https://developers.facebook.com/apps/1095710539534908/dashboard/>
2. Sol menüde **Instagram → API setup with Instagram business login** (Türkçe arayüzde "Instagram girişi ile API kurulumu").
   Menüde yoksa **Kullanım durumları → Instagram → Özelleştir** yolunu dene.
3. **Erişim tokenları oluştur** bölümünde **Hesap ekle**'ye bas, Instagram'a **@resesifnet** ile giriş yap ve izinleri onayla.
4. Hesabın yanındaki **Token oluştur**'a bas ve çıkan uzun metni kopyala. Bu token 60 gün geçerli, 19 günlük plan için yeterli.

Sol menüde Instagram hiç yoksa uygulamaya bu kullanım durumu eklenmemiş demektir: **Kullanım durumları → Kullanım durumu ekle →
Instagram'da mesajları ve içeriği yönet**. Eklenemiyorsa yeni bir **İşletme** türü uygulama oluştur.

"Hesap eklenemedi" ya da "test kullanıcısı değil" uyarısı çıkarsa:

1. Uygulama rolleri → **Roller** → **Kişi ekle** → **Instagram Test Kullanıcısı** → `resesifnet`
2. instagram.com → Ayarlar → **Uygulamalar ve web siteleri → Test kullanıcısı davetleri** → daveti kabul et
3. 4. adıma dönüp **Hesap ekle** ile tekrar dene.

## 5. Token'ı ve ağ iznini Claude ortamına ekle

Claude oturumunun başlığındaki **bulut ortamı menüsü → Edit**:

- **Token:** ad `IG_ACCESS_TOKEN`, değer kopyaladığın token. **API credentials** bölümü varsa oraya, yoksa ortam değişkeni olarak ekle.
- **Network access:** izinli alan adlarına `graph.instagram.com` ekle, ya da daha geniş bir erişim seviyesi seç
  (seviyeler: <https://code.claude.com/docs/en/claude-code-on-the-web>).

Bu ayarlar yeni açılan oturumlarda geçerli olur.

## 6. "Hazır" yaz

Ben yeni bir oturumda önce token'ı kontrol ederim (`npm run instagram -- kontrol`), sonra 1. günü paylaşırım.
Ardından her akşam **18:50'de (Türkiye saati)** sıradaki günü paylaşan bir rutin kurarım.
Plan `paylasim/plan.json` dosyasında, ne paylaşıldığı `paylasim/durum.json` dosyasında tutuluyor.

## Bilmen gerekenler

- **Hikâyeler otomatik paylaşılamaz:** anket, test ve kaydırıcı çıkartmaları API ile eklenemiyor. Hikâyeleri elle paylaşman gerekiyor, görseller `cikti/anketler/` klasöründe.
- **Videolar GitHub'dan alınır:** Instagram videoları depodaki herkese açık dosyalardan indirir (jsDelivr, yedek olarak raw.githubusercontent). Depo açık kalmalı.
- **Token süresi:** 60 gün sonra token'ı yenilemek gerekir. Aynı ekrandan yeni token alıp ortam değişkenini güncellemen yeterli.
