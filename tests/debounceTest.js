import fs from 'fs';
import assert from 'assert';
import { FileWatcher } from '../filewatcher.js';

const testDir = './test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function main(){
  const watcher = new FileWatcher(testDir);
  watcher.debounceEvents(150);
  let debouncedSeen=false;
  watcher.on('debouncedChange', e=> { if (e.filename==='t3.txt') debouncedSeen=true; });
  watcher.start();
  await new Promise(r => setTimeout(r, 50));
  fs.writeFileSync(`${testDir}/t3.txt`, '1');
  setTimeout(()=>fs.writeFileSync(`${testDir}/t3.txt`, '2'), 30);
  await new Promise(r => setTimeout(r,400));
  watcher.stop();
  console.log('debounceTest seen=', debouncedSeen);
  if (!debouncedSeen) process.exit(1);
}

main();
