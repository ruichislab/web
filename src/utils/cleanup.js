// Cleanup script para elementos duplicados
(function() {
  'use strict';

  // Función para limpiar elementos duplicados
  function cleanupDuplicateElements() {
    // Limpiar elementos de navegación duplicados
    const navLinks = document.querySelectorAll('.nav-link');
    const seenModules = new Set();
    
    navLinks.forEach((link, index) => {
      const modulo = link.getAttribute('data-modulo');
      
      // Eliminar módulos no deseados
      if (modulo === 'Ecosistema' || modulo === 'Actualizaciones') {
        link.closest('li')?.remove() || link.remove();
        console.log(`Módulo no deseado eliminado: ${modulo}`);
        return;
      }
      
      if (seenModules.has(modulo)) {
        // Este es un duplicado, eliminarlo
        link.closest('li')?.remove() || link.remove();
        console.log(`Elemento duplicado eliminado: ${modulo}`);
      } else {
        seenModules.add(modulo);
      }
    });
    
    // Limpiar elementos malformados o corruptos
    document.querySelectorAll('.nav-link').forEach(link => {
      if (!link.textContent.trim() || link.textContent.includes('ef="#"')) {
        link.closest('li')?.remove() || link.remove();
        console.log('Elemento corrupto eliminado');
      }
    });
  }

  // Función para limpiar estilos inline problemáticos
  function cleanupInlineStyles() {
    const navLinks = document.querySelectorAll('.nav-link[style]');
    
    navLinks.forEach(link => {
      const style = link.getAttribute('style');
      if (style && (style.includes('position: relative') || style.includes('overflow: hidden'))) {
        link.removeAttribute('style');
        console.log('Estilo inline problemático eliminado');
      }
    });
  }

  // Ejecutar limpieza cuando el DOM esté listo
  function runCleanup() {
    cleanupDuplicateElements();
    cleanupInlineStyles();
    
    // Observar cambios en el DOM para limpiar elementos que se creen dinámicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList && node.classList.contains('nav-link')) {
              // Nuevo elemento de navegación añadido, verificar duplicados
              setTimeout(cleanupDuplicateElements, 100);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCleanup);
  } else {
    runCleanup();
  }

  // Ejecutar también después de que todos los scripts se hayan cargado
  window.addEventListener('load', () => {
    setTimeout(runCleanup, 500);
  });

})();
