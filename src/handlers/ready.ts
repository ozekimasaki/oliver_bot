import { Events } from 'discord.js';
import { client } from '../client.js';
import { config } from '../config.js';
import { prisma } from '../db.js';
import { refreshListingChannel } from '../utils/role.js';

export function registerReadyHandler(): void {
  client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag ?? 'unknown'}`);

    for (const userId of config.authorizedUserIds) {
      await prisma.authorizedSetupUser.upsert({
        where: { userId },
        create: { userId, isMaster: true },
        update: { isMaster: true },
      });
      console.log(`Master setup user registered: ${userId}`);
    }

    const guild = client.guilds.cache.get(config.guildId);
    if (guild) {
      await guild.members.fetch();
      await refreshListingChannel(guild, true);
    }
  });
}
