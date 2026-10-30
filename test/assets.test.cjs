const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const library=require('../src/library.cjs');
const {model}=require('../src/render-report.cjs');
const root=path.resolve(__dirname,'..');
test('全部65个图片原文件与来源记录和校验值对应',()=>{const crypto=require('crypto'),files=JSON.parse(fs.readFileSync(root+'/assets/manifest.json','utf8')),sources=JSON.parse(fs.readFileSync(root+'/assets/sources.json','utf8'));assert.equal(files.length,65);for(const m of files){const raw=fs.readFileSync(root+'/'+m.file);assert.equal(raw.length,m.bytes);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),m.sha256);assert.ok(sources.some(s=>s.file===m.file),m.file+' 缺少来源');}});
test('22张赛道原图、缩略图、来源和SHA-256均完整',()=>{const r=library.audit(library.DEFAULT_LIBRARY,library.loadCatalog());assert.equal(r.count,22);assert.deepEqual(r.errors,[]);assert.equal(r.ok,true);});
test('所有示例比赛均可解析队标、赛道、局序和比分',()=>{for(const file of fs.readdirSync(root+'/examples/matches').filter(f=>f.endsWith('.json'))){const c=JSON.parse(fs.readFileSync(root+'/examples/matches/'+file,'utf8'));const r=model(c,root+'/examples/matches');assert.equal(r.players.length,4);assert.equal(r.rounds.length,c.rounds.length);assert.ok(r.teams.every(t=>fs.existsSync(t.logo)));}});
test('不同方向的亚特兰蒂斯不能混用',()=>{const c=library.loadCatalog();assert.equal(library.findMap(c,'亚特兰蒂斯').name,'亚特兰蒂斯');assert.throws(()=>library.findMap(c,'反向亚特兰蒂斯'),/没有地图/);});
