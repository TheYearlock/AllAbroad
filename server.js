const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { execSync, spawn } = require('child_process');

const PORT = process.env.PORT || 4069;

// ==================== HELPER FUNCTIONS ====================

function parseJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      callback(null);
    }
  });
}

function getContentType(extname) {
  const types = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
  };
  return types[extname] || 'text/html';
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseUniversitySections(html) {
  const sections = {};
  
  // Extract university name
  const titleMatch = html.match(/<h1 class="page-title">([^<]+)<\/h1>/);
  sections.universityName = titleMatch ? titleMatch[1] : 'Unknown';
  
  // Extract university info
  const infoMatch = html.match(/<strong>Ülke:<\/strong>\s*([^<]+)/);
  const continentMatch = html.match(/<strong>Kıta:<\/strong>\s*([^<]+)/);
  
  sections.universityInfo = {
    country: infoMatch ? infoMatch[1].trim() : '',
    continent: continentMatch ? continentMatch[1].trim() : ''
  };
  
  // Extract main content sections (between h2 tags)
  const sectionRegex = /<h2[^>]*>([^<]+)<\/h2>([\s\S]*?)(?=<h2|<\/div>|$)/g;
  let match;
  
  while ((match = sectionRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    const key = title
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    
    sections[key] = { title, content };
  }
  
  return sections;
}

// ==================== API ENDPOINTS ====================

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // ===== API: GET /api/universities =====
  if (pathname === '/api/universities' && req.method === 'GET') {
    try {
      const universitiesPath = path.join(__dirname, 'universities');
      const files = fs.readdirSync(universitiesPath).filter(f => f.endsWith('.html'));
      const universities = files.map(f => ({
        filename: f,
        name: f.replace('.html', '').replace(/-/g, ' ').toUpperCase().substring(0, 50)
      }));
      sendJson(res, universities);
    } catch (error) {
      sendJson(res, { error: error.message }, 500);
    }
    return;
  }

  // ===== API: GET /api/university/:filename =====
  if (pathname.startsWith('/api/university/') && req.method === 'GET') {
    try {
      const filename = pathname.replace('/api/university/', '');
      if (!filename.endsWith('.html')) {
        return sendJson(res, { error: 'Invalid filename' }, 400);
      }
      
      const filePath = path.join(__dirname, 'universities', filename);
      if (!fs.existsSync(filePath)) {
        return sendJson(res, { error: 'University page not found' }, 404);
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const sections = parseUniversitySections(content);
      
      sendJson(res, { filename, sections, fullHtml: content });
    } catch (error) {
      sendJson(res, { error: error.message }, 500);
    }
    return;
  }

  // ===== API: POST /api/university/:filename/save =====
  if (pathname.startsWith('/api/university/') && pathname.includes('/save') && req.method === 'POST') {
    parseJsonBody(req, (body) => {
      try {
        const filename = pathname.replace('/api/university/', '').replace('/save', '');
        if (!filename.endsWith('.html')) {
          return sendJson(res, { error: 'Invalid filename' }, 400);
        }
        
        const filePath = path.join(__dirname, 'universities', filename);
        if (!fs.existsSync(filePath)) {
          return sendJson(res, { error: 'University page not found' }, 404);
        }
        
        const { fullHtml } = body;
        if (!fullHtml) {
          return sendJson(res, { error: 'HTML content required' }, 400);
        }
        
        fs.writeFileSync(filePath, fullHtml, 'utf-8');
        sendJson(res, { success: true, message: 'Page saved successfully', filename });
      } catch (error) {
        sendJson(res, { error: error.message }, 500);
      }
    });
    return;
  }

  // ===== API: POST /api/commit =====
  if (pathname === '/api/commit' && req.method === 'POST') {
    parseJsonBody(req, (body) => {
      try {
        const message = body?.message || 'Update university pages via editor';
        
        try {
          // Stage all changes in universities folder
          execSync('git add universities/', { cwd: __dirname, stdio: 'pipe' });
          
          // Check if there are changes to commit
          const status = execSync('git status --porcelain universities/', { cwd: __dirname, encoding: 'utf-8' });
          
          if (!status.trim()) {
            return sendJson(res, { success: true, message: 'No changes to commit' });
          }
          
          // Commit
          execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: __dirname, stdio: 'pipe' });
          
          // Push to remote
          execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
          
          sendJson(res, { success: true, message: 'Changes committed and pushed to GitHub ✓' });
        } catch (error) {
          if (error.message.includes('nothing to commit')) {
            sendJson(res, { success: true, message: 'No changes to commit' });
          } else {
            sendJson(res, { error: error.message }, 500);
          }
        }
      } catch (error) {
        sendJson(res, { error: error.message }, 500);
      }
    });
    return;
  }

  // ===== STATIC FILES & PAGES =====
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 Forbidden</h1>');
    return;
  }

  const extname = path.extname(filePath);
  const contentType = getContentType(extname);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 AllAbroad Server running at http://localhost:${PORT}/`);
  console.log(`📝 Editor available at http://localhost:${PORT}/editor.html`);
  console.log('Press Ctrl+C to stop');
});

console.log("AllAbroad server with CMS API is working!");
