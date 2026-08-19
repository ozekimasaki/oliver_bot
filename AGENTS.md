# AGENTS.md

このリポジトリで作業するコーディングエージェント向けのガイドです。実際のコードと設定に基づいて記載しています。

## プロジェクト概要

`oliver_bot` は discord.js 製の Discord Bot です。特定のユーザーと Bot を紐づけ、紐づけられたユーザーのみがスラッシュコマンド（`/login` / `/logout`）で対象ロールの付け外しを行えるようにします。設定は `/setup` サブコマンドで管理します。

- 言語: TypeScript（ESM、`"type": "module"`）
- ランタイム: Node.js 22
- 主要ライブラリ: discord.js 14、Prisma 5（SQLite）、dotenv
- 実行/ビルド: `tsx`（開発）、`tsc`（ビルド）

## プロジェクト構成 / エントリポイント

- `src/index.ts` — エントリポイント。ハンドラを登録し `client.login()` を呼ぶ。
- `src/client.ts` — discord.js `Client` の定義（Intents: Guilds / GuildMembers / GuildMessages、Partials: GuildMember）。
- `src/config.ts` — 環境変数を読み込み検証する。未設定なら例外を投げる。
- `src/db.ts` — `PrismaClient` のシングルトン。
- `src/deploy-commands.ts` — スラッシュコマンドを対象ギルドに登録するスクリプト（`npm run deploy-commands`）。
- `src/diagnose.ts` — DB 内容を出力する診断スクリプト（`tsx src/diagnose.ts` で実行）。
- `src/commands/` — コマンド定義（`definitions.ts`）とハンドラ（`login.ts` / `logout.ts` / `setup.ts` / `help.ts`）。
- `src/handlers/` — Discord イベントハンドラ（`ready.ts` / `interactionCreate.ts` / `autocomplete.ts` / `guildMemberUpdate.ts`）。
- `src/utils/` — `role.ts`（ロール操作・一覧チャンネル更新）、`permissions.ts`（権限判定）、`notification.ts`（通知送信）。
- `prisma/schema.prisma` — DB スキーマ（`Bot` / `GuildSetting` / `UserBotBinding` / `AuthorizedSetupUser`）。
- `ecosystem.config.cjs` — pm2 での常駐実行設定。

## セットアップ

```bash
npm install
cp .env.example .env   # 値を編集
npx prisma db push     # または npm run db:migrate
npx prisma generate    # または npm run db:generate
```

### 必須環境変数（`src/config.ts` で検証）

いずれも未設定だと起動時に `Missing environment variable: <KEY>` で終了します。

- `DISCORD_TOKEN` — 管理 Bot のトークン
- `GUILD_ID` — 対象サーバー（ギルド）ID
- `AUTHORIZED_USER_IDS` — マスター権限ユーザー ID（カンマ区切りで複数可）
- `DATABASE_URL` — SQLite の接続先（例: `file:./dev.db`）

## ビルド / 実行 / チェックコマンド

`package.json` の `scripts` に定義された実在コマンドのみ:

- `npm run dev` — `tsx src/index.ts`（開発実行）
- `npm run build` — `tsc`（`src` → `dist` にコンパイル。**型チェックを兼ねる**）
- `npm start` — `node dist/index.js`（`npm run build` 後に実行）
- `npm run deploy-commands` — スラッシュコマンドを登録
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:generate` — `prisma generate`
- `npm run db:studio` — `prisma studio`

### lint / test / typecheck について

- 専用の **lint / test スクリプトは存在しません**。存在しないコマンド（`npm run lint`、`npm test` など）を実行・記載しないでください。
- 型チェックは `npm run build`（`tsc`）で行います。変更後は必ずこれを実行してください。`tsconfig.json` は `strict: true`。
- Prisma スキーマを変更した場合は `npm run db:generate` で Client を再生成してください。

## コーディング規約

- ESM を使用。**相対 import には `.js` 拡張子を付ける**（例: `import { client } from './client.js';`）。`moduleResolution` は `NodeNext`。
- TypeScript strict モード。`any` を避け、型を正しく扱う。discord.js の型（`ChatInputCommandInteraction` など）を活用する。
- import はファイル先頭にまとめる。
- Prisma は `src/db.ts` の `prisma` シングルトンを使い、新たに `new PrismaClient()` を作らない。
- ユーザー向けメッセージは日本語。既存コマンドの description・応答文言のトーンに合わせる。
- 新しいスラッシュコマンド/サブコマンドを追加する場合:
  1. `src/commands/definitions.ts` に定義を追加し、`commands` 配列に含める。
  2. ハンドラを実装し、`src/handlers/interactionCreate.ts`（トップレベルコマンド）または `src/commands/setup.ts`（`setup` サブコマンド）に分岐を追加する。
  3. `npm run deploy-commands` で再登録が必要（Discord 側への反映）。
- 権限判定は `src/utils/permissions.ts` の `isSetupAuthorized` / `isAdminOrMaster` を用いる。

## 注意点

- `.env` と `*.db` は Git 管理外（`.gitignore`）。**コミットしない**。
- コマンド定義を変更したら Discord への反映に `npm run deploy-commands` が必要。
- 管理 Bot は付け外し対象ロールより上位のロールを持つ必要がある（ロール階層に依存）。
- 本番は pm2（`ecosystem.config.cjs`）で `dist/index.js` を実行するため、デプロイ前に `npm run build` が必要。
- SQLite を利用しているため、`DATABASE_URL` の変更やマイグレーション時は既存 DB ファイルの扱いに注意する。
