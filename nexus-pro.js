// Módulos independentes: sem dependências extras e sem alterar o fluxo de login.
'use strict';
const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function createState(){return {dialogs:[],walk:null};}
function safe(x){return String(x??'').slice(0,300);}
function recordDialog(state,d){
 const data=d?.body||d?.data||d||{};
 const id=safe(data?.objectID||data?.objectId||data?.ObjectID||data?.sourceID||'');
 const channel=Number(data?.chatChannel??data?.channel??data?.Channel);
 const raw=data?.buttons||data?.Buttons||data?.buttonLabels||[];
 const buttons=Array.isArray(raw)?raw.map(safe).slice(0,24):[];
 state.dialogs.unshift({id,channel:Number.isInteger(channel)?channel:null,message:safe(data?.message||data?.Message),buttons,at:new Date().toISOString()});
 state.dialogs=state.dialogs.slice(0,20);
}
function regionSnapshot(bot){
 const r=bot?.currentRegion||{};
 const out={name:safe(r.regionName||r.name||''),online:!!r.circuit,at:new Date().toISOString()};
 for(const [label,keys] of Object.entries({dwell:['dwell','Dwell'],prims:['prims','primitiveCount'],agents:['agentCount','avatarCount'],estate:['estateID']})){
  for(const k of keys){if(typeof r[k]==='number'&&Number.isFinite(r[k])){out[label]=r[k];break;}}
 }
 return out;
}
async function execute(bot,state,p,groups){
 const action=safe(p.action).toLowerCase();
 const g=bot?.clientCommands?.group||bot?.clientCommands?.groups;
 if(action==='snapshot')return {ok:true,region:regionSnapshot(bot),dialogs:state.dialogs,walk:state.walk,capabilities:{groupList:!!g&&['getCurrentGroups','getGroups','getGroupList','listGroups'].some(k=>typeof g[k]==='function'),hudReply:!!bot?.clientCommands?.comms?.respondToScriptDialog,autoWalk:!!bot?.clientCommands?.movement?.autoPilot}};
 if(action==='groups'){const message=await groups.listGroupsByAdminCommand();return {ok:!/(indispon[ií]vel|n[aã]o disponibiliza|n[aã]o retornou|sem comandos)/i.test(message),message};}
 if(action==='leavegroup'){
  if(!UUID.test(safe(p.groupID)))throw Error('UUID do grupo inválido');
  const message=await groups.leaveGroupByAdminCommand(p.groupID);return {ok:!/(indispon[ií]vel|n[aã]o disponibiliza|falha|nenhuma opera[cç][aã]o)/i.test(message),message};
 }
 if(action==='invite'){
  if(!UUID.test(safe(p.avatarID))||!UUID.test(safe(p.groupID)))throw Error('UUID de grupo ou avatar inválido');
  return {ok:true,message:await groups.sendGroupInviteFromConfig({avatarID:p.avatarID,groupID:p.groupID})};
 }
 if(action==='groupmessage'){
  if(!UUID.test(safe(p.groupID)))throw Error('UUID do grupo inválido');
  const message=await groups.sendGroupChatByAdmin(p.groupID,p.text);return {ok:!/(indispon[ií]vel|n[aã]o enviad|falha|sem suporte|n[aã]o disponibiliza)/i.test(message),message};
 }
 if(action==='notice')return {ok:false,error:'Envio de Group Notice ainda não implementado nesta biblioteca; nenhum notice foi enviado.'};
 if(action==='hud'){
  const index=Number(p.index);const d=state.dialogs[index];
  if(!Number.isInteger(index)||!d)throw Error('Diálogo não encontrado ou expirado');
  const button=safe(p.button);if(!d.buttons.includes(button))throw Error('Botão não pertence ao diálogo registrado');
  const comms=bot?.clientCommands?.comms;
  if(typeof comms?.respondToScriptDialog!=='function')throw Error('A biblioteca não oferece respondToScriptDialog; nenhum clique foi enviado');
  if(!UUID.test(d.id)||d.channel===null)throw Error('Diálogo sem objeto ou canal verificável');
  await comms.respondToScriptDialog(d.id,d.channel,button);
  return {ok:true,message:'Resposta ao HUD solicitada; confirme no Second Life'};
 }
 if(action==='walk'){
  const x=Number(p.x),y=Number(p.y),z=Number(p.z);
  if(![x,y,z].every(v=>Number.isFinite(v)&&v>=0&&v<=4096))throw Error('Coordenadas inválidas (0 a 4096)');
  const movement=bot?.clientCommands?.movement;
  if(typeof movement?.autoPilot!=='function')throw Error('Auto Walk indisponível nesta versão da biblioteca; nenhum movimento foi enviado');
  await movement.autoPilot(x,y,z);
  state.walk={x,y,z,requestedAt:new Date().toISOString()};
  return {ok:true,message:'Auto Walk solicitado; chegada ainda não confirmada'};
 }
 if(action==='stopwalk'){
  const movement=bot?.clientCommands?.movement;
  if(typeof movement?.cancelAutoPilot!=='function')throw Error('Cancelamento de Auto Walk indisponível na biblioteca');
  await movement.cancelAutoPilot();state.walk=null;
  return {ok:true,message:'Cancelamento solicitado'};
 }
 throw Error('Ação NEXUS PRO desconhecida');
}
module.exports={createState,recordDialog,execute};
