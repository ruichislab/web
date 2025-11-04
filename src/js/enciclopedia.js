// src/js/enciclopedia.js

function inicializarEnciclopedia(contenedor) {
  const articulosGrid = contenedor.querySelector('.articulos-grid');
  const detalleContainer = contenedor.querySelector('#articulo-detalle-container');

  if (!articulosGrid || !detalleContainer) return;

  articulosGrid.addEventListener('click', async (e) => {
    const card = e.target.closest('.articulo-card');
    if (card) {
      const articuloId = card.dataset.articulo;
      await cargarArticulo(articuloId, detalleContainer);
    }
  });
}

async function cargarArticulo(id, container) {
  try {
    const response = await fetch(`src/modulos/ia/${id}.md`);
    if (!response.ok) {
      throw new Error(`El artículo "${id}" no fue encontrado.`);
    }
    const markdown = await response.text();
    // Usamos la librería 'marked' que hemos añadido en index.html
    const html = marked.parse(markdown);

    container.innerHTML = `<article class="articulo-contenido">${html}</article>`;
    container.style.display = 'block';

    // Scroll suave hacia el artículo cargado
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (error) {
    console.error('Error al cargar el artículo:', error);
    container.innerHTML = `<p class="error-message">No se pudo cargar el artículo. Por favor, inténtalo de nuevo más tarde.</p>`;
    container.style.display = 'block';
  }
}
