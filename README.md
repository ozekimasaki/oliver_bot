# Oliver Bot

Discord Bot のロール付け外しを管理する Bot です。
特定のユーザーと Bot を紐づけ、紐づけられたユーザーのみがその Bot に対して `/login` / `/logout` コマンドでロールの付け外しを行えます。

## 機能概要

- `/login @Bot`：対象 Bot にログインロールを付与
- `/logout @Bot`：対象 Bot からログインロールを剥奪
- `/setup`：Bot・ロール・ユーザー紐づけの設定
- ログイン中の Bot 一覧を表示するチャンネルを自動作成・更新

## 技術スタック

- TypeScript
- Node.js 22
- discord.js
- Prisma + SQLite

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、値を埋めます。

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=管理Botのトークン
GUILD_ID=対象サーバーID
DATABASE_URL="file:./dev.db"
```

### 3. データベースの準備

```bash
npx prisma db push
npx prisma generate
```

### 4. スラッシュコマンドの登録

```bash
npm run deploy-commands
```

### 5. Bot の起動

開発時：

```bash
npm run dev
```

本番時：

```bash
npm run build
npm start
```

## コマンド一覧

### ロール操作

| コマンド | 説明 |
|---------|------|
| `/login @Bot` | 対象 Bot にログインロールを付与 |
| `/logout @Bot` | 対象 Bot からログインロールを剥奪 |

### 設定

| コマンド | 説明 |
|---------|------|
| `/setup role @ロール` | 付け外し対象のロールを設定 |
| `/setup register-bot @Bot` | 管理対象 Bot を登録 |
| `/setup unregister-bot @Bot` | 管理対象 Bot を削除 |
| `/setup bind @ユーザー @Bot` | ユーザーと Bot を紐づけ |
| `/setup unbind @ユーザー @Bot` | ユーザーと Bot の紐づけを解除 |
| `/setup authorize @ユーザー` | setup 権限ユーザーを追加（管理者のみ） |
| `/setup create-listing-channel [名前]` | ログイン中 Bot 一覧チャンネルを作成 |

## 権限について

- `/login` / `/logout` は、対象 Bot と紐づけられたユーザーのみ実行可能
- `/setup` の各サブコマンドは、サーバー管理者または `/setup authorize` で追加されたユーザーのみ実行可能
- `/setup authorize` はサーバー管理者のみ実行可能

## pm2 での常駐実行（Ubuntu）

### 1. pm2 のインストール

```bash
sudo npm install -g pm2
```

### 2. プロジェクトを VPS に配置

```bash
cd /home/ubuntu
git clone https://github.com/ozekimasaki/oliver_bot.git
cd oliver_bot
npm install
```

### 3. 環境変数とデータベースの準備

```bash
cp .env.example .env
# .env を編集して本番値を設定
npx prisma db push
npx prisma generate
npm run build
npm run deploy-commands
```

### 4. pm2 で起動

```bash
pm2 start ecosystem.config.cjs
```

### 5. 自動起動の設定

```bash
pm2 startup
pm2 save
```

### 6. 確認・停止・再起動

```bash
pm2 status
pm2 logs oliver_bot
pm2 stop oliver_bot
pm2 restart oliver_bot
```

## 注意事項

- 管理 Bot は、付け外し対象のロールよりも上位のロールを持つ必要があります
- 一覧表示チャンネルは対象ロールの付与/剥奪イベントを検知して自動更新されます
