const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found, try to serve index.html for SPA routing
        fs.readFile('./index.html', (error, content) => {
          if (error) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>', 'utf-8');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, () => {
  console.log(`🛡️ DRISHYTOX AI Road Safety Platform running at http://localhost:${port}/`);
  console.log(`\n🌟 COMPLETE PLATFORM:`);
  console.log(`🏠 Immersive Landing: http://localhost:${port}/index-new.html`);
  console.log(`📊 Admin Dashboard: http://localhost:${port}/admin-new.html`);
  console.log(`🚗 Driver Registration: http://localhost:${port}/driver-registration.html`);
  console.log(`🚑 Provider Registration: http://localhost:${port}/provider-registration.html`);
  console.log(`\n🎯 PREMIUM FEATURES:`);
  console.log(`✅ Immersive hero section with animated road backgrounds`);
  console.log(`✅ AI-powered road safety intelligence dashboard`);
  console.log(`✅ Advanced data visualizations and risk gauges`);
  console.log(`✅ Complete road safety themed design system`);
  console.log(`✅ Premium government-grade interface`);
  console.log(`\n🚀 FOCUSED EXCELLENCE - Smart City Road Safety Dashboard!`);
});
