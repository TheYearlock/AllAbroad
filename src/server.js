const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4069;

const server = http.createServer((req, res) => {
  // Get the file path
  let filePath = path.join(
    __dirname,
    req.url === '/' ? 'index.html' : req.url
  );

  // Set content type based on file extension
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
  }

  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Native HTTP server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});

console.log("AllAbroad native HTTP server is working!");
