import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { FileWatcher } from "../filewatcher.js";

const logsDir = path.join(__dirname, "..", "test_files", "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testReadmeExample() {
  console.log('Test 1: README example option name mismatch');
  const watcher = new FileWatcher(logsDir, { recursiveMode: true });
  // README uses `recursiveMode`, implementation uses `recursive`.
  if (watcher.recursive === true) {
    console.log('  - recursive honored');
  } else {
    console.log('  - recursive NOT honored (implementation uses `recursive` option)');
  }

  let changed = false;
  watcher.on('change', (ev) => {
    console.log('  - change event received ->', ev.filename);
    changed = true;
  });
  watcher.start();

  const testFile = path.join(logsDir, 'readme_test.txt');
  fs.writeFileSync(testFile, 'hello');
  await sleep(300);
  watcher.stop();

  assert.ok(changed, 'Expected change event but none received');
}

async function testDebounce() {
  console.log('Test 2: debounceEvents and debouncedChange event');
  const watcher = new FileWatcher(logsDir, { recursive: true });
  let debounced = false;
  watcher.debounceEvents(200);
  watcher.on('debouncedChange', (ev) => {
    console.log('  - debouncedChange ->', ev.filename);
    debounced = true;
  });
  watcher.start();

  const f1 = path.join(logsDir, 'deb1.txt');
  const f2 = path.join(logsDir, 'deb2.txt');
  fs.writeFileSync(f1, '1');
  fs.writeFileSync(f2, '2');
  await sleep(500);
  watcher.stop();

  assert.ok(debounced, 'Expected debouncedChange event but none received');
}

async function testWaitForFile() {
  console.log('Test 3: waitForFile resolves when file appears');
  const watcher = new FileWatcher(logsDir, { recursive: true });
  const filename = 'wait_for_me.txt';
  const p = watcher.waitForFile(filename, 3000).then(() => true);
  // create file after short delay
  setTimeout(() => fs.writeFileSync(path.join(logsDir, filename), 'ok'), 300);
  const res = await p;
  assert.ok(res === true, 'waitForFile did not resolve as expected');
}

async function testFilterAndLogFile() {
  console.log('Test 4: filter and logFile undocumented features');
  const logfile = path.join(__dirname, '..', 'test_files', 'watcher.log');
  if (fs.existsSync(logfile)) fs.unlinkSync(logfile);
  const watcher = new FileWatcher(logsDir, { filter: /only_this\.txt$/, logFile: logfile });
  let seen = false;
  watcher.on('change', (ev) => {
    seen = true;
  });
  watcher.start();
  fs.writeFileSync(path.join(logsDir, 'ignored.txt'), 'x');
  fs.writeFileSync(path.join(logsDir, 'only_this.txt'), 'y');
  await sleep(300);
  watcher.stop();
  assert.ok(seen, 'filter did not allow expected file');
  const logContents = fs.readFileSync(logfile, 'utf8');
  assert.ok(/Event:/.test(logContents), 'logFile did not get entries');
}

async function runAll() {
  try {
    await testReadmeExample();
    await testDebounce();
    await testWaitForFile();
    await testFilterAndLogFile();
    console.log('\nAll tests passed');
    process.exit(0);
  } catch (err) {
    console.error('\nTest failure:', err && err.message || err);
    process.exit(1);
  }
}

runAll();
