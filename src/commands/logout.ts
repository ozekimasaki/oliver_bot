import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../db.js';
import { canOperateBot } from '../utils/permissions.js';
import { getTargetRoleId, refreshListingChannel } from '../utils/role.js';

export async function handleLogout(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const botDiscordId = interaction.options.getString('bot', true);

  const botRecord = await prisma.bot.findUnique({
    where: { discordId: botDiscordId },
  });
  if (!botRecord) {
    await interaction.editReply('このBotは管理対象として登録されていません。`/setup register-bot` で登録してください。');
    return;
  }

  const operationCheck = await canOperateBot(interaction.user.id, botDiscordId);
  if (!operationCheck.ok) {
    await interaction.editReply('このBotと紐づけられていません。管理者に `/setup bind` を依頼してください。');
    return;
  }

  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply('Guild内でのみ実行できます。');
    return;
  }

  const targetRoleId = await getTargetRoleId(guild.id);
  if (!targetRoleId) {
    await interaction.editReply('対象のロールが設定されていません。`/setup role` で設定してください。');
    return;
  }

  const member = await guild.members.fetch(botDiscordId).catch(() => null);
  if (!member) {
    await interaction.editReply('指定されたBotがこのサーバーに存在しません。');
    return;
  }

  if (!member.user.bot) {
    await interaction.editReply('Botユーザーではないユーザーは指定できません。');
    return;
  }

  try {
    await member.roles.remove(targetRoleId);
  } catch (error) {
    console.error('Failed to remove role:', error);
    await interaction.editReply('ロールの剥奪に失敗しました。Botに適切な権限があるか確認してください。');
    return;
  }

  await interaction.editReply(`${member.user.tag} からログインロールを剥奪しました。`);

  await refreshListingChannel(guild, true);
}
