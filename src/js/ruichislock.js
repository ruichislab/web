// Funcionalidad para Ruichis Lock
class RuichisLockDemo {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startAnimations();
  }

  setupEventListeners() {
    // Botones del demo
    const encryptBtn = document.getElementById('encrypt-btn');
    const decryptBtn = document.getElementById('decrypt-btn');
    const demoText = document.getElementById('demo-text');

    if (encryptBtn) {
      encryptBtn.addEventListener('click', () => {
        this.encryptText();
      });
    }

    if (decryptBtn) {
      decryptBtn.addEventListener('click', () => {
        this.decryptText();
      });
    }

    // Smooth scrolling para botones de demo
    document.querySelectorAll('a[href="#demo"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToDemo();
      });
    });

    // Smooth scrolling para botones de descarga
    document.querySelectorAll('a[href="#download"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToDownload();
      });
    });
  }

  // Simulación de encriptación AES-256
  encryptText() {
    const demoText = document.getElementById('demo-text');
    const demoResult = document.getElementById('demo-result');
    const processTime = document.getElementById('process-time');

    if (!demoText || !demoResult) return;

    const text = demoText.value.trim();
    if (!text) {
      this.showError('Por favor ingresa un texto para encriptar');
      return;
    }

    // Simular tiempo de procesamiento
    const startTime = performance.now();
    
    // Mostrar indicador de carga
    this.showLoading(demoResult);

    setTimeout(() => {
      const encrypted = this.simulateEncryption(text);
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);

      this.showResult(demoResult, encrypted, true);
      processTime.textContent = `${time}ms`;
      
      // Efecto de éxito
      this.showSuccessEffect();
    }, 500 + Math.random() * 1000);
  }

  // Simulación de desencriptación
  decryptText() {
    const demoText = document.getElementById('demo-text');
    const demoResult = document.getElementById('demo-result');
    const processTime = document.getElementById('process-time');

    if (!demoText || !demoResult) return;

    const text = demoText.value.trim();
    if (!text) {
      this.showError('Por favor ingresa un texto encriptado para desencriptar');
      return;
    }

    // Verificar si parece texto encriptado
    if (!this.isEncryptedText(text)) {
      this.showError('El texto no parece estar encriptado con Ruichis Lock');
      return;
    }

    const startTime = performance.now();
    this.showLoading(demoResult);

    setTimeout(() => {
      const decrypted = this.simulateDecryption(text);
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);

      this.showResult(demoResult, decrypted, false);
      processTime.textContent = `${time}ms`;
      
      this.showSuccessEffect();
    }, 300 + Math.random() * 700);
  }

  simulateEncryption(text) {
    // Simular encriptación AES-256
    const base64 = btoa(unescape(encodeURIComponent(text)));
    const scrambled = this.scrambleText(base64);
    return `RL256:${scrambled}`;
  }

  simulateDecryption(text) {
    // Simular desencriptación
    if (text.startsWith('RL256:')) {
      const scrambled = text.substring(6);
      const base64 = this.unscrambleText(scrambled);
      try {
        return decodeURIComponent(escape(atob(base64)));
      } catch (e) {
        return 'Error: Texto encriptado inválido';
      }
    }
    return 'Error: Formato de encriptación no válido';
  }

  scrambleText(text) {
    // Algoritmo simple para "encriptar" visualmente
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + (code % 2 === 0 ? 1 : -1));
    }).join('');
  }

  unscrambleText(text) {
    // Revertir el algoritmo de scramble
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code - (code % 2 === 0 ? -1 : 1));
    }).join('');
  }

  isEncryptedText(text) {
    return text.startsWith('RL256:') && text.length > 10;
  }

  showLoading(container) {
    container.innerHTML = `
      <div class="loading-animation">
        <div class="loading-spinner"></div>
        <p>Procesando con AES-256...</p>
        <div class="loading-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
    `;
  }

  showResult(container, result, isEncrypted) {
    const resultType = isEncrypted ? 'Encriptado' : 'Desencriptado';
    const resultClass = isEncrypted ? 'encrypted' : 'decrypted';
    
    container.innerHTML = `
      <div class="result-content ${resultClass}">
        <div class="result-header">
          <span class="result-type">${resultType} exitosamente</span>
          <div class="result-security">
            <span class="security-level">🛡️ Seguridad Militar</span>
          </div>
        </div>
        <div class="result-text">${result}</div>
        <div class="result-actions">
          <button class="btn-cyber btn-small" onclick="navigator.clipboard.writeText('${result}')">
            <span class="btn-icon">📋</span>
            Copiar
          </button>
        </div>
      </div>
    `;
  }

  showError(message) {
    const demoResult = document.getElementById('demo-result');
    if (demoResult) {
      demoResult.innerHTML = `
        <div class="error-content">
          <div class="error-icon">❌</div>
          <p class="error-message">${message}</p>
        </div>
      `;
    }
  }

  showSuccessEffect() {
    // Efecto visual de éxito
    const demoSection = document.querySelector('.demo-section');
    if (demoSection) {
      demoSection.style.animation = 'successPulse 0.5s ease-in-out';
      setTimeout(() => {
        demoSection.style.animation = '';
      }, 500);
    }
  }

  scrollToDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToDownload() {
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
      downloadSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  startAnimations() {
    // Animaciones de entrada
    this.animateOnScroll();
    this.startContinuousAnimations();
  }

  animateOnScroll() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observar elementos para animación
    document.querySelectorAll('.feature-card, .testimonial-card, .value-item').forEach(el => {
      observer.observe(el);
    });
  }

  startContinuousAnimations() {
    // Efecto de lluvia digital
    this.createDigitalRain();
    
    // Partículas en el fondo
    this.createParticles();
  }

  createDigitalRain() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;

    for (let i = 0; i < 50; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = Math.random() * 100 + '%';
      drop.style.animationDelay = Math.random() * 2 + 's';
      drop.style.animationDuration = (Math.random() * 3 + 2) + 's';
      drop.textContent = Math.random() > 0.5 ? '1' : '0';
      heroBackground.appendChild(drop);
    }
  }

  createParticles() {
    const particles = document.createElement('div');
    particles.className = 'particles';
    document.body.appendChild(particles);

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particles.appendChild(particle);
    }
  }
}

