# Instagram'a otomatik paylaşım: kurulum

Paylaşım, Instagram'ın **resmî yayın API'si** ile yapılır. Şifren gerekmez, sadece "paylaşım izni" veren bir **token** kullanılır.
Token'ı sohbete **yazma**, aşağıdaki gibi ortam ayarlarına ekle.

## 1. Hesabı profesyonel yap (telefonda, 1 dk)

Instagram → Profil → ☰ → **Hesap türü ve araçlar** → **Profesyonel hesaba geç** → **Üretici**, kategori: **Eğitim**.

## 2. Meta geliştirici hesabı (bir kere)

1. Bilgisayardan <https://developers.facebook.com> adresine gir, Facebook hesabınla giriş yap.
2. **Başlayın** ile geliştirici olarak kaydol. Telefon doğrulaması isteyebilir.

## 3. Uygulama oluştur

1. **Uygulamalarım → Uygulama oluştur**
2. Ad: `resesifnet-paylasim`
3. Kullanım durumu: **Instagram'da mesajları ve içeriği yönet** (Instagram API)
4. İşletme portföyü sorarsa "şimdilik bağlama" seçeneğiyle devam et, ardından **Oluştur**.

## 4. Token al

1. Uygulama panelinde: **Kullanım durumları → Instagram API → Instagram girişi ile API kurulumu**
2. **Erişim tokenları oluştur** bölümünde **Hesap ekle**'ye bas, Instagram'a **@resesifnet** ile giriş yap ve izinleri onayla.
3. Hesabın yanındaki **Token oluştur**'a bas ve çıkan uzun metni kopyala. Bu token 60 gün geçerli, 19 günlük plan için yeterli.

"Hesap eklenemedi" ya da "test kullanıcısı değil" uyarısı çıkarsa:

1. Uygulama rolleri → **Roller** → **Kişi ekle** → **Instagram Test Kullanıcısı** → `resesifnet`
2. instagram.com → Ayarlar → **Uygulamalar ve web siteleri → Test kullanıcısı davetleri** → daveti kabul et
3. 4. adıma dönüp **Hesap ekle** ile tekrar dene.

## 5. Token'ı ve ağ iznini Claude ortamına ekle

Claude oturumunun başlığındaki **bulut ortamı menüsü → Edit**:

- **Ortam değişkeni:** `IG_ACCESS_TOKEN` = kopyaladığın token
- **Network access:** izinli alan adlarına `graph.instagram.com` ekle, ya da daha geniş bir erişim seviyesi seç.

Bu ayarlar yeni açılan oturumlarda geçerli olur.

## 6. "Hazır" yaz

Ben yeni bir oturumda önce token'ı kontrol ederim (`npm run instagram -- kontrol`), sonra 1. günü paylaşırım.
Ardından her akşam **18:50'de (Türkiye saati)** sıradaki günü paylaşan bir rutin kurarım.
Plan `paylasim/plan.json` dosyasında, ne paylaşıldığı `paylasim/durum.json` dosyasında tutuluyor.

## Bilmen gerekenler

- **Hikâyeler otomatik paylaşılamaz:** anket, test ve kaydırıcı çıkartmaları API ile eklenemiyor. Hikâyeleri elle paylaşman gerekiyor, görseller `cikti/anketler/` klasöründe.
- **Videolar GitHub'dan alınır:** Instagram videoları depodaki herkese açık dosyalardan indirir (jsDelivr, yedek olarak raw.githubusercontent). Depo açık kalmalı.
- **Token süresi:** 60 gün sonra token'ı yenilemek gerekir. Aynı ekrandan yeni token alıp ortam değişkenini güncellemen yeterli.
