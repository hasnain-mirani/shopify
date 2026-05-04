import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const brain = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\278223c6-623f-40d0-8952-2281184c77b8';
const dest  = join(process.cwd(), 'public', 'category-icons');

mkdirSync(dest, { recursive: true });

const files = [
  ['cat_mobile_1777883856240.png',    'mobile.png'],
  ['cat_earbuds_1777883870971.png',   'earbuds.png'],
  ['cat_smartwatch_1777883883870.png','smartwatch.png'],
  ['cat_trimmer_1777883898365.png',   'trimmer.png'],
  ['cat_powerbank_1777883937569.png', 'powerbank.png'],
  ['cat_charger_1777883950944.png',   'charger.png'],
  ['cat_speaker_1777883966720.png',   'speaker.png'],
  ['cat_tablet_1777883978947.png',    'tablet.png'],
];

for (const [src, dst] of files) {
  copyFileSync(join(brain, src), join(dest, dst));
  console.log(`Copied ${dst}`);
}
console.log('All done!');
