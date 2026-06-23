import {
  Events,
  PermissionFlagsBits,
  type AutocompleteInteraction,
} from 'discord.js';
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

async function isAutocompletePrivileged(
  interaction: AutocompleteInteraction
): Promise<boolean> {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  const authorized = await prisma.authorizedSetupUser.findUnique({
    where: { userId: interaction.user.id },
  });

  return authorized?.isMaster === true;
}

async function handleBotAutocomplete(
  interaction: AutocompleteInteraction
): Promise<void> {
  const focused = interaction.options.getFocused();
  const isPrivileged = await isAutocompletePrivileged(interaction);

  let bots: { name: string; discordId: string }[];
  if (isPrivileged) {
    bots = (await prisma.bot.findMany()).map((bot) => ({
      name: bot.name,
      discordId: bot.discordId,
    }));
  } else {
    const bindings = await prisma.userBotBinding.findMany({
      where: { userId: interaction.user.id },
      include: { bot: true },
    });
    bots = bindings.map((binding) => ({
      name: binding.bot.name,
      discordId: binding.bot.discordId,
    }));
  }

  const choices = bots
    .filter((bot) => bot.name.toLowerCase().includes(focused.toLowerCase()))
    .map((bot) => ({
      name: bot.name,
      value: bot.discordId,
    }))
    .slice(0, 25);

  await interaction.respond(choices);
}
