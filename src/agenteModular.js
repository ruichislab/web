// src/agenteModular.js
// Agente Modular Base para Ruichis Lab SPA

class AgenteModular {
  constructor({ contenedor, logging = false }) {
    this.contenedor = document.querySelector(contenedor);
    this.modulos = {};
    this.logging = logging;
    this._initEventListeners();
  }

  registrarModulo(nombre, modulo) {
    this.modulos[nombre] = modulo;
    if (this.logging) console.log(`[Agente] Módulo registrado: ${nombre}`);
  }

  navegarA(nombre) {
    if (!this.modulos[nombre]) {
      if (this.logging) console.warn(`[Agente] Módulo no encontrado: ${nombre}`);
      return;
    }
    this._emitirEvento('modulo:antes-cargar', { nombre });
    this._cargarModulo(nombre);
  }

  _cargarModulo(nombre) {
    const modulo = this.modulos[nombre];
    if (modulo.templateUrl) {
      fetch(modulo.templateUrl)
        .then(res => res.text())
        .then(html => {
          this.contenedor.innerHTML = html;
          modulo.init?.(this.contenedor);
          this._emitirEvento('modulo:cargado', { nombre });
        });
    } else if (modulo.html) {
      this.contenedor.innerHTML = modulo.html;
      modulo.init?.(this.contenedor);
      this._emitirEvento('modulo:cargado', { nombre });
    }
    if (this.logging) console.log(`[Agente] Navegando a: ${nombre}`);
  }

  _emitirEvento(nombre, detalle) {
    document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
    if (this.logging) console.log(`[Agente] Evento emitido: ${nombre}`, detalle);
  }

  _initEventListeners() {
    document.addEventListener('modulo:navegar', e => {
      this.navegarA(e.detail.nombre);
    });
  }
}

window.AgenteModular = AgenteModular;
