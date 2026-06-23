import {
  type ChatInputCommandInteraction,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { prisma } from '../db.js';
import { isSetupAuthorized, isAdminOrMaster } from '../utils/permissions.js';
import { getOrCreateGuildSetting, refreshListingChannel } from '../utils/role.js';

export async function handleSetup(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === 'authorize') {
    const allowed = await isAdminOrMaster(interaction);
    if (!allowed) {
      await interaction.editReply('このコマンドはサーバー管理者またはマスター権限ユーザーのみ実行できます。');
      return;
    }
    await handleAuthorize(interaction);
    return;
  }

  const authorized = await isSetupAuthorized(interaction);
  if (!authorized) {
    await interaction.editReply('このコマンドを実行する権限がありません。');
    return;
  }

  switch (subcommand) {
    case 'role':
      await handleRole(interaction);
      break;
    case 'register-bot':
      await handleRegisterBot(interaction);
      break;
    case 'unregister-bot':
      await handleUnregisterBot(interaction);
      break;
    case 'bind':
      await handleBind(interaction);
      break;
    case 'unbind':
      await handleUnbind(interaction);
      break;
    case 'create-listing-channel':
      await handleCreateListingChannel(interaction);
      break;
    case 'notification-channel':
      await handleNotificationChannel(interaction);
      break;
    case 'remove-notification-channel':
      await handleRemoveNotificationChannel(interaction);
      break;
    default:
      await interaction.editReply('未知のサブコマンドです。');
  }
}

async function handleRole(interaction: ChatInputCommandInteraction): Promise<void> {
  const role = interaction.options.getRole('role', true);
  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply('Guild内でのみ実行できます。');
    return;
  }

  await prisma.guildSetting.upsert({
    where: { guildId: guild.id },
    create: { guildId: guild.id, targetRoleId: role.id },
    update: { targetRoleId: role.id },
  });

  await interaction.editReply(`対象ロールを <@&${role.id}> に設定しました。`);
}

async function handleRegisterBot(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const botUser = interaction.options.getUser('bot', true);

  if (!botUser.bot) {
    await interaction.editReply('Botユーザー以外は登録できません。');
    return;
  }

  await prisma.bot.upsert({
    where: { discordId: botUser.id },
    create: { discordId: botUser.id, name: botUser.tag },
    update: { name: botUser.tag },
  });

  await interaction.editReply(`${botUser.tag} を管理対象Botに登録しました。`);
}

async function handleUnregisterBot(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const botUser = interaction.options.getUser('bot', true);

  if (!botUser.bot) {
    await interaction.editReply('Botユーザー以外は指定できません。');
    return;
  }

  await prisma.bot.deleteMany({
    where: { discordId: botUser.id },
  });

  await interaction.editReply(`${botUser.tag} を管理対象Botから削除しました。`);
}

async function handleBind(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = interaction.options.getUser('user', true);
  const botUser = interaction.options.getUser('bot', true);

  if (!botUser.bot) {
    await interaction.editReply('Botユーザーを指定してください。');
    return;
  }

  const bot = await prisma.bot.findUnique({
    where: { discordId: botUser.id },
  });

  if (!bot) {
    await interaction.editReply('指定されたBotは登録されていません。先に `/setup register-bot` で登録してください。');
    return;
  }

  await prisma.userBotBinding.upsert({
    where: {
      userId_botId: {
        userId: user.id,
        botId: bot.id,
      },
    },
    create: {
      userId: user.id,
      botId: bot.id,
    },
    update: {},
  });

  await interaction.editReply(`${user.tag} と ${botUser.tag} を紐づけました。`);
}

async function handleUnbind(interaction: ChatInputCommandInteraction): Promise<void> {
  const user = interaction.options.getUser('user', true);
  const botUser = interaction.options.getUser('bot', true);

  if (!botUser.bot) {
    await interaction.editReply('Botユーザーを指定してください。');
    return;
  }

  const bot = await prisma.bot.findUnique({
    where: { discordId: botUser.id },
  });

  if (!bot) {
    await interaction.editReply('指定されたBotは登録されていません。');
    return;
  }

  await prisma.userBotBinding.deleteMany({
    where: {
      userId: user.id,
      botId: bot.id,
    },
  });

  await interaction.editReply(`${user.tag} と ${botUser.tag} の紐づけを解除しました。`);
}

async function handleAuthorize(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const user = interaction.options.getUser('user', true);

  await prisma.authorizedSetupUser.upsert({
    where: { userId: user.id },
    create: { userId: user.id, isMaster: false },
    update: {},
  });

  await interaction.editReply(`${user.tag} をsetup権限ユーザーに追加しました。`);
}

async function handleCreateListingChannel(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply('Guild内でのみ実行できます。');
    return;
  }

  const setting = await getOrCreateGuildSetting(guild.id);
  if (!setting.targetRoleId) {
    await interaction.editReply('先に `/setup role` で対象ロールを設定してください。');
    return;
  }

  const channelName = interaction.options.getString('name') ?? 'bot-login-list';

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.SendMessages],
      },
      {
        id: interaction.client.user.id,
        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
      },
    ],
  });

  await prisma.guildSetting.update({
    where: { guildId: guild.id },
    data: {
      listingChannelId: channel.id,
      listingMessageId: null,
    },
  });

  await interaction.editReply(`一覧チャンネル <#${channel.id}> を作成しました。`);

  await refreshListingChannel(guild, true);
}

async function handleNotificationChannel(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply('Guild内でのみ実行できます。');
    return;
  }

  const channel = interaction.options.getChannel('channel', true);

  await prisma.guildSetting.upsert({
    where: { guildId: guild.id },
    create: {
      guildId: guild.id,
      notificationChannelId: channel.id,
    },
    update: {
      notificationChannelId: channel.id,
    },
  });

  await interaction.editReply(
    `ログイン・ログアウト通知チャンネルを <#${channel.id}> に設定しました。`
  );
}

async function handleRemoveNotificationChannel(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply('Guild内でのみ実行できます。');
    return;
  }

  await prisma.guildSetting.upsert({
    where: { guildId: guild.id },
    create: { guildId: guild.id },
    update: { notificationChannelId: null },
  });

  await interaction.editReply('ログイン・ログアウト通知チャンネル設定を解除しました。');
}
