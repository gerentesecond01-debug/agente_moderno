 'use strict';
// Inspecao somente-leitura; nao registra tokens, senhas, UUIDs de sessao nem conteudo de mensagens.
function methods(obj){if(!obj)return [];const result=new Set();let cur=obj;for(let i=0;i<3&&cur;i++,cur=Object.getPrototypeOf(cur)){for(const key of Object.getOwnPropertyNames(cur)){if(key==='constructor'||key.startsWith('_'))continue;try{if(typeof obj[key]==='function')result.add(key);}catch{}}}return [...result].sort();}
function names(obj,pattern){if(!obj)return [];try{return Object.keys(obj).filter(x=>pattern.test(x)).sort();}catch{return [];}}
function probe(bot){
 const commands=bot?.clientCommands, events=bot?.clientEvents, region=bot?.currentRegion, circuit=region?.circuit;
 const group=commands?.group||commands?.groups;
 const candidates=[commands?.agent,commands?.avatar,group,commands?.comms].filter(Boolean);
 return {
  library:(()=>{try{return require('@caspertech/node-metaverse/package.json').version;}catch{return 'nao identificado';}})(),
  online:!!region,
  commands:names(commands,/agent|avatar|group|comms|network|message/i),
  groupMethods:methods(group),
  agentMethods:methods(commands?.agent),
  avatarMethods:methods(commands?.avatar),
  relatedMethods:[...new Set(candidates.flatMap(methods))].filter(x=>/group|agentdata|avatar|profile|request/i.test(x)).slice(0,70),
  eventNames:names(events,/group|avatar|agent|packet|message|cap/i),
  regionKeys:names(region,/cap|circuit|event|message/i),
  circuitMethods:methods(circuit).filter(x=>/send|subscribe|message|packet|wait/i.test(x)),
  protocolExports:(()=>{try{return Object.keys(require('@caspertech/node-metaverse')).filter(x=>/Message|Packet|UUID|Agent/i.test(x)).slice(0,35);}catch{return [];}})()
 };
}
function report(bot,membership){const p=probe(bot),s=membership.status();return {diagnostic:'GROUP_PROTOCOL_V1',...p,groupsCached:s.count,cacheSource:s.source||'nenhuma',cacheUpdatedAt:s.updatedAt?new Date(s.updatedAt).toISOString():null,notes:'Diagnostico somente-leitura. Nao confirma consulta nem envia pacotes. Envie este resultado para adaptar a biblioteca.'};}
module.exports={report};
