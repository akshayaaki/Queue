const { execSync } = require('child_process');

console.log('[QueueFlow Deploy] Initializing build...');
const dbUrl = process.env.DATABASE_URL;

if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
  console.log('[QueueFlow Deploy] PostgreSQL connection detected. Pushing schema and creating tables...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[QueueFlow Deploy] Schema synchronized successfully.');
    try {
      execSync('node prisma/seed.js', { stdio: 'inherit' });
      console.log('[QueueFlow Deploy] Initial demo managers seeded successfully.');
    } catch (seedErr) {
      console.log('[QueueFlow Deploy] Seed note:', seedErr.message);
    }
  } catch (err) {
    console.warn('[QueueFlow Deploy] Warning during database push:', err.message);
  }
} else {
  console.log('[QueueFlow Deploy] No PostgreSQL DATABASE_URL detected during build step. Using client generation.');
}

console.log('[QueueFlow Deploy] Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('[QueueFlow Deploy] Compiling Next.js production build...');
execSync('next build', { stdio: 'inherit' });
console.log('[QueueFlow Deploy] Build completed successfully.');
