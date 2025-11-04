// src/app.js
// Inicialización de la SPA y registro de módulos

const agente = new window.AgenteModular({ contenedor: '#main .content-wrapper', logging: true });

// Registrar módulos principales

agente.registrarModulo('Herramientas Web', {
  templateUrl: 'src/modulos/herramientasweb.html',
  init: (contenedor) => {
    // Forzar ejecución del script IP tras renderizar el módulo
    setTimeout(() => {
      if (typeof fetchIP === 'function') fetchIP();
    }, 150);
  }
});
agente.registrarModulo('Inicio', {
  templateUrl: 'src/modulos/inicio.html',
  init: (contenedor) => {
    // Inicializar efectos interactivos para el módulo inicio
    const actionCards = contenedor.querySelectorAll('.action-card');
    actionCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const moduleName = card.getAttribute('data-modulo');
        if (moduleName) {
          agente.navegarA(moduleName);
        }
      });
    });
    
    // Inicializar botones CTA
    const ctaButtons = contenedor.querySelectorAll('.btn-cyber[data-modulo]');
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const moduleName = btn.getAttribute('data-modulo');
        if (moduleName) {
          agente.navegarA(moduleName);
        }
      });
    });
  }
});

agente.registrarModulo('Filosofia', {
  templateUrl: 'src/modulos/filosofia.html',
  init: (contenedor) => {
    // Inicializar efectos glitch para el módulo filosofía
    const glitchElements = contenedor.querySelectorAll('.glitch');
    glitchElements.forEach(element => {
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
});

agente.registrarModulo('Contacto', {
  templateUrl: 'src/modulos/contacto.html',
  init: (contenedor) => {
    // Cargar servicio de email
    const emailScript = document.createElement('script');
    emailScript.src = 'src/js/email-service.js';
    document.head.appendChild(emailScript);

    // Inicializar formulario de contacto
    const contactForm = contenedor.querySelector('.form-cyber');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Deshabilitar botón mientras se procesa
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span>ENVIANDO...';

        const formData = new FormData(e.target);
        const templateParams = {
          nombre: formData.get('nombre'),
          email: formData.get('email'),
          tipo: formData.get('tipo'),
          mensaje: formData.get('mensaje')
        };

        try {
          // Usar el servicio de email
          setTimeout(async () => {
            const emailService = new EmailService();
            const result = await emailService.sendEmail(templateParams);

            if (result.success) {
              if (result.method === 'mailto') {
                alert('✅ Se ha abierto tu cliente de email con el mensaje preparado.\n\nPor favor, envía el email para completar tu consulta.\n\nTe responderemos en menos de 24 horas.');
              } else if (result.method === 'clipboard') {
                alert('📋 ' + result.message);
              } else {
                alert('✅ ' + result.message + '\n\nTe responderemos en menos de 24 horas.');
              }
              e.target.reset();
            } else {
              if (result.method === 'manual') {
                const userAction = prompt('⚠️ No se pudo enviar automáticamente.\n\nCopia este contenido y envíalo manualmente a ruichislab@gmail.com:\n\n', result.content);
                alert('📧 Por favor, copia el contenido y envíalo manualmente a ruichislab@gmail.com');
              } else {
                alert('❌ Error al enviar el mensaje. Por favor, intenta de nuevo o contacta directamente a ruichislab@gmail.com');
              }
            }

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 500);

        } catch (error) {
          console.error('Error en el formulario:', error);
          alert('❌ Error inesperado. Por favor, contacta directamente a ruichislab@gmail.com');
          
          // Restaurar botón
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }
  }
});

// Módulos de aplicaciones
agente.registrarModulo('Ruichis Lock', {
  templateUrl: 'src/modulos/ruichislock.html',
  init: (contenedor) => {
    // Cargar script específico de Ruichis Lock
    const script = document.createElement('script');
    script.src = 'src/js/ruichislock.js';
    script.onload = () => {
      if (typeof initRuichisLock === 'function') {
        window.ruichisLockInstance = initRuichisLock();
      }
    };
    document.head.appendChild(script);
    
    console.log('Ruichis Lock iniciado');
  },
  cleanup: () => {
    // Limpiar SEO específico al salir del módulo
    if (typeof restoreOriginalSEO === 'function') {
      restoreOriginalSEO();
    }
    
    // Limpiar instancia
    if (window.ruichisLockInstance) {
      window.ruichisLockInstance = null;
    }
    
    console.log('Ruichis Lock cleanup completado');
  }
});




// Navegación desde enlaces con data-modulo
document.addEventListener('click', (e) => {
  const element = e.target.closest('[data-modulo]');
  if (element) {
    e.preventDefault();
    const moduleName = element.getAttribute('data-modulo');
    if (moduleName) {
      agente.navegarA(moduleName);
      
      // Actualizar navegación activa
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      const activeLink = document.querySelector(`[data-modulo="${moduleName}"]`);
      if (activeLink && activeLink.classList.contains('nav-link')) {
        activeLink.classList.add('active');
      }
    }
  }
});

// Inicializar efectos especiales al cargar
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar efectos glitch globales
  const glitchElements = document.querySelectorAll('.glitch');
  glitchElements.forEach(element => {
    const text = element.textContent;
    element.setAttribute('data-text', text);
  });
  
  // Cargar módulo por defecto
  agente.navegarA('Inicio');
  
  // Marcar navegación inicial como activa
  const inicioLink = document.querySelector('[data-modulo="Inicio"]');
  if (inicioLink && inicioLink.classList.contains('nav-link')) {
    inicioLink.classList.add('active');
  }
});

// Exportar agente para uso global
window.agenteModular = agente;
