import 'dotenv/config';

export const config = {
  discordToken: getEnv('DISCORD_TOKEN'),
  guildId: getEnv('GUILD_ID'),
  databaseUrl: getEnv('DATABASE_URL'),
  authorizedUserIds: getEnv('AUTHORIZED_USER_IDS')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
};

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}
