// cyber-effects.js - Efectos especiales ciberpunk para Ruichis Lab

class CyberEffects {
  constructor() {
    this.init();
  }

  init() {
    this.initGlitchEffect();
    this.initNeonPulse();
    this.initMatrixRain();
    this.initHoverEffects();
    this.initScannerEffect();
  }

  // Efecto glitch para textos
  initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch');
    
    glitchElements.forEach(element => {
      const text = element.textContent;
      element.setAttribute('data-text', text);
      
      // Añadir efecto glitch aleatorio
      setInterval(() => {
        if (Math.random() > 0.95) {
          element.classList.add('glitch-active');
          setTimeout(() => {
            element.classList.remove('glitch-active');
          }, 200);
        }
      }, 100);
    });
  }

  // Efecto pulso neón
  initNeonPulse() {
    const pulseElements = document.querySelectorAll('.neon-pulse');
    
    pulseElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.animation = 'neon-pulse 0.5s ease-in-out';
      });
      
      element.addEventListener('animationend', () => {
        element.style.animation = '';
      });
    });
  }

  // Efecto lluvia matrix
  initMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.1';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charArray = chars.split('');
    
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    setInterval(draw, 33);
  }

  // Efectos hover avanzados
  initHoverEffects() {
    const hoverElements = document.querySelectorAll('.cyber-hover');
    
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        this.createRipple(e, element);
      });
    });
  }

  // Crear efecto ripple
  createRipple(event, element) {
    const circle = document.createElement('span');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - element.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - element.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = element.getElementsByClassName('ripple')[0];
    
    if (ripple) {
      ripple.remove();
    }
    
    element.appendChild(circle);
    
    setTimeout(() => {
      circle.remove();
    }, 600);
  }

  // Efecto scanner
  initScannerEffect() {
    const scannerLine = document.createElement('div');
    scannerLine.className = 'scanner-line';
    scannerLine.style.position = 'fixed';
    scannerLine.style.top = '0';
    scannerLine.style.left = '0';
    scannerLine.style.width = '100%';
    scannerLine.style.height = '2px';
    scannerLine.style.background = 'linear-gradient(90deg, transparent, #00ffff, transparent)';
    scannerLine.style.zIndex = '9999';
    scannerLine.style.pointerEvents = 'none';
    scannerLine.style.opacity = '0.7';
    
    document.body.appendChild(scannerLine);
    
    const animateScanner = () => {
      scannerLine.style.transform = 'translateY(0)';
      scannerLine.style.transition = 'transform 3s linear';
      
      setTimeout(() => {
        scannerLine.style.transform = `translateY(${window.innerHeight}px)`;
      }, 100);
      
      setTimeout(animateScanner, 5000);
    };
    
    setTimeout(animateScanner, 2000);
  }

  // Efecto typing para textos
  static typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    
    type();
  }

  // Efecto scramble para textos
  static scrambleText(element, finalText, duration = 1000) {
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let frame = 0;
    const frames = duration / 16;
    
    const animate = () => {
      let scrambled = '';
      for (let i = 0; i < finalText.length; i++) {
        if (frame / frames > i / finalText.length) {
          scrambled += finalText[i];
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      element.textContent = scrambled;
      frame++;
      
      if (frame < frames) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalText;
      }
    };
    
    animate();
  }
}

// Inicializar efectos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new CyberEffects();
});

// Exportar para uso externo
window.CyberEffects = CyberEffects;
