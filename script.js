document.addEventListener('DOMContentLoaded', function() {
  // Ensure auth UI module is present on pages that include script.js but might not include auth-ui.js
  (function ensureAuthUiLoaded() {
    try {
      const already = Array.from(document.querySelectorAll('script')).some(s => s.src && s.src.endsWith('auth-ui.js'));
      if (already) return;
      const mod = document.createElement('script');
      mod.type = 'module';
      // Using absolute path so pages in subfolders still load the root auth-ui.js
      mod.src = '/auth-ui.js';
      mod.async = true;
      document.head.appendChild(mod);
    } catch (e) {
      // non-fatal
    }
  })();
    // Hamburger menu functionality
    const hamburgerContainer = document.querySelector('.hamburger-container');
    let menuTimeout;
    
  if (hamburgerContainer) {
    // keep a reference to the menu panel for both hover and click handlers
    const menuPanel = hamburgerContainer.querySelector('.menu-panel');

    hamburgerContainer.addEventListener('mouseenter', () => {
      clearTimeout(menuTimeout);
      if (menuPanel) {
        menuPanel.style.opacity = '1';
        menuPanel.style.visibility = 'visible';
        menuPanel.style.transform = 'translateY(0)';
      }
    });

    hamburgerContainer.addEventListener('mouseleave', () => {
      if (!menuPanel) return;
      menuTimeout = setTimeout(() => {
        menuPanel.style.opacity = '0';
        menuPanel.style.visibility = 'hidden';
        menuPanel.style.transform = 'translateY(-10px)';
      }, 300);
    });

    if (menuPanel) {
      menuPanel.addEventListener('mouseenter', () => {
        clearTimeout(menuTimeout);
      });

      menuPanel.addEventListener('mouseleave', () => {
        menuTimeout = setTimeout(() => {
          menuPanel.style.opacity = '0';
          menuPanel.style.visibility = 'hidden';
          menuPanel.style.transform = 'translateY(-10px)';
        }, 300);
      });
    }
  }

  // Mobile-specific behavior: toggle menu on click (keep existing hover behavior for desktop)
  const hamburgerBtn = document.querySelector('.hamburger-icon');
  if (hamburgerBtn && hamburgerContainer) {
    // re-query menuPanel to ensure it's available in this scope
    const menuPanel = hamburgerContainer.querySelector('.menu-panel');
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerContainer.classList.toggle('open');
      if (menuPanel) menuPanel.setAttribute('aria-hidden', hamburgerContainer.classList.contains('open') ? 'false' : 'true');
      // when opening on mobile, ensure login button is inside menu
      if (hamburgerContainer.classList.contains('open')) {
        const loginBtn = document.querySelector('.login-btn');
        const existingMobile = menuPanel && menuPanel.querySelector('.login-btn-mobile');
        if (!existingMobile && loginBtn && menuPanel) {
          const clone = loginBtn.cloneNode(true);
          clone.classList.add('login-btn-mobile');
          clone.classList.remove('login-btn');
          // adjust hrefs for relative paths when menu is in different folder
          menuPanel.insertBefore(clone, menuPanel.firstChild);
        }
      }
    });

    // keyboard activation for accessibility (Enter/Space)
    hamburgerBtn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        hamburgerBtn.click();
      }
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburgerContainer.contains(e.target)) {
        hamburgerContainer.classList.remove('open');
      }
    });
  }

  // Expandable mobile search
  document.querySelectorAll('.search-box').forEach(sb => {
    const icon = sb.querySelector('.search-icon');
    const input = sb.querySelector('input');
    if (!icon || !input) return;

    icon.addEventListener('click', (e) => {
      // toggle expanded only on small screens
      if (window.innerWidth <= 420) {
        const expanded = sb.classList.toggle('expanded');
        if (expanded) {
          input.focus();
        } else {
          input.blur();
        }
      } else {
        input.focus();
      }
    });

    // collapse on escape or when clicking outside
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') sb.classList.remove('expanded');
    });
    document.addEventListener('click', (ev) => {
      if (!sb.contains(ev.target)) sb.classList.remove('expanded');
    });
  });

    // Map functionality
    const tooltip = document.getElementById('country-tooltip');
    const width = 1200;
    const height = 700;
    
    // Debug: Check if map container exists
    console.log("Map container:", document.getElementById('world-map'));

    const worldMap = document.getElementById('world-map');
    if (worldMap) {
        const svg = d3.select("#world-map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        const g = svg.append("g");
        
        const projection = d3.geoNaturalEarth1()
            .scale(width / 5)
            .translate([width / 2, height / 2]);
        
        const path = d3.geoPath().projection(projection);
        
        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                // Only allow panning if zoomed in (scale > 1)
                if (event.transform.k === 1) {
                    // Reset any translation if at original scale
                    event.transform.x = 0;
                    event.transform.y = 0;
                }
                g.attr("transform", event.transform);
            });
        
        svg.call(zoom);
        
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
            const countries = topojson.feature(data, data.objects.countries).features
                .filter(d => d.properties.name !== 'Antarctica'); // Explicitly filter out Antarctica
            g.selectAll(".country")
                .data(countries)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", path)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", "#E63946");
                    if (tooltip) {
                        tooltip.textContent = d.properties.name;
                        tooltip.style.opacity = '1';
                        tooltip.style.left = `${event.clientX}px`;
                        tooltip.style.top = `${event.clientY - 30}px`;
                    }
                })
                .on("mouseout", function() {
                    d3.select(this).attr("fill", "#f0f0f0");
                    if (tooltip) tooltip.style.opacity = '0';
                })
                .on("mousemove", function(event) {
                    if (tooltip) {
                        tooltip.style.left = `${event.clientX}px`;
                        tooltip.style.top = `${event.clientY - 30}px`;
                    }
                })
                // Country click navigation country list el importante 11111111
                .on("click", function(event, d) {
                    const countryPages = {
                        "Germany": "allcountries/germany.html",
                        "France": "allcountries/france.html",
                        "United States of America": "allcountries/united-states-of-america.html",
                        "Turkey": "allcountries/turkey.html",
                        "Japan": "allcountries/japan.html",
                        "United Kingdom": "allcountries/UK.html",
                        "Italy": "allcountries/italy.html",
                        "Spain": "allcountries/spain.html",
                        "Canada": "allcountries/canada.html",
                        "Australia": "allcountries/australia.html",
                        "Netherlands": "allcountries/netherlands.html",
                        "Sweden": "allcountries/sweden.html",
                        "Switzerland": "allcountries/switzerland.html",
                        "Belgium": "allcountries/belgium.html",
                        "South Korea": "allcountries/south-korea.html",
                        "China": "allcountries/china.html",
                        "Russia": "allcountries/russia.html",
                        "Austria": "allcountries/austria.html",
                        "Poland": "allcountries/poland.html",
                        "Hungary": "allcountries/hungary.html",
                        "United Arab Emirates": "allcountries/uae.html"
                    };
                    const countryName = d.properties.name;
                    if (countryPages[countryName]) {
                        window.location.href = countryPages[countryName];
                    } else {
                        // window.location.href = "continents.html";
                    }
                });

            d3.select(".zoom-in").on("click", () => {
                svg.transition().duration(300).call(zoom.scaleBy, 1.5);
            });
            
            d3.select(".zoom-out").on("click", () => {
                svg.transition().duration(300).call(zoom.scaleBy, 0.75);
            });
            
            d3.select(".reset").on("click", () => {
                svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
            });
        });
    }
});
//NEWS DATA NEWS DATA ANLADIN MI GARİ new NEWS NEWS NEWSSSS NEWS NEWS NEWSSSSS
const newsData = [
  {
    title: "AP Sınavları Hk.",
    description: "2026 AP Sınavları hakkında güncel gelişmeler",
    category: "Eğitim Haberleri",
    date:"January 13, 2026",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    url: "https://www.hurriyet.com.tr/yazarlar/ebru-dogdu/turkiyede-ap-krizi-cozuldu-mu-42965811",
  },
    {
        title: "Önemli Duyuru",
        description: "Bu websitesi geliştirme aşamasındadır.",
        category: "DUYURU",
        date: "June 10, 2025",
        image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        url: "allabroadedu.com"
    },
    {
        title: "Erasmus+ Scholarship Guide",
        description: "Complete guide to 2024 Erasmus+ opportunities for Turkish students",
        category: "Scholarships",
        date: "June 15, 2024",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
        url: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students"
    },
    {
        title: "Study in Germany Updates",
        description: "Latest visa requirements and university application deadlines",
        category: "Visa News",
        date: "June 12, 2024",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        url: "https://www.daad.de/en/study-and-research-in-germany/"
    },
    {
        title: "US University Rankings 2024",
        description: "QS World University Rankings just released - see the top schools",
        category: "Rankings",
        date: "June 10, 2024",
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
        url: "https://www.topuniversities.com/university-rankings"
    },
    {
        title: "UK Student Visa Changes",
        description: "New policies affecting international students in the UK",
        category: "Visa News",
        date: "June 8, 2024",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
        url: "https://www.gov.uk/student-visa"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize News Slider
    initNewsSlider();
});

