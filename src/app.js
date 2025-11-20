// src/app.js
// Inicialización de la SPA y registro de módulos

const agente = new window.AgenteModular({ contenedor: '#main .content-wrapper', logging: true });

// Registrar módulos principales

agente.registrarModulo('Herramientas Web', {
  templateUrl: 'src/modulos/herramientasweb.html',
  init: (contenedor) => {
    actualizarSEO('Herramientas Web | Ruichis Lab', 'Descubre tu dirección IP pública y otras herramientas de red con las utilidades online de Ruichis Lab.');

    const scriptId = 'ip-tool-logic';
    const scriptSrc = 'src/js/herramientasweb.js';

    // Función para cargar y ejecutar el script.
    const cargarYEjecutarScript = () => {
      // Si el script ya está en el DOM, simplemente llama a la función de inicialización.
      if (document.getElementById(scriptId)) {
        if (typeof initIPTool === 'function') {
          initIPTool();
        } else {
          console.error('La función initIPTool no está definida, el script podría no haberse cargado correctamente antes.');
        }
        return;
      }

      // Si el script no existe, lo crea y lo añade.
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptSrc;

      // La clave es usar el evento 'onload' para garantizar que el script se ha cargado
      // antes de intentar llamar a cualquiera de sus funciones.
      script.onload = () => {
        console.log('Script de herramientas web cargado exitosamente.');
        if (typeof initIPTool === 'function') {
          initIPTool(); // Esta es la forma segura de llamar a la función.
        } else {
          console.error('Error crítico: initIPTool no se encontró en el script cargado.');
        }
      };

      script.onerror = () => {
        console.error('Error al cargar el script de herramientas web.');
      };

      document.head.appendChild(script);
    };

    cargarYEjecutarScript();
  }
});
agente.registrarModulo('Inicio', {
  templateUrl: 'src/modulos/inicio.html',
  init: (contenedor) => {
    actualizarSEO('Ruichis Lab | Tecnología Modular Profesional', 'Ruichis Lab: Soluciones de tecnología modular para Windows. Aplicaciones especializadas incluyendo Ruichis Lock con cifrado AES-256, disponibles en Microsoft Store.');
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
    actualizarSEO('Filosofía | Ruichis Lab', 'Descubre nuestro manifiesto de ingeniería: los principios de modularidad, seguridad y rendimiento que guían el desarrollo de nuestro software.');
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
    actualizarSEO('Contacto | Ruichis Lab', 'Contacta con nosotros para consultas técnicas, soporte o colaboraciones. Estamos listos para ayudarte a llevar tus proyectos al siguiente nivel.');
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
    actualizarSEO('Ruichis Lock | Cifrado AES-256 para Windows', 'Protege tus archivos con Ruichis Lock, una aplicación de cifrado de grado militar con AES-256. Descárgala gratis desde la Microsoft Store.');
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

agente.registrarModulo('Enciclopedia IA', {
  templateUrl: 'src/modulos/enciclopedia.html',
  init: (contenedor) => {
    actualizarSEO('Enciclopedia de IA | Ruichis Lab', 'Explora nuestra enciclopedia de Inteligencia Artificial. Aprende sobre Machine Learning, Deep Learning, redes neuronales y más.');
    const scriptId = 'enciclopedia-logic';
    // Evitar cargar el script si ya existe
    if (document.getElementById(scriptId)) {
      if (typeof inicializarEnciclopedia === 'function') {
        inicializarEnciclopedia(contenedor);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'src/js/enciclopedia.js';
    script.onload = () => {
      console.log('Script de la enciclopedia cargado.');
      if (typeof inicializarEnciclopedia === 'function') {
        inicializarEnciclopedia(contenedor);
      }
    };
    script.onerror = () => console.error('Error al cargar el script de la enciclopedia.');
    document.head.appendChild(script);
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

// Función de ayuda para actualizar el SEO de la página
function actualizarSEO(titulo, descripcion) {
  document.title = titulo;
  const metaDescripcion = document.querySelector('meta[name="description"]');
  if (metaDescripcion) {
    metaDescripcion.setAttribute('content', descripcion);
  } else {
    const nuevaMeta = document.createElement('meta');
    nuevaMeta.name = 'description';
    nuevaMeta.content = descripcion;
    document.head.appendChild(nuevaMeta);
  }
}

// Exportar agente para uso global
window.agenteModular = agente;
