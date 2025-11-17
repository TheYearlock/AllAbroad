const fs = require('fs');
const path = require('path');

// Read universities.json
const universitiesJson = require('./universities.json');

// Turkish content for specific universities
const universityContent = {
  'Massachusetts Institute of Technology (MIT)': {
    intro: `MIT, mühendislik ve fen bilimlerinde dünyanın en saygın okullarından biridir. QS dünya üniversite sıralamasında 2025–26 döneminde 14. kez peş peşe dünya birincisi seçilmiş. Kimya, bilgisayar bilimi, elektrik-elektronik, makine mühendisliği gibi birçok alanda da QS konular bazında birinci sıradadır.`,
    studentProfile: `MIT, akademik mükemmeliyeti ve araştırma yeteneğini olan öğrencileri arıyor. Sınavlarda yüksek puanların yanısıra, bilim insanı veya mühendis yeteneklerini göstermiş olmanız gerekir.`,
    examScores: { sat: '1500+', act: '35+', toefl: 'İsteğe bağlı', ielts: 'İsteğe bağlı' },
    extracurricular: `Matematik ve fen bilimleri olimpiyatları, bilgisayar programlama yarışmaları, robotik projeleri gibi STEM alanında kanıtlanmış başarılar MIT'in tercih ettiği ekstrakurrikuler faaliyetlerdir.`,
    financialAid: `MIT'nin Financial Aid politikası düşük gelirli uluslararası öğrenciler için uygun olabilir. MIT, bütün kabul edilmiş öğrencilerin finansal ihtiyaçlarını karşılamayı taahhüt eder.`,
    finalHighlight: `MIT, üst düzey bir çalışma ve başarı gerektiriyor. Matematik ve fen bilimlerinde gerçekten yetenekliyseniz, MIT sizin için doğru adres olabilir.`
  },
  'Harvard University': {
    intro: `Harvard, Amerika Birleşik Devletleri'nin en eski ve en prestijli üniversitesidir. Hukuk, tıp, işletme ve fen bilimleri alanlarında dünyanın en üst sıralarında yer almaktadır.`,
    studentProfile: `Harvard, akademik üstünlükle birlikte liderlik yetenekleri ve toplumsal katkı yapan öğrencileri arıyor. Kabul edilenler genellikle çok yüksek GPA ve SAT/ACT puanları olan öğrencilerdir.`,
    examScores: { sat: '1480+', act: '34+', toefl: 'İsteğe bağlı', ielts: 'İsteğe bağlı' },
    extracurricular: `Harvard, sosyal sorumluluk projelerine katılımı, spor başarılarını ve liderlik deneyimlerini önemsiyor.`,
    financialAid: `Harvard'ın "Affordable Harvard" programı yüksek finansal destek sunmaktadır. Uluslararası öğrenciler kısıtlı da olsa finansal yardım alabilir.`,
    finalHighlight: `Harvard, Amerikan eğitim sisteminin en tepesindedir. Başarısı kanıtlanmış akademisyenlerin başvurusu değerlendirilmektedir.`
  },
  'Stanford University': {
    intro: `Stanford Üniversitesi, Silikon Vadisinin merkezinde konumlanmış, teknoloji ve girişimcilikte dünyanın lider kurumudur.`,
    studentProfile: `Stanford, akademik mükemmeliyetin yanında yenilikçilik ve girişimcilik ruhuyla hareket eden öğrencileri arıyor.`,
    examScores: { sat: '1490+', act: '34+', toefl: '90+', ielts: '7.0+' },
    extracurricular: `Stanford, teknoloji başarısı ve girişimcilik projeleri olan öğrencileri tercih eder.`,
    financialAid: `Stanford, uluslararası öğrencilerin finansal ihtiyaçlarını karşılamakla taahhüt etmiştir.`,
    finalHighlight: `Stanford, teknoloji alanında hedeflerinizi gerçekleştirmenize yardımcı olacaktır.`
  }
};

