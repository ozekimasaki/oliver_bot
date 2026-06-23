import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { canOperateBot } from '../utils/permissions.js';
import { getTargetRoleId, refreshListingChannel } from '../utils/role.js';

export async function handleLogout(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  const targetUser = interaction.options.getUser('bot', true);

  if (!targetUser.bot) {
    await interaction.editReply('Botユーザーではないユーザーは指定できません。');
    return;
  }

  const operationCheck = await canOperateBot(interaction.user.id, targetUser.id);
  if (!operationCheck.ok) {
    const message =
      operationCheck.reason === 'bot-not-registered'
        ? 'このBotは管理対象として登録されていません。`/setup register-bot` で登録してください。'
        : 'このBotと紐づけられていません。管理者に `/setup bind` を依頼してください。';
    await interaction.editReply(message);
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

  const member = await guild.members.fetch(targetUser.id).catch(() => null);
  if (!member) {
    await interaction.editReply('指定されたBotがこのサーバーに存在しません。');
    return;
  }

  try {
    await member.roles.remove(targetRoleId);
  } catch (error) {
    console.error('Failed to remove role:', error);
    await interaction.editReply('ロールの剥奪に失敗しました。Botに適切な権限があるか確認してください。');
    return;
  }

  await interaction.editReply(`${targetUser.tag} からログインロールを剥奪しました。`);

  await refreshListingChannel(guild, true);
}
