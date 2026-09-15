/* ══════════════════════════════════════════════════════════════
   COURS FULLSTACK CIEL — ADRIEL
   JavaScript partagé entre toutes les pages
   ══════════════════════════════════════════════════════════════ */

// ── GESTION DU THÈME ─────────────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-btn i');
  const text = document.querySelector('.theme-btn span');
  if (icon && text) {
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
      text.textContent = 'Mode clair';
    } else {
      icon.className = 'fas fa-moon';
      text.textContent = 'Mode sombre';
    }
  }
}

// ── INDICATEUR DE SCROLL ─────────────────────────────────────────
function updateScrollIndicator() {
  const indicator = document.getElementById('scroll-indicator');
  if (!indicator) return;
  
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  
  indicator.style.width = scrollPercent + '%';
}

// ── BOUTON RETOUR EN HAUT ────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── COPIER LE CODE ───────────────────────────────────────────────
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.code-block').querySelector('pre');
      const code = pre.textContent;
      
      try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.textContent;
        btn.textContent = 'copié !';
        btn.style.background = 'var(--accent)';
        btn.style.color = '#000';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Erreur copie:', err);
        btn.textContent = 'erreur';
      }
    });
  });
}

// ── MENU MOBILE ──────────────────────────────────────────────────
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  
  if (!menuBtn || !sidebar) return;
  
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    menuBtn.innerHTML = sidebar.classList.contains('open') 
      ? '<i class="fas fa-times"></i>' 
      : '<i class="fas fa-bars"></i>';
  });
  
  // Fermer le menu en cliquant en dehors
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

