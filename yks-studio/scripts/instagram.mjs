// Instagram'a resmî yayın API'si ("Instagram API with Instagram Login") ile paylaşım. Bağımlılık gerektirmez.
// Token şifre değildir: ortam değişkeni IG_ACCESS_TOKEN içinde durur, sohbete ya da depoya yazılmaz.
// Medya, GitHub'daki (herkese açık) commit'ten URL ile verilir; dosyalar önce push edilmiş olmalı.
//
// Kullanım:
//   node scripts/instagram.mjs kontrol                  → token hangi hesaba ait, paylaşım kotası
//   node scripts/instagram.mjs durum                    → ne paylaşıldı, sırada ne var
//   node scripts/instagram.mjs yayinla --siradaki       → plandaki sıradaki gün (reels + varsa gönderi)
//   node scripts/instagram.mjs yayinla reels <id>       → tek içerik (tür: reels | gonderi)
//   ... --deneme                                        → API'ye gitmeden ne paylaşılacağını gösterir
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { jsonOku, proxyIleYenidenBaslat, yol } from './lib/araclar.mjs';

await proxyIleYenidenBaslat();

// Yeni bir Meta uygulaması, oluşturulduğu andaki sürümden eskisini çağıramaz (Eylül 2026'da en yenisi v26.0)
const API = `https://graph.instagram.com/${process.env.IG_API_SURUM ?? 'v26.0'}`;
const DEPO = process.env.IG_MEDYA_DEPOSU ?? 'Monster0070/calculator';
const DURUM = yol('paylasim', 'durum.json');

const argumanlar = process.argv.slice(2);
const deneme = argumanlar.includes('--deneme');
const [komut, ...kalan] = argumanlar.filter((a) => !a.startsWith('--'));

const hata = (mesaj) => {
  console.error(`✗ ${mesaj}`);
  process.exit(1);
};
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

const token = () => {
  const t = process.env.IG_ACCESS_TOKEN;
  if (!t) hata('IG_ACCESS_TOKEN ortam değişkeni yok. Token ortam ayarlarına eklenmeli (sohbete yazılmamalı).');
  return t;
};

const istek = async (yontem, yolu, parametreler = {}) => {
  const url = new URL(`${API}/${yolu}`);
  for (const [k, v] of Object.entries(parametreler)) if (v !== undefined) url.searchParams.set(k, String(v));
  let yanit;
  try {
    yanit = await fetch(url, { method: yontem, headers: { Authorization: `Bearer ${token()}` } });
  } catch (e) {
    hata(`graph.instagram.com'a ulaşılamadı (${e.cause?.code ?? e.message}). Ortamın ağ ayarlarında bu adrese izin verilmeli.`);
  }
  const govde = await yanit.json().catch(() => ({}));
  if (!yanit.ok || govde.error) {
    const e = govde.error ?? {};
    throw new Error(`API hatası ${yanit.status}: ${e.message ?? 'bilinmeyen'} (kod ${e.code ?? '-'}${e.error_subcode ? `/${e.error_subcode}` : ''})`);
  }
  return govde;
};

let hesapOnbellek = null;
const hesap = async () => (hesapOnbellek ??= await istek('GET', 'me', { fields: 'user_id,username,account_type,media_count' }));

// Dosyanın herkese açık adresleri. Commit'e sabitlenir; jsDelivr doğru MIME türü verir, raw.githubusercontent yedektir.
const commit = () => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: yol(), encoding: 'utf8' }).trim();
const depoYolu = (dosya) => `yks-studio/${dosya}`;
const adresler = (dosya, sha) => [
  `https://cdn.jsdelivr.net/gh/${DEPO}@${sha}/${depoYolu(dosya)}`,
  `https://raw.githubusercontent.com/${DEPO}/${sha}/${depoYolu(dosya)}`,
];

const erisilebilir = async (url) => {
  try {
    const y = await fetch(url, { method: 'HEAD' });
    return y.ok;
  } catch {
    return null; // bu ortamdan kontrol edilemiyor (ör. jsDelivr engelli); Instagram yine de indirebilir
  }
};

const icerik = (tur, id) => {
  const klasor = tur === 'reels' ? 'reels' : 'gonderiler';
  const aciklamaDosyasi = yol('cikti', klasor, `${id}.txt`);
  if (!existsSync(aciklamaDosyasi)) hata(`Açıklama bulunamadı: cikti/${klasor}/${id}.txt`);
  const medya = tur === 'reels' ? `cikti/reels/${id}.mp4` : `cikti/gonderiler/${id}.jpg`;
  if (!existsSync(yol(medya))) hata(`Medya bulunamadı: ${medya}`);
  return {
    tur,
    id,
    medya,
    kapak: tur === 'reels' && existsSync(yol('cikti', 'reels', `${id}-kapak.jpg`)) ? `cikti/reels/${id}-kapak.jpg` : null,
    aciklama: readFileSync(aciklamaDosyasi, 'utf8').trim(),
  };
};

