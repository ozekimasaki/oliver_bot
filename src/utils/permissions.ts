import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../db.js';

async function isGuildAdministrator(
  interaction: ChatInputCommandInteraction
): Promise<boolean> {
  if (!interaction.member) return false;
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  return member?.permissions.has(PermissionFlagsBits.Administrator) ?? false;
}

export async function isAdminOrMaster(
  interaction: ChatInputCommandInteraction
): Promise<boolean> {
  if (await isGuildAdministrator(interaction)) return true;

  const authorized = await prisma.authorizedSetupUser.findUnique({
    where: { userId: interaction.user.id },
  });

  return authorized?.isMaster === true;
}

export async function isSetupAuthorized(
  interaction: ChatInputCommandInteraction
): Promise<boolean> {
  if (await isGuildAdministrator(interaction)) return true;

  const authorized = await prisma.authorizedSetupUser.findUnique({
    where: { userId: interaction.user.id },
  });

  return authorized !== null;
}

export type BotOperationCheckResult =
  | { ok: true }
  | { ok: false; reason: 'bot-not-registered' | 'not-bound' };

export async function canOperateBot(
  userId: string,
  botDiscordId: string,
  isPrivileged = false
): Promise<BotOperationCheckResult> {
  const bot = await prisma.bot.findUnique({
    where: { discordId: botDiscordId },
  });

  if (!bot) {
    return { ok: false, reason: 'bot-not-registered' };
  }

  if (isPrivileged) {
    return { ok: true };
  }

  const binding = await prisma.userBotBinding.findUnique({
    where: {
      userId_botId: {
        userId,
        botId: bot.id,
      },
    },
  });

  if (!binding) {
    return { ok: false, reason: 'not-bound' };
  }

  return { ok: true };
}
