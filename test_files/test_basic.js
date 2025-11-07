import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './testdir_basic';
try { fs.rmSync(testDir, { recursive: true }); } catch(e) {}
fs.mkdirSync(testDir);

async function main() {
  const watcher = new FileWatcher(testDir, { recursive: true });
  watcher.start();

  const got = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
    watcher.on('change', (e) => {
      clearTimeout(timeout);
      resolve(e);
    });

    setTimeout(() => fs.writeFileSync(`${testDir}/a.txt`, 'hello'), 200);
  });

  watcher.stop();
  if (got && got.filename && got.filename.includes('a.txt')) {
    console.log('PASS');
    process.exit(0);
  } else {
    console.error('FAIL - wrong event', got);
    process.exit(2);
  }
}

main().catch((e)=>{console.error('FAIL', e); process.exit(1)});