// Función para registrar el módulo
function initRuichisLock() {
  // Cargar SEO específico
  const seoScript = document.createElement('script');
  seoScript.src = 'src/js/ruichislock-seo.js';
  seoScript.onload = () => {
    if (typeof applyRuichisLockSEO === 'function') {
      applyRuichisLockSEO();
    }
  };
  document.head.appendChild(seoScript);
  
  // Cargar estilos específicos
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = 'src/estilos/ruichislock.css';
  document.head.appendChild(linkElement);

  // Inicializar funcionalidad
  const demo = new RuichisLockDemo();
  
  // Agregar eventos de limpieza cuando se cambie de módulo
  window.addEventListener('beforeunload', () => {
    if (typeof restoreOriginalSEO === 'function') {
      restoreOriginalSEO();
    }
  });
  
  // Agregar estilos adicionales inline
  const additionalStyles = `
    <style>
      .loading-animation {
        text-align: center;
        padding: 2rem;
        color: #00ffff;
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 255, 255, 0.3);
        border-top: 3px solid #00ffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      .loading-progress {
        width: 100%;
        height: 4px;
        background: rgba(0, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 1rem;
      }
      
      .progress-bar {
        height: 100%;
        background: #00ffff;
        animation: progressLoad 2s ease-in-out infinite;
      }
      
      .result-content {
        padding: 1.5rem;
        border-radius: 8px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .result-content.encrypted {
        background: rgba(0, 255, 0, 0.1);
        border-color: rgba(0, 255, 0, 0.3);
      }
      
      .result-content.decrypted {
        background: rgba(255, 255, 0, 0.1);
        border-color: rgba(255, 255, 0, 0.3);
      }
      
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .result-type {
        color: #00ffff;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
      }
      
      .security-level {
        color: #ffff00;
        font-size: 0.8rem;
        background: rgba(255, 255, 0, 0.2);
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
      }
      
      .result-text {
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        word-break: break-all;
        line-height: 1.5;
        margin-bottom: 1rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
      }
      
      .result-actions {
        display: flex;
        gap: 1rem;
      }
      
      .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }
      
      .error-content {
        text-align: center;
        padding: 2rem;
        color: #ff4444;
      }
      
      .error-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      
      .error-message {
        font-size: 1rem;
        line-height: 1.5;
      }
      
      .rain-drop {
        position: absolute;
        color: #00ffff;
        font-size: 12px;
        animation: rainFall linear infinite;
        pointer-events: none;
        opacity: 0.7;
      }
      
      .particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }
      
      .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: #00ffff;
        border-radius: 50%;
        animation: particleFloat 8s linear infinite;
      }
      
      .animate-in {
        animation: slideInUp 0.8s ease-out forwards;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes progressLoad {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
      }
      
      @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      @keyframes rainFall {
        0% { transform: translateY(-100vh); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
      
      @keyframes particleFloat {
        0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
        25% { opacity: 1; }
        75% { opacity: 1; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
      }
      
      @keyframes slideInUp {
        0% { transform: translateY(50px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', additionalStyles);
  
  return demo;
}

// Exportar para uso en el sistema modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initRuichisLock };
} else {
  window.initRuichisLock = initRuichisLock;
}
