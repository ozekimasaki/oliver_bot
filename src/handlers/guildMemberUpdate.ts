import { Events, type GuildMember, type PartialGuildMember } from 'discord.js';
import { client } from '../client.js';
import { prisma } from '../db.js';
import { refreshListingChannel } from '../utils/role.js';

export function registerGuildMemberUpdateHandler(): void {
  client.on(
    Events.GuildMemberUpdate,
    async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
      const setting = await prisma.guildSetting.findUnique({
        where: { guildId: newMember.guild.id },
      });

      if (!setting?.targetRoleId) return;
      if (!newMember.user.bot) return;

      const hadRole =
        'roles' in oldMember
          ? oldMember.roles.cache.has(setting.targetRoleId)
          : false;
      const hasRole = newMember.roles.cache.has(setting.targetRoleId);

      if (hadRole !== hasRole) {
        await refreshListingChannel(newMember.guild);
      }
    }
  );
}
