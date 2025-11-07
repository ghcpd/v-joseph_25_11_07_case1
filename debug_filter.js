import fs from 'fs';
import { FileWatcher } from './filewatcher.js';
const d='./test_logs'; if (!fs.existsSync(d)) fs.mkdirSync(d);
const w=new FileWatcher(d,{filter:/\.only$/i});
w.on('change',e=>console.log('change event',e));
w.start();
setTimeout(()=>{fs.writeFileSync(`${d}/file.only`,'x');setTimeout(()=>fs.writeFileSync(`${d}/file.nope`,'x'),50)},100);
setTimeout(()=>{w.stop(); console.log('stopped');},1000);
