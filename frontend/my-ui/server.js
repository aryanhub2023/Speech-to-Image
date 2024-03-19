const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve your static files
app.use(express.static(path.join(__dirname, 'build')));

// Serve your index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Configure HTTPS options
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'private.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'ssl', 'certificate.crt'))
};

// Create HTTPS server
https.createServer(httpsOptions, app)
  .listen(443, () => {
    console.log('Server is running on https://localhost:443');
  });