// ── LIENS ACTIFS DANS LA SIDEBAR ─────────────────────────────────
function updateActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('#sidebar nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ── PROGRESSION DE LECTURE ───────────────────────────────────────
function updateProgress() {
  const progressFill = document.querySelector('.progress-fill');
  if (!progressFill) return;
  
  // Calculer la progression basée sur les chapitres lus
  const chapters = document.querySelectorAll('.chapter');
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  let chaptersRead = 0;
  
  chapters.forEach(chapter => {
    const rect = chapter.getBoundingClientRect();
    if (rect.top < windowHeight * 0.5) {
      chaptersRead++;
    }
  });
  
  const progress = chapters.length > 0 
    ? (chaptersRead / chapters.length) * 100 
    : 0;
  
  progressFill.style.width = progress + '%';
}

// ── DÉMOS INTERACTIVES ───────────────────────────────────────────
function initDemos() {
  // Demo Variables
  const runBtn1 = document.querySelector('[data-demo="variables"]');
  if (runBtn1) {
    runBtn1.addEventListener('click', () => {
      const output = document.getElementById('out1');
      let nom = 'Alice';
      let age = 17;
      let moyenne = 13.5;
      let majeur = false;
      const PI = 3.14159;
      
      nom = 'Bob';
      
      output.innerHTML = `
        <span style="color: var(--muted)">// Résultats :</span>
        <br>nom = <span style="color: var(--str)">"${nom}"</span>
        <br>age = <span style="color: var(--num)">${age}</span>
        <br>moyenne = <span style="color: var(--num)">${moyenne}</span>
        <br>majeur = <span style="color: var(--kw)">${majeur}</span>
        <br>PI = <span style="color: var(--num)">${PI}</span>
        <br>typeof nom = <span style="color: var(--str)">"${typeof nom}"</span>
      `;
      output.classList.remove('empty');
    });
  }
  
  // Demo Boucles (tables de multiplication)
  const runBtn4 = document.querySelector('[data-demo="boucles"]');
  if (runBtn4) {
    runBtn4.addEventListener('click', () => {
      const output = document.getElementById('out4');
      let result = '';
      
      for (let i = 1; i <= 5; i++) {
        result += `<span style="color: var(--accent)">Table de ${i} :</span> `;
        for (let j = 1; j <= 5; j++) {
          result += `${i}×${j}=<span style="color: var(--num)">${i*j}</span>  `;
        }
        result += '<br>';
      }
      
      output.innerHTML = result;
      output.classList.remove('empty');
    });
  }
  
  // Demo Fonctions
  const runBtn5 = document.querySelector('[data-demo="fonctions"]');
  if (runBtn5) {
    runBtn5.addEventListener('click', () => {
      const output = document.getElementById('out5');
      
      function calculerMoyenne(notes) {
        const somme = notes.reduce((acc, n) => acc + n, 0);
        return somme / notes.length;
      }
      
      const mesNotes = [12, 15, 8, 17, 14];
      const moyenne = calculerMoyenne(mesNotes);
      
      output.innerHTML = `
        <span style="color: var(--muted)">// Notes : [${mesNotes.join(', ')}]</span>
        <br>Moyenne calculée : <span style="color: var(--num)">${moyenne.toFixed(2)}</span>
        <br>Résultat : <span style="color: var(--accent)">${moyenne >= 10 ? 'Admis ✓' : 'Ajourné ✗'}</span>
      `;
      output.classList.remove('empty');
    });
  }
  
  // Demo DOM
  const runBtn6 = document.querySelector('[data-demo="dom"]');
  if (runBtn6) {
    runBtn6.addEventListener('click', () => {
      const output = document.getElementById('out6');
      output.innerHTML = `
        <span style="color: var(--accent)">★ Bienvenue sur cette page !</span>
        <br><span style="color: var(--muted)">Le DOM a été manipulé avec succès.</span>
        <br><span style="color: var(--str)">Date actuelle : ${new Date().toLocaleDateString('fr-FR')}</span>
      `;
      output.classList.remove('empty');
    });
  }
}

// ── ANIMATION D'ENTRÉE ───────────────────────────────────────────
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.chapter, .card, .retenir').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ── CALCULATEUR LOI D'OHM ────────────────────────────────────────
function initOhmCalculator() {
  const calculator = document.getElementById('ohm-calculator');
  if (!calculator) return;
  
  const inputs = calculator.querySelectorAll('input');
  const resultDiv = calculator.querySelector('.calc-result');
  
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const U = parseFloat(calculator.querySelector('[data-var="U"]')?.value) || null;
      const I = parseFloat(calculator.querySelector('[data-var="I"]')?.value) || null;
      const R = parseFloat(calculator.querySelector('[data-var="R"]')?.value) || null;
      
      let result = '';
      
      if (U && I && !R) {
        const calcR = U / I;
        result = `R = U / I = ${U} / ${I} = <span class="result-value">${calcR.toFixed(2)} Ω</span>`;
      } else if (U && R && !I) {
        const calcI = U / R;
        result = `I = U / R = ${U} / ${R} = <span class="result-value">${(calcI * 1000).toFixed(2)} mA</span>`;
      } else if (I && R && !U) {
        const calcU = I * R;
        result = `U = R × I = ${R} × ${I} = <span class="result-value">${calcU.toFixed(2)} V</span>`;
      } else {
        result = '<span style="color: var(--muted)">Entrez 2 valeurs pour calculer la 3ème</span>';
      }
      
      if (resultDiv) resultDiv.innerHTML = result;
    });
  });
}