function generateHTMLPage(university) {
  const content = universityContent[university.Institution] || getDefaultContent(university);
  const filename = university.Institution
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/,/g, '')
    .replace(/&/g, 'and') + '.html';
  
  const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-L36SLS8YBV"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-L36SLS8YBV');
        </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${university.Institution} - AllAbroad</title>
        <meta name="description" content="${university.Institution} hakkında detaylı rehber. Türk öğrenciler için başvuru, burs ve yaşam rehberi.">
        <meta name="keywords" content="yurtdışı eğitim, ${university.Institution}, üniversite, başvuru rehberi, Türk öğrenciler">
        <meta name="robots" content="index, follow">
        <meta name="author" content="Yaser İnan">
        <meta property="og:title" content="${university.Institution} - AllAbroad">
        <meta property="og:description" content="${university.Institution} hakkında Türk öğrenciler için rehber">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://www.allabroadedu.com/universities/${filename}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${university.Institution} - AllAbroad">
        <meta name="twitter:description" content="${university.Institution} rehberi">
        <link rel="icon" href="../assets/favicon.ico" type="image/x-icon">
        <link rel="canonical" href="https://www.allabroadedu.com/universities/${filename}">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="../style.css">
       
    
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "CollegeOrUniversity",
            "name": "${university.Institution}",
            "url": "https://www.allabroadedu.com/universities/${filename}",
            "description": "Türk öğrenciler için ${university.Institution} rehberi"
        }
        </script>
        <!-- Firebase App (the core Firebase SDK) -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<!-- Firebase Auth -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
</head>
<body>

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
        
    </header>

   
    <div class="main-content">
        <h1 class="page-title">${university.Institution}</h1>
        
        <div class="university-info" style="max-width: 1000px; margin: 40px auto; padding: 0 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <h3 style="color: #E63946; margin-bottom: 15px;">Üniversite Bilgileri</h3>
                    <p><strong>Ülke:</strong> ${university.Location}</p>
                    <p><strong>Kıta:</strong> ${university['Column5']}</p>
                    <p><strong>Büyüklük:</strong> ${university.Classification}</p>
                    <p><strong>Tür:</strong> ${university['Column9']}</p>
                </div>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <h3 style="color: #E63946; margin-bottom: 15px;">Akademik Puanlar</h3>
                    <p><strong>Genel Sıralama:</strong> ${typeof university.Overall === 'number' ? university.Overall.toFixed(1) : 'N/A'}/100</p>
                    <p><strong>Akademik İtibar:</strong> ${typeof university['Academic Reputation'] === 'number' ? university['Academic Reputation'].toFixed(1) : 'N/A'}</p>
                    <p><strong>İşveren İtibarı:</strong> ${typeof university['Employer Reputation'] === 'number' ? university['Employer Reputation'].toFixed(1) : 'N/A'}</p>
                    <p><strong>İstihdam Sonuçları:</strong> ${typeof university['Employment Outcomes'] === 'number' ? university['Employment Outcomes'].toFixed(1) : 'N/A'}</p>
                </div>
            </div>

            <h2 style="color: #E63946; border-bottom: 3px solid #E63946; padding-bottom: 10px; margin-bottom: 20px; font-size: 28px;">
                ${university.Institution} Hakkında
            </h2>
            <p style="line-height: 1.8; font-size: 16px; margin-bottom: 30px;">
                ${content.intro}
            </p>

            <h2 style="color: #E63946; border-bottom: 3px solid #E63946; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 28px;">
                Aranan Öğrenci Profili
            </h2>
            <div style="background: #f9f9f9; border-left: 4px solid #E63946; padding: 20px; margin: 20px 0;">
                <p style="line-height: 1.8;">${content.studentProfile}</p>
            </div>

            <h2 style="color: #E63946; border-bottom: 3px solid #E63946; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 28px;">
                Giriş için Gereken Sınavlar
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #E63946; color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Sınav Türü</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Ortalama Puan</th>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">SAT</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${content.examScores.sat}</td>
                </tr>
                <tr style="background: #f9f9f9;">
                    <td style="padding: 12px; border: 1px solid #ddd;">ACT</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${content.examScores.act}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">TOEFL</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${content.examScores.toefl}</td>
                </tr>
                <tr style="background: #f9f9f9;">
                    <td style="padding: 12px; border: 1px solid #ddd;">IELTS</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">${content.examScores.ielts}</td>
                </tr>
            </table>

            <h2 style="color: #E63946; border-bottom: 3px solid #E63946; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 28px;">
                Extracurricular Aktiviteler
            </h2>
            <p style="line-height: 1.8; font-size: 16px;">
                ${content.extracurricular}
            </p>

            <h2 style="color: #E63946; border-bottom: 3px solid #E63946; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 28px;">
                Finansal Destek
            </h2>
            <div style="background: #f9f9f9; border-left: 4px solid #E63946; padding: 20px; margin: 20px 0;">
                <p style="line-height: 1.8;">${content.financialAid}</p>
            </div>

            <h2 style="color: #E63946; border-bottom: 3px solid #E63946; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 28px;">
                AllAbroad Önerisi
            </h2>
            <div style="background: #f9f9f9; border-left: 4px solid #E63946; padding: 20px; margin: 20px 0;">
                <p style="line-height: 1.8; font-size: 16px;">
                    ${content.finalHighlight}
                </p>
            </div>
        </div>
    </div>

  
    <div class="subfooter-wrapper">
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
    </div>

  <!-- Cookie Consent Banner -->
  <div id="cookie-banner" style="display:none; position:fixed; left:50%; bottom:32px; transform:translateX(-50%); background:#fff; border-radius:18px; box-shadow:0 4px 24px #0003; z-index:9999; padding: 18px 24px; font-family: 'Montserrat', sans-serif; min-width:320px; max-width:95vw;">
    <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:14px;">
      <span style="color:#222; font-size:1rem;">
        AllAbroad, deneyiminizi geliştirmek için çerezler kullanır. Detaylar için <a href="../terms.html" style="color:#E63946; text-decoration:underline;">Kullanım Şartları</a> sayfamıza bakabilirsiniz.
      </span>
      <div style="display:flex; gap:10px;">
        <button id="cookie-accept" style="background:#E63946; color:#fff; border:none; border-radius:8px; padding:7px 18px; font-weight:500; cursor:pointer;">Kabul Et</button>
        <button id="cookie-decline" style="background:#ddd; color:#222; border:none; border-radius:8px; padding:7px 18px; font-weight:500; cursor:pointer;">Reddet</button>
      </div>
    </div>
  </div>

