import { Events, MessageFlags, type Interaction } from 'discord.js';

import { client } from '../client.js';
import { handleHelp } from '../commands/help.js';
import { handleLogin } from '../commands/login.js';
import { handleLogout } from '../commands/logout.js';
import { handleSetup } from '../commands/setup.js';

export function registerInteractionCreateHandler(): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      switch (interaction.commandName) {
        case 'login':
          await handleLogin(interaction);
          break;
        case 'logout':
          await handleLogout(interaction);
          break;
        case 'setup':
          await handleSetup(interaction);
          break;
        case 'help':
          await handleHelp(interaction);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      const payload = {
        content: 'コマンドの実行中にエラーが発生しました。',
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  });
}
