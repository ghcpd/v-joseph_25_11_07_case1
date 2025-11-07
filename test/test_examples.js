import fs from 'fs';
import path from 'path';
import { FileWatcher } from '../filewatcher.js';

const targetDir = path.resolve('./testdir');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

// Clean testdir
fs.readdirSync(targetDir).forEach(f => fs.unlinkSync(path.join(targetDir, f)));

async function main() {
  console.log('Starting tests...');

  // 1) Basic watch
  const watcher = new FileWatcher(targetDir, { recursiveMode: true });
  watcher.on('change', (event) => {
    console.log('[change]', event);
  });
  watcher.on('stopped', () => {
    console.log('[stopped] event received');
  });
  watcher.start();

  // Create a file
  const fname = 'test1.txt';
  fs.writeFileSync(path.join(targetDir, fname), 'hello');

  // Wait 500ms
  await new Promise(res => setTimeout(res, 500));

  // 2) Test filter option
  const watcher2 = new FileWatcher(targetDir, { recursive: true, filter: /.*\.log$/ });
  watcher2.on('change', (e) => console.log('[filter change]', e));
  watcher2.start();
  fs.writeFileSync(path.join(targetDir, 'file.log'), 'logdata');
  fs.writeFileSync(path.join(targetDir, 'file.txt'), 'txtdata');
  await new Promise(res => setTimeout(res, 500));

  // 3) Test logFile option
  const logFilePath = path.join(targetDir, 'fs.log');
  const watcher3 = new FileWatcher(targetDir, { recursive: true, logFile: logFilePath });
  watcher3.start();
  fs.writeFileSync(path.join(targetDir, 'file2.txt'), 'x');
  await new Promise(res => setTimeout(res, 500));
  console.log('Log file exists:', fs.existsSync(logFilePath));
  console.log('Log content sample:', fs.readFileSync(logFilePath, 'utf-8').split('\n').slice(-3).join('\n'));

  // 4) debounceEvents
  const watcher4 = new FileWatcher(targetDir, { recursive: true });
  watcher4.debounceEvents(200);
  watcher4.on('debouncedChange', (e) => console.log('[debounced]', e));
  watcher4.start();
  fs.writeFileSync(path.join(targetDir, 'd1.txt'), 'a');
  fs.writeFileSync(path.join(targetDir, 'd2.txt'), 'b');
  fs.writeFileSync(path.join(targetDir, 'd3.txt'), 'c');
  await new Promise(res => setTimeout(res, 1200));

  // 5) waitForFile
  const watch5 = new FileWatcher(targetDir, { recursive: true });
  watch5.start();
  setTimeout(() => fs.writeFileSync(path.join(targetDir, 'delayed.txt'), 'delayed'), 400);
  try {
    const r = await watch5.waitForFile('delayed.txt', 1000);
    console.log('waitForFile result', r);
  } catch (err) {
    console.error('waitForFile error', err.message);
  }

  // 6) watchOnce (deprecated)
  const watch6 = new FileWatcher(targetDir);
  watch6.start();
  setTimeout(() => fs.writeFileSync(path.join(targetDir, 'once.txt'), 'once'), 350);
  await watch6.watchOnce('once.txt');
  console.log('watchOnce resolved');

  // Stop all watchers
  watcher.stop(); watcher2.stop(); watcher3.stop(); watcher4.stop(); watch5.stop(); watch6.stop();
  console.log('All watchers stopped');
}

main().catch(console.error);
