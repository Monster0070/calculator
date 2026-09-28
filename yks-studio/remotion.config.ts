import { Config } from '@remotion/cli/config';
import { existsSync, readdirSync } from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Bulut ortamında Playwright'ın getirdiği tarayıcıyı kullan; yoksa Remotion kendi tarayıcısını indirir.
const PW_KOK = '/opt/pw-browsers';
if (!process.env.REMOTION_BROWSER_EXECUTABLE && existsSync(PW_KOK)) {
  const klasor = readdirSync(PW_KOK).find((d) => d.startsWith('chromium_headless_shell-'));
  if (klasor) {
    Config.setBrowserExecutable(`${PW_KOK}/${klasor}/chrome-linux/headless_shell`);
  }
}
