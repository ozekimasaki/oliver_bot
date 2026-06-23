import { client } from './client.js';
import { config } from './config.js';
import { registerInteractionCreateHandler } from './handlers/interactionCreate.js';
import { registerGuildMemberUpdateHandler } from './handlers/guildMemberUpdate.js';
import { registerReadyHandler } from './handlers/ready.js';

registerReadyHandler();
registerInteractionCreateHandler();
registerGuildMemberUpdateHandler();

client.login(config.discordToken);
