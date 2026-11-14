const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read .env if DATABASE_URL is not set
if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
const schemaFile = isPostgres ? 'prisma/schema.prisma' : 'prisma/schema.sqlite.prisma';

console.log(`[QueueFlow DB] Target dialect: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`[QueueFlow DB] Using schema: ${schemaFile}`);

try {
  const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
  execSync(`"${prismaBin}" db push --schema=${schemaFile}`, { stdio: 'inherit' });
  execSync(`"${prismaBin}" generate --schema=${schemaFile}`, { stdio: 'inherit' });
  console.log('[QueueFlow DB] Database sync and Prisma client generation completed successfully.');
} catch (error) {
  console.error('[QueueFlow DB] Sync error:', error.message);
  process.exit(1);
}
