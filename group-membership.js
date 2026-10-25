'use strict';
// Cache de participacao: aceita apenas listas de grupos vindas de respostas do SL.
// Nunca interpreta membros de um grupo como grupos do proprio avatar.
const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const entries=new Map();
let lastSource='',lastUpdate=0;
function idString(v){if(!v)return '';try{return String(v.toString ? v.toString():v).trim();}catch{return '';}}
function normalize(item){
 if(!item||typeof item!=='object')return null;
 const id=idString(item.groupID??item.GroupID??item.groupId??item.id??item.ID??item.group_id);
 if(!UUID.test(id))return null;
 const name=String(item.groupName??item.GroupName??item.name??item.Name??'').trim().slice(0,120);
 return {id:id.toLowerCase(),name:name||'Grupo sem nome'};
}
function asArray(value){if(Array.isArray(value))return value;if(value instanceof Map)return [...value.values()];return null;}
function capture(payload,source){
 if(!payload||typeof payload!=='object')return 0;
 let list=asArray(payload);
 if(!list){for(const k of ['groups','Groups','groupData','GroupData','agentGroups','AgentGroups','groupList','GroupList']){list=asArray(payload[k]);if(list)break;}}
 if(!list)return 0;
 let found=0;
 for(const raw of list){const item=normalize(raw);if(item){entries.set(item.id,item);found++;}}
 if(found){lastSource=source;lastUpdate=Date.now();}
 return found;
}
function remove(id){entries.delete(idString(id).toLowerCase());}
function list(){return [...entries.values()].sort((a,b)=>a.name.localeCompare(b.name));}
function status(){return {count:entries.size,source:lastSource,updatedAt:lastUpdate};}
function clear(){entries.clear();lastSource='';lastUpdate=0;}
module.exports={capture,remove,list,status,clear};
