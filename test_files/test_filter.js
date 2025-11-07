import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './testdir_filter';
try { fs.rmSync(testDir, { recursive: true }); } catch(e) {}
fs.mkdirSync(testDir);

async function main() {
  const watcher = new FileWatcher(testDir, { filter: /\\.log$/ });
  watcher.start();

  const results = [];
  const timeout = setTimeout(() => { console.error('FAIL - timeout'); process.exit(1); }, 3000);

  watcher.on('change', (e) => {
    results.push(e.filename);
    clearTimeout(timeout);
    watcher.stop();
    if (results.length === 1 && results[0].endsWith('.log')) {
      console.log('PASS'); process.exit(0);
    } else {
      console.error('FAIL - filter did not work', results); process.exit(2);
    }
  });

  // create both files; only .log should trigger
  setTimeout(() => fs.writeFileSync(`${testDir}/a.txt`, 'x'), 100);
  setTimeout(() => fs.writeFileSync(`${testDir}/a.log`, 'x'), 200);
}

main();
