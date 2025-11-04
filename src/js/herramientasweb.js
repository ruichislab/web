// src/js/herramientasweb.js

async function fetchIP() {
  const ipResultElement = document.getElementById('ip-result');
  if (!ipResultElement) return;

  ipResultElement.textContent = 'Obteniendo IP...';

  try {
    const response = await fetch('https://api.ipify.org?format=json');
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

// La función se llama desde app.js después de cargar el módulo.
