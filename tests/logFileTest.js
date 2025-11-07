import fs from 'fs';
import { FileWatcher } from '../filewatcher.js';

const testDir = './test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

async function main(){
  const lf = `${testDir}/testlog.log`;
  if (fs.existsSync(lf)) fs.unlinkSync(lf);
  const watcher = new FileWatcher(testDir, { logFile: lf });
  watcher.start();
  await new Promise(r => setTimeout(r,50));
  fs.writeFileSync(`${testDir}/t5.txt`, 'log');
  await new Promise(r => setTimeout(r, 300));
  watcher.stop();
  if (!fs.existsSync(lf)) { console.error('Log file missing'); process.exit(1);} else { console.log('logFileTest OK'); }
}

main();
