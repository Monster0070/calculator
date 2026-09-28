import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

const POPPINS: Array<[string, string]> = [
  ['400', 'Regular'],
  ['500', 'Medium'],
  ['600', 'SemiBold'],
  ['700', 'Bold'],
  ['800', 'ExtraBold'],
  ['900', 'Black'],
];

// loadFont, font yüklenene kadar render'ı kendisi bekletir
for (const [weight, ad] of POPPINS) {
  loadFont({ family: 'Poppins', url: staticFile(`fonts/Poppins-${ad}.ttf`), weight });
}
loadFont({ family: 'Poppins', url: staticFile('fonts/Poppins-BoldItalic.ttf'), weight: '700', style: 'italic' });
loadFont({ family: 'Caveat', url: staticFile('fonts/Caveat-Bold.ttf'), weight: '700' });
