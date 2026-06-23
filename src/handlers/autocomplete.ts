import { Events, type AutocompleteInteraction } from 'discord.js';
import { client } from '../client.js';
import { prisma } from '../db.js';

export function registerAutocompleteHandler(): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (
      interaction.commandName !== 'login' &&
      interaction.commandName !== 'logout'
    ) {
      return;
    }

    await handleBotAutocomplete(interaction);
  });
}

async function handleBotAutocomplete(
  interaction: AutocompleteInteraction
): Promise<void> {
  const focused = interaction.options.getFocused();

  const bindings = await prisma.userBotBinding.findMany({
    where: { userId: interaction.user.id },
    include: { bot: true },
  });

  const choices = bindings
    .filter((binding) =>
      binding.bot.name.toLowerCase().includes(focused.toLowerCase())
    )
    .map((binding) => ({
      name: binding.bot.name,
      value: binding.bot.discordId,
    }))
    .slice(0, 25);

  await interaction.respond(choices);
}
