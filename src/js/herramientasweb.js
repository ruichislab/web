// src/js/herramientasweb.js

/**
 * Inicializa la herramienta de "Cuál es mi IP".
 * Configura el botón de refrescar y obtiene la IP inicial.
 * Toda la lógica está encapsulada para evitar conflictos globales.
 */
function initIPTool() {
  const ipResultElement = document.getElementById('ip-result');
  const refreshButton = document.querySelector('.web-tool-card .btn-cyber');

  if (!ipResultElement) {
    console.error('Elemento #ip-result no encontrado.');
    return;
  }

  if (!refreshButton) {
    console.error('Botón de refrescar IP no encontrado.');
    // Aunque el botón no se encuentre, podemos intentar obtener la IP inicial.
  }

  /**
   * Función interna para obtener y mostrar la dirección IP del usuario.
   */
  const fetchIP = async () => {
    ipResultElement.textContent = 'Obteniendo IP...';
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      if (!response.ok) {
        throw new Error(`Error de red: ${response.statusText}`);
      }
      const data = await response.json();
      ipResultElement.textContent = data.ip;
    } catch (error) {
      console.error('Error al obtener la IP:', error);
      ipResultElement.textContent = 'No se pudo obtener la IP.';
    }
  };

  // Asigna el evento de clic al botón de refrescar, si existe.
  if (refreshButton) {
    refreshButton.addEventListener('click', fetchIP);
  }

  // Llama a la función para obtener la IP tan pronto como se inicializa el módulo.
  fetchIP();
}

document.addEventListener('DOMContentLoaded', initIPTool);
