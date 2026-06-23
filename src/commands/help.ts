import {
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
} from 'discord.js';

export async function handleHelp(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle('オリバー・グレイ コマンド一覧')
    .setDescription('以下のコマンドが利用可能です。')
    .setColor(0x3498db)
    .addFields(
      {
        name: '📋 ロール操作',
        value: [
          '`/login <bot>`：対象Botにログインロールを付与',
          '`/logout <bot>`：対象Botからログインロールを剥奪',
        ].join('\n'),
      },
      {
        name: '⚙️ 設定（setup権限ユーザー / サーバー管理者）',
        value: [
          '`/setup role <role>`：付け外し対象のロールを設定',
          '`/setup register-bot <bot>`：管理対象Botを登録',
          '`/setup unregister-bot <bot>`：管理対象Botを削除',
          '`/setup bind <user> <bot>`：ユーザーとBotを紐づけ',
          '`/setup unbind <user> <bot>`：ユーザーとBotの紐づけを解除',
          '`/setup authorize <user>`：setup権限ユーザーを追加（管理者/マスターのみ）',
          '`/setup create-listing-channel [name]`：ログイン中Bot一覧チャンネルを作成',
        ].join('\n'),
      },
      {
        name: '❓ その他',
        value: '`/help`：このメッセージを表示',
      }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
}
