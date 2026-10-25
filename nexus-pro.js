// Módulos independentes: sem dependências extras e sem alterar o fluxo de login.
'use strict';
const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function createState(){return {dialogs:[],walk:null};}
function safe(x){return String(x??'').slice(0,300);}
function recordDialog(state,d){
 const id=safe(d?.objectID||d?.objectId||d?.ObjectID||d?.sourceID||'');
 const channel=Number(d?.chatChannel??d?.channel??d?.Channel);
 const raw=d?.buttons||d?.Buttons||d?.buttonLabels||[];
 const buttons=Array.isArray(raw)?raw.map(safe).slice(0,24):[];
 state.dialogs.unshift({id,channel:Number.isInteger(channel)?channel:null,message:safe(d?.message||d?.Message),buttons,at:new Date().toISOString()});
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
 if(action==='groups')return {ok:true,message:await groups.listGroupsByAdminCommand()};
 if(action==='leavegroup'){
  if(!UUID.test(safe(p.groupID)))throw Error('UUID do grupo inválido');
  return {ok:true,message:await groups.leaveGroupByAdminCommand(p.groupID)};
 }
 if(action==='invite'){
  if(!UUID.test(safe(p.avatarID))||!UUID.test(safe(p.groupID)))throw Error('UUID de grupo ou avatar inválido');
  return {ok:true,message:await groups.sendGroupInviteFromConfig({avatarID:p.avatarID,groupID:p.groupID})};
 }
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
