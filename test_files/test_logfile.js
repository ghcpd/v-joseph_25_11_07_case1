import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './testdir_log';
const logFile = './fw_logs.txt';
try { fs.rmSync(testDir, { recursive: true }); } catch(e) {}
try { fs.unlinkSync(logFile); } catch(e) {}
fs.mkdirSync(testDir);

async function main() {
  const watcher = new FileWatcher(testDir, { logFile });
  watcher.start();

  const res = await new Promise((resolve, reject) => {
    watcher.on('change', () => {
      setTimeout(() => resolve(true), 200);
    });
    setTimeout(() => fs.writeFileSync(`${testDir}/b.txt`, 'logme'), 100);
    setTimeout(() => reject(new Error('timed out waiting for log...')), 3000);
  }).catch((e)=>{throw e});

  watcher.stop();

  const logContents = fs.readFileSync(logFile, 'utf8');
  if (logContents.includes('Event:')) {
    console.log('PASS');
    process.exit(0);
  } else {
    console.error('FAIL - log missing', logContents)
    process.exit(2);
  }
}

main().catch((e)=>{console.error('FAIL', e); process.exit(1)});
