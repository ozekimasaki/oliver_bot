import {
  type Guild,
  type GuildMember,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits,
} from 'discord.js';
import { prisma } from '../db.js';

export async function getTargetRoleId(guildId: string): Promise<string | null> {
  const setting = await prisma.guildSetting.findUnique({
    where: { guildId },
  });
  return setting?.targetRoleId ?? null;
}

export async function getOrCreateGuildSetting(guildId: string) {
  return prisma.guildSetting.upsert({
    where: { guildId },
    create: { guildId },
    update: {},
  });
}

export async function refreshListingChannel(
  guild: Guild,
  useCache = true
): Promise<void> {
  const setting = await prisma.guildSetting.findUnique({
    where: { guildId: guild.id },
  });

  if (!setting?.targetRoleId || !setting.listingChannelId) return;

  const channel = guild.channels.cache.get(setting.listingChannelId);
  if (!channel?.isTextBased()) return;

  const me = guild.members.me;
  if (me) {
    const perms = channel.permissionsFor(me);
    console.log(`[listing channel ${channel.id}] permissions:`, perms?.toArray());
    console.log(`[listing channel ${channel.id}] can send messages:`, perms?.has(PermissionFlagsBits.SendMessages));
  }

  const memberCollection = useCache
    ? guild.members.cache
    : await guild.members.fetch();
  const members: GuildMember[] = [];
  for (const [, member] of memberCollection) {
    if (member.user.bot && member.roles.cache.has(setting.targetRoleId)) {
      members.push(member);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('ログイン中のBot一覧')
    .setColor(Colors.Green)
    .setDescription(
      members.length === 0
        ? '現在ログイン中のBotはいません。'
        : members.map((m) => `- ${m.user.tag} (${m.id})`).join('\n')
    )
    .setTimestamp();

  if (setting.listingMessageId) {
    try {
      const message = await channel.messages.fetch(setting.listingMessageId);
      await message.edit({ embeds: [embed] });
      return;
    } catch {
      // message not found, fall through to send new one
    }
  }

  try {
    const sent = await channel.send({ embeds: [embed] });
    await prisma.guildSetting.update({
      where: { guildId: guild.id },
      data: { listingMessageId: sent.id },
    });
  } catch (error) {
    console.error('Failed to refresh listing channel:', error);
  }
}
