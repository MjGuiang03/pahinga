import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local (since standalone scripts don't have Next.js env loading)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) return;
  const key = trimmed.slice(0, eqIndex).trim();
  const val = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) process.env[key] = val;
});

// Now import after env is loaded
const { default: mongoose } = await import('mongoose');
const { default: bcrypt } = await import('bcryptjs');

// Inline connect (can't use db.js since it loaded before env)
await mongoose.connect(process.env.MONGODB_URI);

const User = (await import('../src/backend/models/User.js')).default;

const existing = await User.findOne({ role: 'admin' });
if (existing) {
  console.log('Admin account already exists, skipping seed.');
  process.exit(0);
}

const hashedPassword = await bcrypt.hash('admin123', 12);

await User.create({
  name: 'Platform Admin',
  email: 'admin@pahinga.com',
  password: hashedPassword,
  role: 'admin',
});

console.log('Admin account seeded successfully');
console.log('  Email: admin@pahinga.com');
console.log('  Password: admin123');
process.exit(0);
