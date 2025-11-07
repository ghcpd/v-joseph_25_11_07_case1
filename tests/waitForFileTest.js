import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function main(){
  const watcher = new FileWatcher(testDir);
  const p = watcher.waitForFile('t4.txt', 2000);
  setTimeout(()=>fs.writeFileSync(`${testDir}/t4.txt`, 'ok'), 300);
  await p;
  console.log('waitForFileTest OK');
}

main();
