// Betiklerin ortak yardımcıları: proje yolları, Remotion'un ffmpeg'i ve tarayıcı yolu.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

export const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const yol = (...parcalar) => path.join(KOK, ...parcalar);
export const jsonOku = (...parcalar) => JSON.parse(readFileSync(yol(...parcalar), 'utf8'));

// Remotion, işletim sistemine uygun ffmpeg'i bu paketlerden biriyle kurar.
const COMPOSITOR_PAKETLERI = [
  '@remotion/compositor-linux-x64-gnu',
  '@remotion/compositor-linux-x64-musl',
  '@remotion/compositor-linux-arm64-gnu',
  '@remotion/compositor-linux-arm64-musl',
  '@remotion/compositor-darwin-arm64',
  '@remotion/compositor-darwin-x64',
  '@remotion/compositor-win32-x64-msvc',
];

let ffmpegOnbellek = null;
const ffmpegBul = () => {
  if (ffmpegOnbellek) return ffmpegOnbellek;
  for (const paket of COMPOSITOR_PAKETLERI) {
    try {
      const { dir } = require(paket);
      const exe = path.join(dir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
      if (existsSync(exe)) {
        ffmpegOnbellek = { exe, dir };
        return ffmpegOnbellek;
      }
    } catch {
      // bu platformun paketi değil
    }
  }
  throw new Error('ffmpeg bulunamadı. Önce "npm install" çalıştır.');
};

export const ffmpeg = (argumanlar, girdi) =>
  new Promise((resolve, reject) => {
    const { exe, dir } = ffmpegBul();
    const ekle = (degisken) => [dir, process.env[degisken]].filter(Boolean).join(path.delimiter);
    const env = {
      ...process.env,
      LD_LIBRARY_PATH: ekle('LD_LIBRARY_PATH'),
      DYLD_LIBRARY_PATH: ekle('DYLD_LIBRARY_PATH'),
      PATH: ekle('PATH'),
    };
    const p = spawn(exe, ['-hide_banner', '-loglevel', 'error', ...argumanlar], { env });
    const cikti = [];
    let hata = '';
    p.stdout.on('data', (c) => cikti.push(c));
    p.stderr.on('data', (c) => (hata += c));
    p.on('error', reject);
    p.on('close', (kod) =>
      kod === 0 ? resolve(Buffer.concat(cikti)) : reject(new Error(`ffmpeg hata kodu ${kod}: ${hata}`)),
    );
    p.stdin.on('error', () => {});
    p.stdin.end(girdi ?? undefined);
  });

// Bulut ortamında Playwright'ın getirdiği tarayıcı; yoksa null (Remotion kendisi indirir).
export const tarayiciBul = () => {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) return process.env.REMOTION_BROWSER_EXECUTABLE;
  const kok = '/opt/pw-browsers';
  if (!existsSync(kok)) return null;
  const klasor = readdirSync(kok).find((d) => d.startsWith('chromium_headless_shell-'));
  const exe = klasor && path.join(kok, klasor, 'chrome-linux', 'headless_shell');
  return exe && existsSync(exe) ? exe : null;
};

// Node'un fetch'i HTTPS_PROXY'yi ancak NODE_USE_ENV_PROXY=1 ile kullanır; gerekiyorsa betiği yeniden başlat.
export const proxyIleYenidenBaslat = async () => {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy || process.env.NODE_USE_ENV_PROXY) return;
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' },
  });
  process.exit(r.status ?? 1);
};

// src/ altındaki bir TypeScript modülünü (JSON içerikleriyle birlikte) Node'da kullanmak için derleyip yükler
export const tsYukle = async (dosya) => {
  const { build } = await import('esbuild');
  const cikti = yol('out', '.derleme', `${path.basename(dosya).replace(/\.tsx?$/, '')}.mjs`);
  await build({ entryPoints: [yol(dosya)], bundle: true, platform: 'node', format: 'esm', outfile: cikti, logLevel: 'error' });
  return import(`${pathToFileURL(cikti).href}?t=${Date.now()}`);
};
