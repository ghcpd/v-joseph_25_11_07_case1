import fs from 'fs';
import { FileWatcher } from './filewatcher.js';

const testDir = './test_logs';
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function runTests() {
  console.log('Starting tests for FileWatcher Pro v1.2');

  // 1) Basic example from README
  const watcher1 = new FileWatcher(testDir, { recursiveMode: true });
  watcher1.on('change', (event) => {
    console.log('[basic example] File changed:', event.filename);
  });
  watcher1.start();

  fs.writeFileSync(`${testDir}/file1.txt`, 'hello');

  // Allow some time for the event
  await new Promise(r => setTimeout(r, 500));
  watcher1.stop();

  // 2) recursive option test
  const watcher2 = new FileWatcher(testDir, { recursive: true });
  watcher2.on('change', (event) => console.log('[recursive] change', event));
  watcher2.start();
  fs.writeFileSync(`${testDir}/file2.txt`, 'hello');
  await new Promise(r => setTimeout(r, 500));
  watcher2.stop();

  // 3) filter option
  const watcher3 = new FileWatcher(testDir, { filter: /\.log$/i });
  watcher3.on('change', e => console.log('[filter] saw', e.filename));
  watcher3.start();
  fs.writeFileSync(`${testDir}/file3.log`, 'log');
  fs.writeFileSync(`${testDir}/file3.txt`, 'txt');
  await new Promise(r => setTimeout(r, 500));
  watcher3.stop();

  // 4) logFile option
  const watcher4 = new FileWatcher(testDir, { logFile: `${testDir}/watcher.log` });
  watcher4.start();
  fs.writeFileSync(`${testDir}/file4.txt`, 'logfile');
  await new Promise(r => setTimeout(r, 500));
  watcher4.stop();
  console.log('Log file contents:\n', fs.readFileSync(`${testDir}/watcher.log`, 'utf8'));

  // 5) debounceEvents
  const watcher5 = new FileWatcher(testDir);
  watcher5.debounceEvents(200);
  watcher5.on('debouncedChange', e => console.log('[debounce] debouncedChange', e.filename));
  watcher5.start();
  fs.writeFileSync(`${testDir}/file5.txt`, '1');
  setTimeout(() => fs.writeFileSync(`${testDir}/file5.txt`, '2'), 50);
  setTimeout(() => fs.writeFileSync(`${testDir}/file5.txt`, '3'), 100);
  await new Promise(r => setTimeout(r, 500));
  watcher5.stop();

  // 6) waitForFile
  const watcher6 = new FileWatcher(testDir);
  const promise = watcher6.waitForFile('file6.txt', 2000).then(() => console.log('[waitForFile] found file6.txt'))
    .catch(err => console.log('[waitForFile] timeout or error', err.message));
  // create file after 500ms
  setTimeout(() => fs.writeFileSync(`${testDir}/file6.txt`, 'test'), 500);
  await promise;

  // 7) watchOnce (deprecated)
  const watcher7 = new FileWatcher(testDir);
  watcher7.watchOnce('file7.txt').then(() => console.log('[watchOnce] file7 detected')).catch(e => console.log('[watchOnce] err', e));
  setTimeout(() => fs.writeFileSync(`${testDir}/file7.txt`, 'test'), 300);
  await new Promise(r => setTimeout(r, 800));

  console.log('All tests done.');
}

runTests().catch(e => console.error(e));