<script>
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    expires = '; expires=' + d.toUTCString();
  }
  document.cookie = name + '=' + (value || '')  + expires + '; path=/';
}
function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function eraseCookie(name) {
  document.cookie = name+'=; Max-Age=-99999999; path=/';
}
document.addEventListener('DOMContentLoaded', function() {
  const banner = document.getElementById('cookie-banner');
  // Only show if not answered before
  if (!getCookie('allabroad_cookie_consent')) {
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
  document.getElementById('cookie-accept').onclick = function() {
    setCookie('allabroad_cookie_consent', 'yes', 365);
    banner.style.display = 'none';
  };
  document.getElementById('cookie-decline').onclick = function() {
    setCookie('allabroad_cookie_consent', 'no', 365);
    banner.style.display = 'none';
  };
});
</script>
<script type="module" src="../auth-ui.js"></script>
</body>
<script src="../script.js"></script>
</html>`;

  return { filename, htmlContent };
}

function getDefaultContent(university) {
  return {
    intro: `${university.Institution}, ${university.Location} konumunda bulunan prestijli bir üniversitesidir. Bu üniversite, birçok alanda akademik üstünlük ile tanınmaktadır ve Türk öğrencileri kabul etmektedir.`,
    studentProfile: `Bu üniversite, akademik mükemmeliyeti ve öğrenci katkısını değerlendiren başvuru sürecine sahiptir. Yüksek sınav puanları ve güçlü akademik arka plan beklenmektedir.`,
    examScores: { sat: '1400+', act: '32+', toefl: '80+', ielts: '6.5+' },
    extracurricular: `Ekstrakurrikuler aktivitelerde başarı göstermek üniversite başvurusunda önemli bir rol oynamaktadır. Spor, sanat, bilim veya sosyal hizmetlerde başarılarınızı vurgulayın.`,
    financialAid: `Bu üniversite, uluslararası öğrencilerin finansal ihtiyaçlarını değerlendirir. Başvurularınızda burs fırsatlarını araştırın.`,
    finalHighlight: `${university.Institution}, Türk öğrencileri kabul edip değerlendiren ve onlara üstün bir eğitim fırsatı sunan prestijli bir kurumdur.`
  };
}

// Main execution
console.log('Starting university page generation for first 150 universities...');

let count = 0;
universitiesJson.slice(0, 150).forEach((university, index) => {
  try {
    const { filename, htmlContent } = generateHTMLPage(university);
    const filepath = path.join(__dirname, 'universities', filename);
    
    fs.writeFileSync(filepath, htmlContent, 'utf-8');
    console.log(`✓ Created (${index + 1}/150): ${filename}`);
    count++;
  } catch (error) {
    console.error(`✗ Error creating page for ${university.Institution}:`, error.message);
  }
});

console.log(`\nGeneration complete! Created ${count} university pages (first 150 only).`);
