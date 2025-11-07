import fs from 'fs';
import assert from 'assert';
import { FileWatcher } from './filewatcher.js';

const testDir='./test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
let seen=false;
const w=new FileWatcher(testDir,{filter:/\.only$/i});
 w.on('change',e=>{ console.log('event',e); if (e.filename==='file.only') seen=true; });
 w.start();
 fs.writeFileSync(`${testDir}/file.only`,'x');
 fs.writeFileSync(`${testDir}/file.nope`,'x');
 setTimeout(()=>{ w.stop(); console.log('stopped, seen=', seen); if (!seen) process.exit(1); else process.exit(0); }, 400);

