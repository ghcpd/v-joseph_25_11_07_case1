import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './testdir_once';
try { fs.rmSync(testDir, { recursive: true }); } catch(e) {}
fs.mkdirSync(testDir);

async function main() {
  const watcher = new FileWatcher(testDir, { });
  watcher.start();

  let warned = false;
  const origWarn = console.warn;
  console.warn = (m)=>{ if (m.includes('deprecated')) warned = true; origWarn(m); }

  const p = watcher.watchOnce('onefile.txt');
  setTimeout(()=>fs.writeFileSync(`${testDir}/onefile.txt`, 'x'), 500);
  await p;

  console.warn = origWarn;

  if (warned) {
    console.log('PASS'); process.exit(0);
  } else {
    console.error('FAIL - no deprecation warn'); process.exit(2);
  }
}

main().catch((e)=>{console.error('FAIL', e); process.exit(1)});
