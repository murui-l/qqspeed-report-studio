const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const {calculate}=require('../src/standings.cjs');
const root=path.resolve(__dirname,'..');
const fixture=()=>({id:'fixture',rounds:['示例'],teams:[{name:'A',players:[{name:'a',scores:[11]},{name:'b',scores:[7]}]},{name:'B',players:[{name:'c',scores:[9]},{name:'d',scores:[6]}]}]});

test('六场原始比赛重算出12人榜、1547总分、192场次和8.06总均分',()=>{
  const matches=fs.readdirSync(root+'/examples/matches').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(root+'/examples/matches/'+f,'utf8')));
  const aliases=JSON.parse(fs.readFileSync(root+'/examples/aliases.json','utf8'));
  const expected=JSON.parse(fs.readFileSync(root+'/examples/ranking.json','utf8'));
  const actual=calculate(matches,aliases,'杨胖杯');
  assert.equal(actual.rows.length,12);assert.equal(actual.overall,'8.06');
  assert.equal(actual.rows.reduce((n,p)=>n+p.total,0),1547);assert.equal(actual.rows.reduce((n,p)=>n+p.games,0),192);
  for(const row of actual.rows){const e=expected.rows.find(p=>p.name===row.name);for(const k of ['total','games','first_place_count','average','rate','rank'])assert.equal(row[k],e[k],row.name+' '+k);}
});
test('拒绝重复比赛，避免重复累计',()=>assert.throws(()=>calculate([fixture(),fixture()]),/重复/));
test('拒绝空白分数，不把缺项补成零',()=>{const f=fixture();f.teams[0].players[0].scores=[null];assert.throws(()=>calculate([f]),/分数/);});
test('校验已填个人总分及队伍总分',()=>{const a=fixture();a.teams[0].players[0].total=99;assert.throws(()=>calculate([a]),/总分/);const b=fixture();b.teams[0].total=99;assert.throws(()=>calculate([b]),/总分/);});
test('别名合并后同场重复选手会报错',()=>assert.throws(()=>calculate([fixture()],{b:'a'}),/重复/));
test('全员零分的局计入场次，但无人获得第一名',()=>{const f=fixture();f.teams.flatMap(t=>t.players).forEach(p=>p.scores=[0]);const r=calculate([f]);assert.ok(r.rows.every(p=>p.games===1&&p.first_place_count===0));});
test('同分时可以逐局覆盖真实第一名记录',()=>{const f=fixture();f.teams[0].players[1].scores=[11];f.teams[0].players[0].first_places=[false];f.teams[0].players[1].first_places=[true];const r=calculate([f]);assert.equal(r.rows.find(p=>p.name==='a').first_place_count,0);assert.equal(r.rows.find(p=>p.name==='b').first_place_count,1);});
