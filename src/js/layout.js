document.addEventListener('DOMContentLoaded', function() {
  const headerHTML = `
    <div class="container">
      <a href="/" class="logo-cyber">
        <img src="/src/assets/ruichis_logo.png" alt="Ruichis Lab Logo" class="logo-img">
      </a>
      <nav class="nav-cyber">
        <ul class="nav-list">
          <li><a href="/" class="nav-link"><span class="nav-icon">⚡</span><span class="nav-text">INICIO</span></a></li>
          <li><a href="/pages/ruichis-lock.html" class="nav-link"><span class="nav-icon">🔒</span><span class="nav-text">RUICHIS LOCK</span></a></li>
          <li><a href="/pages/filosofia.html" class="nav-link"><span class="nav-icon">🧠</span><span class="nav-text">FILOSOFÍA</span></a></li>
          <li><a href="/pages/godot-plugin.html" class="nav-link"><span class="nav-icon">🎮</span><span class="nav-text">FRAMEWORK GODOT</span></a></li>
          <li><a href="/pages/enciclopedia.html" class="nav-link"><span class="nav-icon">📚</span><span class="nav-text">ENCICLOPEDIA IA</span></a></li>
          <li><a href="/pages/contacto.html" class="nav-link"><span class="nav-icon">📬</span><span class="nav-text">CONTACTO</span></a></li>
          <li><a href="/pages/herramientas.html" class="nav-link"><span class="nav-icon">🛠️</span><span class="nav-text">HERRAMIENTAS WEB</span></a></li>
        </ul>
      </nav>
    </div>
  `;

  const footerHTML = `
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>RUICHIS LAB</h3>
          <p>Soluciones de tecnología modular para Windows</p>
        </div>
        <div class="footer-section">
          <h3>CONTACTO</h3>
          <p>info@ruichislab.com</p>
          <p>Bogotá, Colombia</p>
        </div>
        <div class="footer-section">
          <h3>REDES</h3>
          <div class="social-links">
            <a href="https://github.com/ruichislab/" class="social-link github-link" target="_blank" rel="noopener noreferrer">
              <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Ruichis Lab. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  document.querySelector('.header-cyber').innerHTML = headerHTML;
  document.querySelector('.footer-cyber').innerHTML = footerHTML;
});
