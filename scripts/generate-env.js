const fs = require('fs');
const path = require('path');

const apiUrl =
  process.env.VEXARO_API_URL ||
  process.env.API_URL ||
  process.env.NG_APP_API_URL ||
  'http://localhost:5000/api/v1';

const target = path.join(__dirname, '..', 'public', 'env.js');
const contents = `window.__env = ${JSON.stringify({ apiUrl }, null, 2)};\n`;

fs.writeFileSync(target, contents, 'utf8');
console.log(`Generated public/env.js with apiUrl=${apiUrl}`);
