import { prisma } from './db.js';

async function main() {
  console.log('=== Bots ===');
  console.log(JSON.stringify(await prisma.bot.findMany(), null, 2));

  console.log('\n=== UserBotBindings ===');
  console.log(
    JSON.stringify(
      await prisma.userBotBinding.findMany({ include: { bot: true } }),
      null,
      2
    )
  );

  console.log('\n=== AuthorizedSetupUsers ===');
  console.log(
    JSON.stringify(await prisma.authorizedSetupUser.findMany(), null, 2)
  );

  console.log('\n=== GuildSettings ===');
  console.log(JSON.stringify(await prisma.guildSetting.findMany(), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
