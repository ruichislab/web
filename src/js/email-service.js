// Configuración de EmailJS para Ruichis Lab
// Este archivo configura el envío directo de emails sin necesidad de backend

class EmailService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    // Cargar EmailJS si no está disponible
    if (typeof emailjs === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = () => {
        this.initializeEmailJS();
      };
      document.head.appendChild(script);
    } else {
      this.initializeEmailJS();
    }
  }

  initializeEmailJS() {
    // Inicializar EmailJS con la clave pública
    // NOTA: Estas claves deben ser reemplazadas con las reales de EmailJS
    try {
      emailjs.init("YOUR_PUBLIC_KEY"); // Reemplazar con la clave real
      this.initialized = true;
      console.log('EmailJS inicializado correctamente');
    } catch (error) {
      console.log('EmailJS no disponible, usando fallback');
      this.initialized = false;
    }
  }

  async sendEmail(templateParams) {
    if (!this.initialized) {
      return this.fallbackMethod(templateParams);
    }

    try {
      const response = await emailjs.send(
        'YOUR_SERVICE_ID', // Reemplazar con el Service ID real
        'YOUR_TEMPLATE_ID', // Reemplazar con el Template ID real
        templateParams
      );
      
      return {
        success: true,
        message: 'Email enviado correctamente',
        response: response
      };
    } catch (error) {
      console.error('Error enviando email:', error);
      return this.fallbackMethod(templateParams);
    }
  }

  fallbackMethod(templateParams) {
    // Método fallback usando mailto
    const subject = `[Ruichis Lab] ${templateParams.tipo} - Consulta de ${templateParams.nombre}`;
    const body = `Nombre: ${templateParams.nombre}
Email: ${templateParams.email}
Tipo de consulta: ${templateParams.tipo}

Mensaje:
${templateParams.mensaje}

---
Enviado desde el formulario de contacto de Ruichis Lab
Fecha: ${new Date().toLocaleString('es-ES')}`;

    const mailtoLink = `mailto:ruichislab@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      window.open(mailtoLink, '_blank');
      return {
        success: true,
        message: 'Se ha abierto tu cliente de email con el mensaje preparado',
        method: 'mailto'
      };
    } catch (error) {
      return this.clipboardFallback(templateParams, subject, body);
    }
  }

  clipboardFallback(templateParams, subject, body) {
    const emailContent = `Para: ruichislab@gmail.com
Asunto: ${subject}

${body}`;

    try {
      navigator.clipboard.writeText(emailContent);
      return {
        success: true,
        message: 'Información copiada al portapapeles. Puedes pegarla en tu cliente de email.',
        method: 'clipboard'
      };
    } catch (error) {
      return {
        success: false,
        message: 'No se pudo enviar el email automáticamente',
        content: emailContent,
        method: 'manual'
      };
    }
  }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailService;
} else {
  window.EmailService = EmailService;
}
