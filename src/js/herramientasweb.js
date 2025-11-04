// src/js/herramientasweb.js

// Función para obtener y mostrar la IP
async function fetchIP() {
  const ipResultElement = document.getElementById('ip-result');
  if (!ipResultElement) {
    console.error('Elemento #ip-result no encontrado.');
    return;
  }

  ipResultElement.textContent = 'Obteniendo IP...';

  try {
    // Usamos una API pública y fiable que soporta CORS
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
}

// Función de inicialización para el módulo de herramientas web
function initIPTool() {
  const refreshButton = document.querySelector('.web-tool-card .btn-cyber');

  if (refreshButton) {
    refreshButton.addEventListener('click', fetchIP);
  } else {
    console.error('Botón de refrescar IP no encontrado.');
  }

  // Cargar la IP inicial al cargar el módulo
  fetchIP();
}
