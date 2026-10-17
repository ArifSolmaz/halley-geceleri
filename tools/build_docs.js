/* Compatibility entry point. Current scenario source: data/documentary.json. */
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const result=spawnSync(process.env.PYTHON||'python3',[path.join(__dirname,'build_documentary.py')],{stdio:'inherit'});
if(result.error) throw result.error;
process.exit(result.status ?? 1);