// ── FONCTION DE RECHERCHE ────────────────────────────────────────
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  // Données de recherche : titre et URL des pages
  const searchData = [
    { title: 'Introduction', keywords: ['accueil', 'introduction', 'présentation', 'bienvenue', 'ciel'], url: 'index.html' },
    { title: 'HTML Complet', keywords: ['html', 'balises', 'structure', 'web', 'page'], url: 'html-complet.html' },
    { title: 'CSS Complet', keywords: ['css', 'style', 'design', 'couleurs', 'mise en forme'], url: 'css-complet.html' },
    { title: 'JavaScript', keywords: ['javascript', 'js', 'dom', 'événements', 'interactivité'], url: 'javascript.html' },
    { title: 'Python & Flask', keywords: ['python', 'flask', 'backend', 'api', 'serveur'], url: 'python-flask.html' },
    { title: 'MySQL', keywords: ['mysql', 'sql', 'base de données', 'bdd', 'requêtes'], url: 'mysql.html' },
    { title: 'Projet Full Stack', keywords: ['fullstack', 'projet', 'complet', 'application'], url: 'projet-fullstack.html' },
    { title: 'Bases Électronique', keywords: ['électronique', 'ohm', 'tension', 'courant', 'résistance'], url: 'electronique-bases.html' },
    { title: 'Composants', keywords: ['composants', 'résistance', 'condensateur', 'transistor', 'led'], url: 'composants.html' },
    { title: 'Arduino & ESP32', keywords: ['arduino', 'esp32', 'microcontrôleur', 'iot', 'wifi'], url: 'arduino.html' },
    { title: 'Raspberry Pi', keywords: ['raspberry', 'pi', 'gpio', 'python', 'capteurs'], url: 'raspberry-pi.html' },
    { title: 'Capteurs & Actionneurs', keywords: ['capteurs', 'actionneurs', 'dht11', 'moteurs', 'température'], url: 'capteurs.html' },
    { title: 'Maintenance Électronique', keywords: ['maintenance', 'réparation', 'diagnostic', 'dépannage', 'multimètre'], url: 'maintenance-electronique.html' },
    { title: 'Réseau Informatique', keywords: ['réseau', 'tcp', 'ip', 'osi', 'routeur', 'switch'], url: 'reseau-informatique.html' },
    { title: 'Cybersécurité', keywords: ['sécurité', 'cyber', 'hacking', 'chiffrement', 'firewall'], url: 'cybersecurite.html' },
    { title: 'VS Code', keywords: ['vscode', 'éditeur', 'code', 'ide', 'extensions'], url: 'vscode.html' },
    { title: 'Git & GitHub', keywords: ['git', 'github', 'version', 'commit', 'branches'], url: 'git.html' },
    { title: '.venv Python', keywords: ['venv', 'environnement', 'virtuel', 'pip', 'requirements'], url: 'venv.html' }
  ];
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length === 0) {
      hideSearchResults();
      return;
    }
    
    // Filtrer les résultats
    const results = searchData.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(query));
      return titleMatch || keywordMatch;
    });
    
    displaySearchResults(results);
  });
  
  // Fermer les résultats en cliquant ailleurs
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      hideSearchResults();
    }
  });
}

function displaySearchResults(results) {
  let resultsContainer = document.getElementById('searchResults');
  
  // Créer le conteneur s'il n'existe pas
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'searchResults';
    resultsContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-top: 8px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
    `;
    document.querySelector('.search-container').style.position = 'relative';
    document.querySelector('.search-container').appendChild(resultsContainer);
  }
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div style="padding: 16px; color: var(--muted); text-align: center; font-size: 13px;">
        Aucun résultat trouvé
      </div>
    `;
    resultsContainer.style.display = 'block';
    return;
  }
  
  resultsContainer.innerHTML = results.map(item => `
    <a href="${item.url}" style="
      display: block;
      padding: 12px 16px;
      color: var(--text);
      text-decoration: none;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      transition: background 0.2s;
    " onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='transparent'">
      <i class="fas fa-book" style="margin-right: 8px; color: var(--accent);"></i>
      ${item.title}
    </a>
  `).join('');
  
  resultsContainer.style.display = 'block';
}

function hideSearchResults() {
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }
}

// ── INITIALISATION GLOBALE ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackToTop();
  initCopyButtons();
  initMobileMenu();
  updateActiveLink();
  initDemos();
  initAnimations();
  initOhmCalculator();
  initSearch();
  
  // Event listeners
  window.addEventListener('scroll', () => {
    updateScrollIndicator();
    updateProgress();
  });
  
  // Theme toggle button
  const themeBtn = document.querySelector('.theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
  
  // Initial calls
  updateScrollIndicator();
  updateProgress();
});

// ── EXPORT POUR UTILISATION EXTERNE ──────────────────────────────
window.CoursCIEL = {
  toggleTheme,
  initTheme
};
