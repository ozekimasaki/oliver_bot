import { type Guild, type User } from 'discord.js';
import { prisma } from '../db.js';

export async function sendLoginNotification(
  guild: Guild,
  operator: User
): Promise<void> {
  await sendNotification(guild, `${operator.tag} がログインしました。`);
}

export async function sendLogoutNotification(
  guild: Guild,
  operator: User
): Promise<void> {
  await sendNotification(guild, `${operator.tag} がログアウトしました。`);
}

async function sendNotification(guild: Guild, message: string): Promise<void> {
  const setting = await prisma.guildSetting.findUnique({
    where: { guildId: guild.id },
  });

  if (!setting?.notificationChannelId) return;

  const channel = guild.channels.cache.get(setting.notificationChannelId);
  if (!channel?.isTextBased()) return;

  await channel.send(message);
}
