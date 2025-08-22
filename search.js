
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
              url: `allcountries/${c}`
            }
          : {
              name: c.name,
              file: c.file,
              type: 'Ülke',
              url: `allcountries/${c.file}`
            }
      );
      universityFiles = universities.map(u =>
        typeof u === "string"
          ? {
              name: u.replace(/-/g, ' ').replace(/\.html$/, '').replace(/\b\w/g, l => l.toUpperCase()),
              file: u,
              type: 'Üniversite',
              url: `universities/${u}`
            }
          : {
              name: u.name,
              file: u.file,
              type: 'Üniversite',
              url: `universities/${u.file}`
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
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[â]/g, 'a');
  }

  function getSuggestions(query) {
    if (!query) return [];
    const normQuery = normalize(query.trim());
    function score(item) {
      const n = normalize(item.name);
      if (n === normQuery) return 0;
      if (n.startsWith(normQuery)) return 1;
      if (n.includes(normQuery)) return 2;
      return 3;
    }
    function matchList(list) {
      return list.filter(item => normalize(item.name).includes(normQuery));
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
