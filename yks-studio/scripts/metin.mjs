// Her reels için zaman damgalı seslendirme metnini yazar (kendi sesini eklemek için).
// Kullanım: npm run metin → cikti/reels/<id>-seslendirme.txt ve cikti/SESLENDIRME-METINLERI.txt
import { mkdirSync, writeFileSync } from 'node:fs';
import { jsonOku, tsYukle, yol } from './lib/araclar.mjs';

const { tumSeslendirmeler } = await tsYukle('src/lib/seslendirme.ts');
const hesap = jsonOku('icerik', 'hesap.json');
const metinler = tumSeslendirmeler();

mkdirSync(yol('cikti', 'reels'), { recursive: true });
for (const { id, metin } of metinler) writeFileSync(yol('cikti', 'reels', `${id}-seslendirme.txt`), `${metin}\n`);

const giris = [
  `SESLENDİRME METİNLERİ | @${hesap.kullaniciAdi}`,
  '',
  'Videolarda yapay ses yok; fon müziği, efektler ve 3-2-1 tik sesleri var.',
  'Her metni köşeli parantezdeki aralıkta söyle: ilk saniyede başla, ikinci saniyeden önce bitir.',
  'Örnek (CapCut): videoyu ekle → Ses → Kayıt ya da Metinden sese → sesi başlangıç saniyesine sürükle.',
  '',
  '='.repeat(60),
  '',
];
writeFileSync(yol('cikti', 'SESLENDIRME-METINLERI.txt'), `${giris.join('\n')}${metinler.map((m) => m.metin).join(`\n${'='.repeat(60)}\n\n`)}\n`);
console.log(`✓ ${metinler.length} reels için seslendirme metni yazıldı → cikti/SESLENDIRME-METINLERI.txt`);
