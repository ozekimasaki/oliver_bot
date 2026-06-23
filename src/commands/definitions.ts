import { SlashCommandBuilder } from 'discord.js';

export const loginCommand = new SlashCommandBuilder()
  .setName('login')
  .setDescription('対象のBotにログインロールを付与します')
  .addStringOption((option) =>
    option
      .setName('bot')
      .setDescription('ログインさせるBot')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .toJSON();

export const logoutCommand = new SlashCommandBuilder()
  .setName('logout')
  .setDescription('対象のBotからログインロールを剥奪します')
  .addStringOption((option) =>
    option
      .setName('bot')
      .setDescription('ログアウトさせるBot')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .toJSON();

export const setupCommand = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Bot管理の設定を行います')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('role')
      .setDescription('付け外し対象のロールを設定します')
      .addRoleOption((option) =>
        option
          .setName('role')
          .setDescription('対象のロール')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('register-bot')
      .setDescription('管理対象のBotを登録します')
      .addUserOption((option) =>
        option
          .setName('bot')
          .setDescription('登録するBot')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('unregister-bot')
      .setDescription('管理対象のBotを削除します')
      .addUserOption((option) =>
        option
          .setName('bot')
          .setDescription('削除するBot')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('bind')
      .setDescription('ユーザーとBotを紐づけます')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('紐づけるユーザー')
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName('bot')
          .setDescription('紐づけるBot')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('unbind')
      .setDescription('ユーザーとBotの紐づけを解除します')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('解除するユーザー')
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName('bot')
          .setDescription('解除するBot')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('authorize')
      .setDescription('setup権限を持つユーザーを追加します（管理者のみ）')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('追加するユーザー')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create-listing-channel')
      .setDescription('ロール付きBot一覧表示チャンネルを作成します')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('チャンネル名')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('notification-channel')
      .setDescription('ログイン・ログアウト通知チャンネルを設定します')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('通知先チャンネル')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('remove-notification-channel')
      .setDescription('ログイン・ログアウト通知チャンネル設定を解除します')
  )
  .toJSON();

export const helpCommand = new SlashCommandBuilder()
  .setName('help')
  .setDescription('利用可能なコマンド一覧を表示します')
  .toJSON();

export const commands = [
  loginCommand,
  logoutCommand,
  setupCommand,
  helpCommand,
];
