'use strict';
// Diagnóstico local: não conecta ao Second Life, não envia pacotes nem expõe senhas.
const paths = [
 '@caspertech/node-metaverse/package.json',
 '@caspertech/node-metaverse/dist/lib/classes/messages/ImprovedInstantMessage.js',
 '@caspertech/node-metaverse/dist/lib/classes/Packet.js',
 '@caspertech/node-metaverse/dist/lib/commands/CommsCommands.js',
 '@caspertech/node-metaverse/dist/lib/enums/InstantMessageDialog.js'
];
for (const p of paths) {
 try {
  const file=require.resolve(p);
  console.log('[PROTOCOLO] '+p+' -> '+file);
  const mod=require(p);
  console.log('[EXPORTS] '+Object.keys(mod).join(', '));
  if (p.endsWith('package.json')) console.log('[VERSAO] '+mod.version);
  if (p.endsWith('InstantMessageDialog.js')) console.log('[ACEITE] '+JSON.stringify({GroupInvitation:mod.InstantMessageDialog?.GroupInvitation,GroupInvitationAccept:mod.InstantMessageDialog?.GroupInvitationAccept}));
 } catch(err) { console.log('[INDISPONIVEL] '+p+': '+err.message); }
}
