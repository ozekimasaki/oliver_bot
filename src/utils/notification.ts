import { type Guild } from 'discord.js';
import { prisma } from '../db.js';

export async function sendLoginNotification(
  guild: Guild,
  botName: string
): Promise<void> {
  await sendNotification(guild, `${botName} がログインしました。`);
}

export async function sendLogoutNotification(
  guild: Guild,
  botName: string
): Promise<void> {
  await sendNotification(guild, `${botName} がログアウトしました。`);
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
