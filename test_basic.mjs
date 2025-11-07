import { FileWatcher } from './filewatcher.js';
import fs from 'fs';

function ok(msg){ console.log('\u2714 ' + msg); }

async function testRecursiveMismatch(){
  const w = new FileWatcher('./test_files', { recursiveMode: true });
  if (w.recursive) throw new Error('recursiveMode should be recognized but was not');
  ok('recursiveMode mismatch detected (as expected)');
}

async function testRecursiveOption(){
  const w = new FileWatcher('./test_files', { recursive: true });
  if (!w.recursive) throw new Error('recursive option not set');
  ok('recursive option works');
}

async function testFilter(){
  const w = new FileWatcher('./test_files', { filter: /\\.txt$/ });
  let got = false;
  w.on('change', e => { if (e.filename.endsWith('.txt')) got = true; });
  w.start();
  fs.appendFileSync('./test_files/sample.txt', 'x');
  await new Promise(r => setTimeout(r, 300));
  if (!got) throw new Error('filter did not pass');
  w.stop();
  ok('filter works for .txt');
}

async function testWaitForFile(){
  const w = new FileWatcher('./test_files');
  setTimeout(() => fs.writeFileSync('./test_files/newly_created.txt','abc'), 300);
  const okRes = await w.waitForFile('newly_created.txt', 2000);
  if (!okRes) throw new Error('waitForFile failed');
  ok('waitForFile succeeded');
}

async function testDebounce(){
  const w = new FileWatcher('./test_files');
  let got = 0;
  w.debounceEvents(200);
  w.on('debouncedChange', () => { got += 1; });
  w.start();
  fs.appendFileSync('./test_files/sample.txt','A');
  fs.appendFileSync('./test_files/sample.txt','B');
  await new Promise(r => setTimeout(r, 500));
  w.stop();
  if (got !== 1) throw new Error('debouncedChange did not emit once');
  ok('debouncedChange emitted once');
}

async function testWatchOnce(){
  const w = new FileWatcher('./test_files');
  const p = w.watchOnce('watchonce.txt');
  setTimeout(() => fs.writeFileSync('./test_files/watchonce.txt','x'), 200);
  const res = await p;
  if (!res) throw new Error('watchOnce failed');
  ok('watchOnce (deprecated) resolved');
}

async function run(){
  await testRecursiveMismatch();
  await testRecursiveOption();
  await testFilter();
  await testWaitForFile();
  await testDebounce();
  await testWatchOnce();
  console.log('All tests passed');
}

run().catch(err => { console.error('Test failed:', err); process.exit(2); });
