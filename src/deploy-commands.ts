import { REST, Routes, type APIUser } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands/definitions.js';

const rest = new REST({ version: '10' }).setToken(config.discordToken);

async function deploy() {
  try {
    console.log('Started refreshing application (/) commands.');

    const currentUser = await rest.get(Routes.user('@me')) as APIUser;

    await rest.put(
      Routes.applicationGuildCommands(currentUser.id, config.guildId),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

(async () => {
  await deploy();
})();
