import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './testdir_debounce';
try { fs.rmSync(testDir, { recursive: true }); } catch(e) {}
fs.mkdirSync(testDir);

async function main() {
  const watcher = new FileWatcher(testDir, { });
  watcher.debounceEvents(300);
  watcher.start();

  let seen = false;
  watcher.on('debouncedChange', (e) => { seen = true; watcher.stop(); console.log('PASS'); process.exit(0); });

  // Trigger multiple rapid changes
  setTimeout(() => fs.writeFileSync(`${testDir}/d1.txt`, 'x'), 50);
  setTimeout(() => fs.writeFileSync(`${testDir}/d2.txt`, 'x'), 100);
  setTimeout(() => fs.writeFileSync(`${testDir}/d3.txt`, 'x'), 120);

  setTimeout(() => { if (!seen) { console.error('FAIL - no debounced event'); process.exit(2); } }, 2000);
}

main();
