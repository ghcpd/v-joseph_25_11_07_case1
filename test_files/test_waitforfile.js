import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './testdir_wait';
try { fs.rmSync(testDir, { recursive: true }); } catch(e) {}
fs.mkdirSync(testDir);

async function main() {
  const watcher = new FileWatcher(testDir, { });
  watcher.start();

  // kick off wait in background
  const p = watcher.waitForFile('created.txt', 2500);
  setTimeout(() => fs.writeFileSync(`${testDir}/created.txt`, 'hi'), 500);

  try {
    await p;
    console.log('PASS');
    process.exit(0);
  } catch (e) {
    console.error('FAIL', e);
    process.exit(1);
  } finally {
    watcher.stop();
  }
}

main();