function initNewsSlider() {
    const slider = document.getElementById('news-slider');
    
    // Generate news cards
    newsData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('data-url', item.url);
        card.innerHTML = `
            <div class="news-image" style="background-image: url('${item.image}')">
                <div class="news-category">${item.category}</div>
            </div>
            <div class="news-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="news-footer">
                    <span class="news-date"><i class="far fa-calendar-alt"></i> ${item.date}</span>
                    <span class="read-more">Read More <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.open(item.url, '_blank');
        });
        
        slider.appendChild(card);
    });

    // Slider navigation
    let currentIndex = 0;
    const cards = document.querySelectorAll('.news-card');
    const cardWidth = cards[0].offsetWidth + 30;
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - 3;
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 3) {
            currentIndex++;
            updateSlider();
        }
    });

    updateSlider();

    // Show URL tooltip in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        
        const style = document.createElement('style');
        style.textContent = `
            .news-card:hover::after {
                content: attr(data-url);
                position: absolute;
                bottom: -25px;
                left: 0;
                font-size: 10px;
                color: #666;
                background: #f8f8f8;
                padding: 2px 5px;
                border-radius: 3px;
                width: 100%;
                box-sizing: border-box;
            }
        `;
        document.head.appendChild(style);
    }
}


//SEARCH BAR FUNCTION EEEY KENDRICK LAMAR IDK

// --- REWRITTEN SEARCH BAR LOGIC FOR RELIABILITY ---
(function () {
  let countryFiles = [];
  let universityFiles = [];
  let searchLoaded = false;

  async function loadSearchFiles() {
    if (searchLoaded) return;
    try {
      // Try both relative and absolute paths for local/prod
      function tryFetch(paths) {
        return new Promise((resolve, reject) => {
          let i = 0;
          function next() {
            if (i >= paths.length) return reject();
            fetch(paths[i])
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(resolve)
              .catch(() => { i++; next(); });
          }
          next();
        });
      }
      const [countries, universities] = await Promise.all([
        tryFetch(['allcountries/list.json', '/allcountries/list.json']),
        tryFetch(['universities/list.json', '/universities/list.json'])
      ]);
      countryFiles = countries.map(c =>
        typeof c === "string"
          ? {
              name: c.replace(/-/g, ' ').replace(/\.html$/, '').replace(/\b\w/g, l => l.toUpperCase()),
              file: c,
              type: 'Ülke',
              url: `allcountries/${c}`,
              searchTerms: c.replace(/-/g, ' ').replace(/\.html$/, '').toLowerCase()
            }
          : {
              name: c.name,
              file: c.file,
              type: 'Ülke',
              url: `allcountries/${c.file}`,
              searchTerms: (c.name + ' ' + c.file).toLowerCase().replace(/-/g, ' ').replace(/\.html$/, '')
            }
      );
      universityFiles = universities.map(u =>
        typeof u === "string"
          ? {
              name: u.replace(/-/g, ' ').replace(/\.html$/, '').replace(/\b\w/g, l => l.toUpperCase()),
              file: u,
              type: 'Üniversite',
              url: `universities/${u}`,
              searchTerms: u.replace(/-/g, ' ').replace(/\.html$/, '').toLowerCase()
            }
          : {
              name: u.name,
              file: u.file,
              type: 'Üniversite',
              url: `universities/${u.file}`,
              searchTerms: (u.name + ' ' + u.file).toLowerCase().replace(/-/g, ' ').replace(/\.html$/, '')
            }
      );
      searchLoaded = true;
    } catch (e) {
      countryFiles = [];
      universityFiles = [];
    }
  }

  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/i/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[â]/g, 'a')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getSuggestions(query) {
    if (!query) return [];
    const normQuery = normalize(query.trim());
    
    function score(item) {
      const n = normalize(item.name);
      const st = normalize(item.searchTerms || '');
      
      // Check both name and searchTerms
      const nameMatch = n.includes(normQuery) || n.split(' ').some(w => w.startsWith(normQuery));
      const searchMatch = st.includes(normQuery) || st.split(' ').some(w => w.startsWith(normQuery));
      
      if (!nameMatch && !searchMatch) return 999;
      
      // Exact match
      if (n === normQuery || st === normQuery) return 0;
      // Starts with (best prefix match)
      if (n.startsWith(normQuery) || st.startsWith(normQuery)) return 1;
      // Word starts with query
      const words = (n + ' ' + st).split(' ');
      if (words.some(w => w.startsWith(normQuery))) return 2;
      // Includes somewhere in the middle
      if (n.includes(normQuery) || st.includes(normQuery)) return 3;
      return 4;
    }
    
    function matchList(list) {
      return list.filter(item => {
        const n = normalize(item.name);
        const st = normalize(item.searchTerms || '');
        // Match if query appears in name or searchTerms
        return (n.includes(normQuery) || n.split(' ').some(w => w.startsWith(normQuery))) ||
               (st.includes(normQuery) || st.split(' ').some(w => w.startsWith(normQuery)));
      });
    }
    
    const countryMatches = matchList(countryFiles).sort((a, b) => score(a) - score(b)).slice(0, 5);
    const universityMatches = matchList(universityFiles).sort((a, b) => score(a) - score(b)).slice(0, 5);
    return [...countryMatches, ...universityMatches].slice(0, 5);
  }

  function getIcon(type) {
    if (type === 'Ülke') {
      return `<span class="search-icon-suggestion" style="color:#457b9d;"><i class="fas fa-globe-europe"></i></span>`;
    }
    if (type === 'Üniversite') {
      return `<span class="search-icon-suggestion" style="color:#E63946;"><i class="fas fa-university"></i></span>`;
    }
    return '';
  }

  function highlightMatch(name, query) {
    if (!query) return name;
    const regex = new RegExp(`(${escapeReg(query)})`, 'gi');
    return name.replace(regex, '<mark>$1</mark>');
  }
  function escapeReg(s) {
    return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  }

  function setupSearchBox() {
    document.querySelectorAll('.search-box').forEach(searchBox => {
      const input = searchBox.querySelector('input[type="text"]');
      if (!input) return;

      let suggestionBox = searchBox.querySelector('.search-suggestions');
      if (!suggestionBox) {
        suggestionBox = document.createElement('div');
        suggestionBox.className = 'search-suggestions';
        suggestionBox.innerHTML = '<ul></ul>';
        searchBox.appendChild(suggestionBox);
      }
      const ul = suggestionBox.querySelector('ul');

      let activeIdx = -1;
      let suggestions = [];

      // Show suggestions on input
      input.addEventListener('input', async function () {
        await loadSearchFiles();
        const val = input.value.trim();
        suggestions = getSuggestions(val);
        ul.innerHTML = '';
        activeIdx = -1;
        if (val && suggestions.length > 0) {
          suggestions.forEach((s, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `
              ${getIcon(s.type)}
              <span class="search-suggest-name">${highlightMatch(s.name, val)}</span>
            `;
            li.tabIndex = 0;
            li.className = 'search-suggestion-item';
            li.addEventListener('mousedown', function (e) {
              e.preventDefault();
              window.location.href = s.url;
            });
            li.addEventListener('click', function (e) {
              e.preventDefault();
              window.location.href = s.url;
            });
            li.addEventListener('mouseenter', function () {
              setActive(idx);
            });
            li.addEventListener('mouseleave', function () {
              setActive(-1);
            });
            ul.appendChild(li);
          });
          suggestionBox.style.display = 'block';
        } else if (val) {
          const li = document.createElement('li');
          li.className = 'no-results';
          li.innerHTML = `<span style="color:#888;">Sonuç bulunamadı</span>`;
          ul.appendChild(li);
          suggestionBox.style.display = 'block';
        } else {
          suggestionBox.style.display = 'none';
        }
      });

      // Keyboard navigation
      input.addEventListener('keydown', function (e) {
        if (suggestionBox.style.display !== 'block') return;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIdx = Math.min(activeIdx + 1, suggestions.length - 1);
          updateActive();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIdx = Math.max(activeIdx - 1, 0);
          updateActive();
        } else if (e.key === 'Enter') {
          if (activeIdx >= 0 && suggestions[activeIdx]) {
            window.location.href = suggestions[activeIdx].url;
            suggestionBox.style.display = 'none';
            e.preventDefault();
          }
        } else if (e.key === 'Escape') {
          suggestionBox.style.display = 'none';
        }
      });

      function setActive(idx) {
        activeIdx = idx;
        updateActive();
      }
      function updateActive() {
        Array.from(ul.children).forEach((li, idx) => {
          li.classList.toggle('active', idx === activeIdx);
        });
      }

      // Hide suggestions when clicking outside
      document.addEventListener('mousedown', function (e) {
        if (!searchBox.contains(e.target)) {
          suggestionBox.style.display = 'none';
        }
      });

      // Always show suggestions when input is focused and has value
      input.addEventListener('focus', async function () {
        if (input.value.trim()) {
          await loadSearchFiles();
          const val = input.value.trim();
          suggestions = getSuggestions(val);
          ul.innerHTML = '';
          activeIdx = -1;
          if (suggestions.length > 0) {
            suggestions.forEach((s, idx) => {
              const li = document.createElement('li');
              li.innerHTML = `
                ${getIcon(s.type)}
                <span class="search-suggest-name">${highlightMatch(s.name, val)}</span>
              `;
              li.tabIndex = 0;
              li.className = 'search-suggestion-item';
              li.addEventListener('mousedown', function (e) {
                e.preventDefault();
                window.location.href = s.url;
              });
              li.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = s.url;
              });
              li.addEventListener('mouseenter', function () {
                setActive(idx);
              });
              li.addEventListener('mouseleave', function () {
                setActive(-1);
              });
              ul.appendChild(li);
            });
            suggestionBox.style.display = 'block';
          } else {
            suggestionBox.style.display = 'none';
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupSearchBox);
})();
