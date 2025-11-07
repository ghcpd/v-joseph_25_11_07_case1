import fs from 'fs';
import assert from 'assert';
import { FileWatcher } from '../filewatcher.js';

const testDir = './test_logs';
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function basicChangeTest() {
  const watcher = new FileWatcher(testDir);
  let seen = false;
  watcher.on('change', e => { if (e.filename === 't1.txt') seen = true; });
  watcher.start();
  await new Promise(r => setTimeout(r, 50));
  fs.writeFileSync(`${testDir}/t1.txt`, 'a');
  await new Promise(r => setTimeout(r, 300));
  watcher.stop();
  assert.ok(seen, 'basic change must be seen');
}

async function filterTest() {
  const watcher = new FileWatcher(testDir, { filter: /\\.only$/i });
  const uniqueId = Date.now();
  const fnameOnly = `file_${uniqueId}.only`;
  const fnameNope = `file_${uniqueId}.nope`;
  let seen = false;
  watcher.on('change', e => { 
    console.log('[filterTest] event', e);
    if (e.filename === fnameOnly) seen = true; 
  });
  watcher.start();
  await new Promise(r => setTimeout(r, 50));
  console.log('[filterTest] watcher started, about to write files:', fnameOnly, fnameNope);
  try { if (fs.existsSync(`${testDir}/${fnameOnly}`)) fs.unlinkSync(`${testDir}/${fnameOnly}`); } catch(e){}
  try { if (fs.existsSync(`${testDir}/${fnameNope}`)) fs.unlinkSync(`${testDir}/${fnameNope}`); } catch(e){}
  setTimeout(() => {
    fs.writeFileSync(`${testDir}/${fnameOnly}`, '1');
    fs.writeFileSync(`${testDir}/${fnameNope}`, '1');
    console.log('[filterTest] writes done');
  }, 100);
  await new Promise(r => setTimeout(r, 400));
  watcher.stop();
  console.log('[filterTest] logs', watcher.logs);
  assert.ok(seen, 'filter should allow matching filename');
}

async function debounceTest() {
  const watcher = new FileWatcher(testDir);
  watcher.debounceEvents(150);
  let debouncedSeen = false;
  watcher.on('debouncedChange', e => { if (e.filename === 't3.txt') debouncedSeen = true; });
  watcher.start();
  await new Promise(r => setTimeout(r, 50));
  fs.writeFileSync(`${testDir}/t3.txt`, '1');
  setTimeout(() => fs.writeFileSync(`${testDir}/t3.txt`, '2'), 30);
  await new Promise(r => setTimeout(r, 400));
  watcher.stop();
  assert.ok(debouncedSeen, 'debouncedChange must be emitted');
}

async function waitForFileTest() {
  const watcher = new FileWatcher(testDir);
  const p = watcher.waitForFile('t4.txt', 2000);
  setTimeout(() => fs.writeFileSync(`${testDir}/t4.txt`, 'ok'), 300);
  await p;
}

async function logFileTest() {
  const lf = `${testDir}/testlog.log`;
  if (fs.existsSync(lf)) fs.unlinkSync(lf);
  const watcher = new FileWatcher(testDir, { logFile: lf });
  watcher.start();
  await new Promise(r => setTimeout(r, 50));
  fs.writeFileSync(`${testDir}/t5.txt`, 'log');
  await new Promise(r => setTimeout(r, 300));
  watcher.stop();
  assert.ok(fs.existsSync(lf), 'logFile should be created');
}

async function runAll() {
  const tests = [basicChangeTest, filterTest, debounceTest, waitForFileTest, logFileTest];
  for (const t of tests) {
    process.stdout.write(`Running ${t.name}... `);
    await t();
    console.log('OK');
    // give the OS a small pause to flush any events
    await new Promise(r => setTimeout(r, 500));
  }
}

runAll().then(() => { console.log('All tests passed'); process.exit(0); }).catch(e => { console.error('Test failed:', e); process.exit(1); });
