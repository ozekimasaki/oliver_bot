import { type Guild, PermissionFlagsBits } from 'discord.js';
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

  const me = guild.members.me;
  if (me) {
    const perms = channel.permissionsFor(me);
    console.log(`[notification channel ${channel.id}] permissions:`, perms?.toArray());
    console.log(`[notification channel ${channel.id}] can send messages:`, perms?.has(PermissionFlagsBits.SendMessages));
  }

  try {
    await channel.send(message);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
