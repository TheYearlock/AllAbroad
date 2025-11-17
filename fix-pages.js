const fs = require('fs');
const path = require('path');

const UNI_DIR = path.join(__dirname, 'universities');

const CORRECT_HEADER = `    <div class="hamburger-container">
        <div class="hamburger-icon">
            <span></span><span></span><span></span>
        </div>
        <div class="menu-panel" aria-hidden="true">
            <nav>
                <ul>
                    <li><a href="../continents.html">Kıtalar</a></li>
                    <li><a href="../universities.html">Üniversiteler</a></li>
                    <li><a href="../scholarships.html">Burslar</a></li>
                    <li><a href="../about.html">Hakkımızda</a></li>
                </ul>
            </nav>
            <a href="../login.html" class="login-btn-mobile">Giriş Yap</a>
        </div>
    </div>
    <header>
        <a href="../index.html" class="logo">
            <span class="all">All</span><span class="abroad">Abroad</span>
        </a>
        
        <div class="nav-right">
            <nav class="main-nav">
                <ul>
                    <li class="dropdown">
                        <a href="../continents.html">Kıtalar</a>
                        <div class="dropdown-content">
                            <a href="../continents/europe.html">Avrupa</a>
                            <a href="../continents/americas.html">ABD ve Kanada</a>
                            <a href="../continents/asia.html">Asya</a>
                        </div>
                    </li>
                    <li class="dropdown">
                        <a href="../universities.html">Üniversiteler</a>
                        <div class="dropdown-content">
                            <a href="../universities.html">Tüm Üniversiteler</a>
                        </div>
                    </li>
                    <li><a href="../scholarships.html">Burslar</a></li>
                    <li><a href="../about.html">Hakkımızda</a></li>
                </ul>
            </nav>
            <div class="search-box">
                <span class="search-icon">⌕</span>
                <input type="text" placeholder="Search">
            </div>
            <a href="../user.html" class="user-btn" style="display:none;"><i class="fas fa-user-circle" style="color:#E63946;font-size:28px;"></i></a>
            <a href="../login.html" class="login-btn">Giriş Yap</a>
        </div>
    </header>`;

const CORRECT_SUBFOOTER = `    <div class="subfooter-wrapper">
      <div class="subfooter">
        <div class="subfooter-content">
          <div class="subfooter-column">
            <h4>Kıtalar</h4>
            <ul>
              <li><a href="../continents/europe.html">Avrupa</a></li>
              <li><a href="../continents/americas.html">Amerika</a></li>
              <li><a href="../continents/asia.html">Asya</a></li>
            </ul>
          </div>
          <div class="subfooter-column">
            <h4>Üniversiteler</h4>
            <ul>
              <li><a href="../universities.html">Tüm Üniversiteler</a></li>
              <li><a href="../universities.html"> </a></li>
            </ul>
          </div>
          <div class="subfooter-column">
            <h4>Kaynaklar</h4>
            <ul>
              <li><a href="../scholarships.html">Burslar</a></li>
              <li><a href="../finder.html">AllAbroad Sihirbazı</a></li>
            </ul>
          </div>
          <div class="subfooter-column">
            <h4>Şirket</h4>
            <ul>
              <li><a href="../about.html">Hakkımızda</a></li>
              <li><a href="../contact.html">İletişim</a></li>
            </ul>
          </div>
        </div>
        <div class="subfooter-bottom">
          <p>&copy; 2024 AllAbroad. Tüm hakları saklıdır. </p>
        </div>
      </div>
    </div>`;

function fixUniversityPage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix header
    const headerRegex = /<header>[\s\S]*?<\/header>/;
    content = content.replace(headerRegex, CORRECT_HEADER);
    
    // Fix subfooter
    const subfooterRegex = /<div class="subfooter-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    content = content.replace(subfooterRegex, CORRECT_SUBFOOTER);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ ${path.basename(filePath)}`);
    return true;
  } catch (e) {
    console.log(`✗ ${path.basename(filePath)}: ${e.message}`);
    return false;
  }
}

async function main() {
  const files = fs.readdirSync(UNI_DIR).filter(f => f.endsWith('.html'));
  console.log(`Fixing ${files.length} university pages...\n`);
  
  let fixed = 0;
  for (const file of files.sort()) {
    const filePath = path.join(UNI_DIR, file);
    if (fixUniversityPage(filePath)) fixed++;
  }
  
  console.log(`\n✓ Fixed ${fixed}/${files.length} pages`);
}

main();
