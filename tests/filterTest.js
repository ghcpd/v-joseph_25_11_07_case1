import fs from 'fs';
import assert from 'assert';
import { FileWatcher } from '../filewatcher.js';

const testDir = './test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function main(){
  const uniqueId = Date.now();
  const fnameOnly = `file_${uniqueId}.only`;
  const fnameNope = `file_${uniqueId}.nope`;
  let seen=false;
  const watcher = new FileWatcher(testDir,{filter:/\.only$/i});
  watcher.on('change',e => { console.log('event',e); if (e.filename===fnameOnly) seen=true; });
  watcher.start();
  await new Promise(r => setTimeout(r, 50));
  if (fs.existsSync(`${testDir}/${fnameOnly}`)) fs.unlinkSync(`${testDir}/${fnameOnly}`);
  if (fs.existsSync(`${testDir}/${fnameNope}`)) fs.unlinkSync(`${testDir}/${fnameNope}`);
  setTimeout(()=>{ fs.writeFileSync(`${testDir}/${fnameOnly}`, '1'); fs.writeFileSync(`${testDir}/${fnameNope}`, '1'); console.log('writes done'); }, 100);
  await new Promise(r => setTimeout(r, 500));
  watcher.stop();
  console.log('filterTest seen=', seen);
  if (!seen) process.exit(1);
}

main();
