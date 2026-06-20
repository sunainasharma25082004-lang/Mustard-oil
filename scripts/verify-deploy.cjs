#!/usr/bin/env node
/**
 * Pre-push deploy verification — run: npm run verify:deploy
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const requiredFiles = [
  'render.yaml',
  'package.json',
  'package-lock.json',
  'server/package.json',
  'server/package-lock.json',
  'admin/package.json',
  'admin/package-lock.json',
  'server/.env.example',
  'public/robots.txt',
  'public/sitemap.xml',
];

let failed = 0;

const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  console.error(`  ✗ ${msg}`);
  failed += 1;
};

console.log('\n[Karyor] Deploy readiness check\n');

console.log('Files:');
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(root, file))) ok(file);
  else fail(`Missing: ${file}`);
}

console.log('\nBuilds:');
try {
  execSync('npm run build', { cwd: root, stdio: 'pipe' });
  ok('Store build (dist/)');
} catch (err) {
  fail(`Store build failed: ${err.stderr?.toString().trim() || err.message}`);
}

try {
  execSync('npm run build', { cwd: path.join(root, 'admin'), stdio: 'pipe' });
  ok('Admin build (admin/dist/)');
} catch (err) {
  fail(`Admin build failed: ${err.stderr?.toString().trim() || err.message}`);
}

console.log('\nRender env checklist (set in dashboard — do NOT commit secrets):');
[
  'MONGO_URI',
  'JWT_SECRET',
  'SETTINGS_ENCRYPTION_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'SHIPROCKET_EMAIL',
  'SHIPROCKET_PASSWORD',
  'SHIPROCKET_WEBHOOK_SECRET',
  'VITE_API_URL (store + admin)',
  'VITE_RAZORPAY_KEY_ID (store)',
  'VITE_STORE_URL (admin)',
].forEach((item) => ok(item));

console.log(failed ? `\n❌ ${failed} check(s) failed\n` : '\n✅ Ready to push — Render will auto-deploy on git push\n');
process.exit(failed ? 1 : 0);