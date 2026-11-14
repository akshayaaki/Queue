const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

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
