const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4070;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// ==================== API ENDPOINTS ====================

// GET list of all universities
app.get('/api/universities', (req, res) => {
  try {
    const universitiesPath = path.join(__dirname, 'universities');
    const files = fs.readdirSync(universitiesPath).filter(f => f.endsWith('.html'));
    const universities = files.map(f => ({
      filename: f,
      name: f.replace('.html', '').replace(/-/g, ' ').toUpperCase()
    }));
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET university page content
app.get('/api/university/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename.endsWith('.html')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(__dirname, 'universities', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'University page not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = parseUniversitySections(content);
    
    res.json({
      filename,
      sections,
      fullHtml: content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST save university page updates
app.post('/api/university/:filename/save', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename.endsWith('.html')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const { sections, fullHtml } = req.body;
    const filePath = path.join(__dirname, 'universities', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'University page not found' });
    }
    
    // Use provided HTML if given, otherwise reconstruct from sections
    const htmlToSave = fullHtml || reconstructUniversityPage(filename, sections);
    
    fs.writeFileSync(filePath, htmlToSave, 'utf-8');
    
    res.json({ 
      success: true, 
      message: 'Page saved successfully',
      filename 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST commit changes to GitHub
app.post('/api/commit', (req, res) => {
  try {
    const { message, files } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Commit message required' });
    }
    
    const commitMessage = message || 'Update university pages via CMS editor';
    
    try {
      // Stage files
      if (files && files.length > 0) {
        files.forEach(file => {
          execSync(`git add "${file}"`, { cwd: __dirname });
        });
      } else {
        execSync('git add universities/', { cwd: __dirname });
      }
      
      // Commit
      execSync(`git commit -m "${commitMessage}"`, { cwd: __dirname });
      
      // Push to remote
      execSync('git push', { cwd: __dirname });
      
      res.json({ 
        success: true, 
        message: 'Changes committed and pushed to GitHub successfully' 
      });
    } catch (error) {
      // Check if there are no changes to commit
      if (error.message.includes('nothing to commit')) {
        res.json({ 
          success: true, 
          message: 'No changes to commit' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HELPER FUNCTIONS ====================

function parseUniversitySections(html) {
  const sections = {};
  
  // Extract university name
  const titleMatch = html.match(/<h1 class="page-title">([^<]+)<\/h1>/);
  sections.universityName = titleMatch ? titleMatch[1] : 'Unknown';
  
  // Extract university info
  const infoMatch = html.match(/<strong>Ülke:<\/strong>\s*([^<]+)/);
  const continentMatch = html.match(/<strong>Kıta:<\/strong>\s*([^<]+)/);
  const sizeMatch = html.match(/<strong>Büyüklük:<\/strong>\s*([^<]+)/);
  const typeMatch = html.match(/<strong>Tür:<\/strong>\s*([^<]+)/);
  
  sections.universityInfo = {
    country: infoMatch ? infoMatch[1].trim() : '',
    continent: continentMatch ? continentMatch[1].trim() : '',
    size: sizeMatch ? sizeMatch[1].trim() : '',
    type: typeMatch ? typeMatch[1].trim() : ''
  };
  
  // Extract academic scores
  const overallMatch = html.match(/<strong>Genel Sıralama:<\/strong>\s*([^<]+)/);
  const academicMatch = html.match(/<strong>Akademik İtibar:<\/strong>\s*([^<]+)/);
  const employerMatch = html.match(/<strong>İşveren İtibarı:<\/strong>\s*([^<]+)/);
  const employmentMatch = html.match(/<strong>İstihdam Sonuçları:<\/strong>\s*([^<]+)/);
  
  sections.academicScores = {
    overall: overallMatch ? overallMatch[1].trim() : '',
    academic: academicMatch ? academicMatch[1].trim() : '',
    employer: employerMatch ? employerMatch[1].trim() : '',
    employment: employmentMatch ? employmentMatch[1].trim() : ''
  };
  
  // Extract main content sections (between h2 tags)
  const sectionRegex = /<h2[^>]*>([^<]+)<\/h2>([\s\S]*?)(?=<h2|<\/div>|$)/g;
  let match;
  
  while ((match = sectionRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    
    // Create a key from the title
    const key = title
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    
    sections[key] = {
      title,
      content
    };
  }
  
  return sections;
}

function reconstructUniversityPage(filename, sections) {
  // This would reconstruct the full HTML from sections
  // For now, return a placeholder - in production, you'd rebuild the entire page structure
  return `<!-- Reconstructed page for ${filename} -->`;
}

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`CMS Server running at http://localhost:${PORT}/editor`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
