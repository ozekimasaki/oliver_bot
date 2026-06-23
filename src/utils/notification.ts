import { type Guild, type User } from 'discord.js';
import { prisma } from '../db.js';

export async function sendLoginNotification(
  guild: Guild,
  botDiscordId: string,
  operator: User
): Promise<void> {
  await sendNotification(guild, botDiscordId, `${operator.tag} がログインしました。`);
}

export async function sendLogoutNotification(
  guild: Guild,
  botDiscordId: string,
  operator: User
): Promise<void> {
  await sendNotification(guild, botDiscordId, `${operator.tag} がログアウトしました。`);
}

async function sendNotification(
  guild: Guild,
  botDiscordId: string,
  message: string
): Promise<void> {
  const bot = await prisma.bot.findUnique({
    where: { discordId: botDiscordId },
  });

  if (!bot?.notificationChannelId) return;

  const channel = guild.channels.cache.get(bot.notificationChannelId);
  if (!channel?.isTextBased()) return;

  await channel.send(message);
}
