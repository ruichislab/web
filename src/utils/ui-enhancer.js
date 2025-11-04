// Utilidades JavaScript para mejorar la experiencia de usuario

class UIEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.addScrollEffects();
    this.addNavigationEffects();
    this.addLoadingStates();
    this.addResponsiveNavigation();
  }

  // Efectos de scroll
  addScrollEffects() {
    // Observador para animaciones al hacer scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });

    // Observar elementos que deben animarse
    document.querySelectorAll('.feature-card, .hero-banner, .contenedor-modulos').forEach(el => {
      observer.observe(el);
    });

    // Efecto parallax sutil en el hero
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      const heroAnimation = document.querySelector('.hero-animation');
      if (heroAnimation) {
        heroAnimation.style.transform = `translateY(${rate}px)`;
      }
    });
  }

  // Efectos de navegación
  addNavigationEffects() {
    // Smooth scroll para navegación interna
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href && href !== '#' && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // Estados de carga
  addLoadingStates() {
    // Añadir loading spinner a botones al hacer click
    document.querySelectorAll('.btn-cyber').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!btn.classList.contains('loading')) {
          btn.classList.add('loading');
          const originalText = btn.innerHTML;
          btn.setAttribute('data-original-text', originalText);
          btn.innerHTML = '<span class="loading-spinner"></span> Cargando...';
          
          // Simular carga (remover en producción real)
          setTimeout(() => {
            btn.classList.remove('loading');
            btn.innerHTML = btn.getAttribute('data-original-text') || originalText;
          }, 1500);
        }
      });
    });
  }

  // Navegación responsive
  addResponsiveNavigation() {
    // Crear botón de menú móvil si no existe
    const nav = document.querySelector('.nav-cyber');
    if (nav && !document.querySelector('.mobile-menu-toggle')) {
      const mobileToggle = document.createElement('button');
      mobileToggle.className = 'mobile-menu-toggle';
      mobileToggle.innerHTML = '☰';
      mobileToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
      `;
      
      nav.parentNode.insertBefore(mobileToggle, nav);
      
      mobileToggle.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
        mobileToggle.innerHTML = nav.classList.contains('nav-open') ? '✕' : '☰';
      });
    }

    // Estilos responsive para navegación
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .mobile-menu-toggle {
          display: block !important;
        }
        
        .nav-cyber {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          transform: translateY(-100%);
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: none;
          border: 1px solid var(--neon-cyan);
          border-radius: var(--border-radius-md);
          margin-top: var(--spacing-sm);
        }
        
        .nav-cyber.nav-open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        
        .nav-list {
          flex-direction: column;
          padding: 1rem;
        }
        
        .nav-text {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Crear efecto ripple en botones
  createRippleEffect(e) {
    const button = e.target.closest('.btn-cyber');
    if (!button) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(0, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    // Añadir keyframes para la animación si no existen
    if (!document.querySelector('#ripple-keyframes')) {
      const keyframes = document.createElement('style');
      keyframes.id = 'ripple-keyframes';
      keyframes.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(keyframes);
    }

    // Solo añadir el ripple si el botón no tiene overflow hidden ya
    if (button.style.position !== 'relative') {
      button.style.position = 'relative';
    }
    if (button.style.overflow !== 'hidden') {
      button.style.overflow = 'hidden';
    }
    
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Notificaciones toast
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--neon-cyan);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-neon-cyan);
      z-index: var(--z-tooltip);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Mostrar toast
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Ocultar toast después de 3 segundos
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}

// Inicializar mejoras de UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.uiEnhancer = new UIEnhancer();
});

// Exportar para uso en otros módulos
window.UIEnhancer = UIEnhancer;
