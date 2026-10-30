const fs=require('fs');
const path=require('path');
const {argument}=require('./runtime.cjs');

function calculate(matches,aliases={},event='QQ飞车赛事') {
  const players=new Map(),seen=new Set();
  if(!Array.isArray(matches)||!matches.length)throw Error('至少需要一场比赛');
  for(const match of matches){
    if(!match.id||seen.has(match.id))throw Error('比赛 id 缺失或重复，不能重复累计');
    seen.add(match.id);
    if(!Array.isArray(match.rounds)||!match.rounds.length)throw Error('比赛缺少局序');
    if(!Array.isArray(match.teams)||match.teams.length!==2||match.teams.some(t=>!Array.isArray(t.players)||t.players.length!==2))throw Error('每场需要两队，每队两人');
    const people=match.teams.flatMap(t=>t.players),rounds=match.rounds.length,unique=new Set();
    for(const p of people){
      const name=aliases[p.name]||p.name;
      if(typeof name!=='string'||!name.trim()||unique.has(name))throw Error('选手姓名缺失，或别名合并后同场重复');
      unique.add(name);
      if(!Array.isArray(p.scores)||p.scores.length!==rounds||p.scores.some(v=>typeof v!=='number'||!Number.isFinite(v)))throw Error(name+' 分数缺项或格式错误');
      if(p.total!==undefined&&p.total!==p.scores.reduce((a,b)=>a+b,0))throw Error(name+' 总分不符');
      if(p.first_places!==undefined&&(!Array.isArray(p.first_places)||p.first_places.length!==rounds||p.first_places.some(v=>typeof v!=='boolean')))throw Error(name+' first_places 必须逐局填写布尔值');
    }
    for(const t of match.teams)if(t.total!==undefined&&t.total!==t.players.reduce((n,p)=>n+p.scores.reduce((a,b)=>a+b,0),0))throw Error(t.name+' 队伍总分不符');
    for(const p of people){
      const name=aliases[p.name]||p.name,row=players.get(name)||{name,total:0,games:0,first_place_count:0};
      row.total+=p.scores.reduce((a,b)=>a+b,0);row.games+=rounds;
      row.first_place_count+=p.scores.reduce((count,v,i)=>{const highest=Math.max(...people.map(q=>q.scores[i]));return count+(p.first_places?p.first_places[i]:(highest>0&&v===highest)?true:false);},0);
      players.set(name,row);
    }
  }
  const rows=[...players.values()].map(p=>({...p,average:Number((p.total/p.games).toFixed(2)),rate:Number((100*p.first_place_count/p.games).toFixed(2))})).sort((a,b)=>b.average-a.average);
  rows.forEach((p,i)=>p.rank=i&&p.average===rows[i-1].average?rows[i-1].rank:i+1);
  const total=rows.reduce((n,p)=>n+p.total,0),games=rows.reduce((n,p)=>n+p.games,0);
  return {event,rows,pending:[],overall:(total/games).toFixed(2),updated:matches.map(m=>m.date||'').sort().at(-1)||undefined,applied_matches:[...seen]};
}

function main(){
  const root=path.resolve(__dirname,'..'),folder=path.resolve(argument('--matches')||path.join(root,'examples/matches'));
  const aliasesFile=argument('--aliases')||path.join(root,'examples/aliases.json');
  const files=fs.readdirSync(folder).filter(f=>f.endsWith('.json')).sort();
  const matches=files.map(f=>{const d=JSON.parse(fs.readFileSync(path.join(folder,f),'utf8').replace(/^\uFEFF/,''));return {...d,id:d.id||path.basename(f,'.json')};});
  const result=calculate(matches,JSON.parse(fs.readFileSync(aliasesFile,'utf8')),argument('--event')||'QQ飞车赛事');
  const out=path.resolve(argument('--out')||path.join(root,'outputs/standings.json'));
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({matches:files.length,players:result.rows.length,overall:result.overall,output:out},null,2));
}
module.exports={calculate};
if(require.main===module){try{main()}catch(e){console.error(e.message);process.exitCode=1;}}
