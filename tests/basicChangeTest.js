import fs from 'fs';
import assert from 'assert';
import { FileWatcher } from '../filewatcher.js';

const testDir = './test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function main(){
  const watcher = new FileWatcher(testDir);
  let seen = false;
  watcher.on('change', e => { if (e.filename === 't1.txt') seen = true; });
  watcher.start();
  await new Promise(r => setTimeout(r,50));
  fs.writeFileSync(`${testDir}/t1.txt`, 'a');
  await new Promise(r => setTimeout(r, 300));
  watcher.stop();
  console.log('basicChangeTest seen=', seen);
  if (!seen) process.exit(1);
}

main();
