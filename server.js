import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compiledServerPath = path.resolve(__dirname, 'dist', 'server.js');

if (!fs.existsSync(compiledServerPath)) {
  console.error(
    'Production build not found at dist/server.js. Please run "npm run build" before starting the server.'
  );
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import('./dist/server.js').catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