// Kapsayıcı hazır olana kadar bekle (video işleme birkaç dakika sürebilir)
const hazirOlunca = async (kapsayici) => {
  for (let i = 0; i < 80; i++) {
    const { status_code: durum, status } = await istek('GET', kapsayici, { fields: 'status_code,status' });
    if (durum === 'FINISHED') return;
    if (durum === 'ERROR' || durum === 'EXPIRED') throw new Error(`Medya işlenemedi: ${status ?? durum}`);
    await bekle(6000);
  }
  throw new Error('Medya 8 dakikada hazır olmadı');
};

const paylas = async (ic) => {
  const sha = commit();
  const { user_id: igId, username } = await hesap();
  const medyaAdresleri = adresler(ic.medya, sha);
  const kapakAdresi = ic.kapak ? adresler(ic.kapak, sha)[1] : undefined;
  if ((await erisilebilir(medyaAdresleri[1])) === false) {
    hata(`${ic.medya} GitHub'da bu commit'te yok (${sha.slice(0, 7)}). Önce commit + push yapılmalı.`);
  }
  let sonHata;
  for (const url of ic.tur === 'reels' ? medyaAdresleri : [medyaAdresleri[1]]) {
    try {
      const parametre =
        ic.tur === 'reels'
          ? { media_type: 'REELS', video_url: url, caption: ic.aciklama, share_to_feed: true, cover_url: kapakAdresi }
          : { image_url: url, caption: ic.aciklama };
      const { id: kapsayici } = await istek('POST', `${igId}/media`, parametre);
      await hazirOlunca(kapsayici);
      const { id: medyaId } = await istek('POST', `${igId}/media_publish`, { creation_id: kapsayici });
      const { permalink } = await istek('GET', medyaId, { fields: 'permalink' }).catch(() => ({}));
      console.log(`✓ @${username} ${ic.tur} yayınlandı: ${ic.id} → ${permalink ?? medyaId}`);
      return { tur: ic.tur, id: ic.id, medyaId, permalink: permalink ?? null, tarih: new Date().toISOString() };
    } catch (e) {
      sonHata = e;
      console.warn(`… ${url.split('/')[2]} ile olmadı: ${e.message}`);
    }
  }
  throw sonHata;
};

const durumOku = () => (existsSync(DURUM) ? JSON.parse(readFileSync(DURUM, 'utf8')) : { yayinlanan: [] });
const durumYaz = (d) => writeFileSync(DURUM, `${JSON.stringify(d, null, 2)}\n`);
const yayinlandiMi = (d, tur, id) => d.yayinlanan.some((y) => y.tur === tur && y.id === id);

const siradakiler = () => {
  const d = durumOku();
  const plan = jsonOku('paylasim', 'plan.json');
  for (const gun of plan.gunler) {
    const bekleyen = [
      ['reels', gun.reels],
      ['gonderi', gun.gonderi],
    ].filter(([tur, id]) => id && !yayinlandiMi(d, tur, id));
    if (bekleyen.length) return { gun: gun.gun, isler: bekleyen };
  }
  return null;
};

const yayinla = async (isler) => {
  for (const [tur, id] of isler) {
    const ic = icerik(tur, id);
    if (deneme) {
      console.log(`[deneme] ${tur} ${id}\n  medya: ${adresler(ic.medya, commit())[0]}\n  kapak: ${ic.kapak ?? '-'}\n  açıklama: ${ic.aciklama.split('\n')[0]} …`);
      continue;
    }
    const kayit = await paylas(ic);
    const d = durumOku();
    d.yayinlanan.push(kayit);
    durumYaz(d);
    await bekle(20000);
  }
};

switch (komut) {
  case 'kontrol': {
    const h = await hesap();
    const kota = await istek('GET', `${h.user_id}/content_publishing_limit`, { fields: 'quota_usage,config' }).catch(() => null);
    console.log(`✓ Token geçerli: @${h.username} (${h.account_type}), ${h.media_count} gönderi`);
    if (kota?.data?.[0]) console.log(`  24 saatlik paylaşım kotası: ${kota.data[0].quota_usage}/${kota.data[0].config?.quota_total ?? '?'}`);
    break;
  }
  case 'durum': {
    const d = durumOku();
    console.log(`Yayınlanan: ${d.yayinlanan.length}`);
    for (const y of d.yayinlanan) console.log(`  ${y.tarih.slice(0, 10)} ${y.tur} ${y.id} ${y.permalink ?? ''}`);
    const s = siradakiler();
    console.log(s ? `Sırada: ${s.gun}. gün → ${s.isler.map(([t, i]) => `${t} ${i}`).join(', ')}` : 'Plan bitti.');
    break;
  }
  case 'yayinla': {
    if (argumanlar.includes('--siradaki')) {
      const s = siradakiler();
      if (!s) {
        console.log('Plan bitti, paylaşılacak içerik kalmadı.');
        break;
      }
      console.log(`${s.gun}. gün paylaşılıyor…`);
      await yayinla(s.isler);
    } else {
      const [tur, id] = kalan;
      if (!['reels', 'gonderi'].includes(tur) || !id) hata('Kullanım: yayinla reels <id> | yayinla gonderi <id> | yayinla --siradaki');
      await yayinla([[tur, id]]);
    }
    break;
  }
  default:
    hata('Komut: kontrol | durum | yayinla');
}
