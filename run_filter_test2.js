import fs from 'fs';
import assert from 'assert';
import { FileWatcher } from './filewatcher.js';

const testDir='./test_logs'; if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
const uniqueId=Date.now();
const fnameOnly=`file_${uniqueId}.only`;
const fnameNope=`file_${uniqueId}.nope`;
let seen=false;
const w=new FileWatcher(testDir,{filter:/\.only$/i});
 w.on('change',e=>{ console.log('event',e); if (e.filename===fnameOnly) seen=true; });
 w.start();
 setTimeout(()=>{
   fs.writeFileSync(`${testDir}/${fnameOnly}`,'x');
   fs.writeFileSync(`${testDir}/${fnameNope}`,'x');
 },100);
 setTimeout(()=>{ w.stop(); console.log('stopped, seen=', seen); if (!seen) process.exit(1); else process.exit(0); }, 800);

