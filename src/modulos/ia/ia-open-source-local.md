# IA de Código Abierto y Modelos Locales: Privacidad, Control y Computación en Casa

Durante años, utilizar inteligencia artificial exigía enviar cada consulta a servidores lejanos gestionados por un puñado de corporaciones. Cada petición acumulaba tarifas por volumen de texto y obligaba al usuario a entregar datos confidenciales a infraestructura ajena. Sin embargo, a partir de 2023 surgió una alternativa: descargar modelos avanzados y ejecutarlos de forma autónoma en un ordenador personal o servidor propio, sin conexión a internet y con control absoluto.

> **En pocas palabras:** Ejecutar inteligencia artificial localmente es como tener una imprenta y una biblioteca completa en casa: nadie espía lo que imprimes, no pagas por cada página leída y sigue funcionando aunque se corte internet.

---

## 1. De dónde viene y cómo se entiende fácil

### La chispa que desató la revolución local
Hasta inicios de 2023 se creía que solo superordenadores de millones de dólares podían mover modelos de lenguaje modernos (*Large Language Models* o LLMs). En febrero de 2023 Meta presentó LLaMA para investigación académica, pero días después sus parámetros matemáticos (*pesos*) se filtraron en internet vía redes BitTorrent.

En marzo de 2023, el desarrollador búlgaro Georgi Gerganov publicó `llama.cpp`. Escrito en C y C++ sin librerías pesadas en Python, demostró que un procesador doméstico e incluso un teléfono móvil podían mover estos modelos a velocidad de lectura humana. Aquel hito derribó barreras de entrada. Pronto surgieron proyectos destacados: Mistral 7B (publicado en septiembre de 2023 por Mistral AI con licencia Apache 2.0), la familia Qwen (de Alibaba Cloud) y las entregas sucesivas de Llama 2 y Llama 3 impulsadas por Meta.

### Pesos abiertos frente a código abierto auténtico
Existe una distinción esencial entre ambos términos:

- **Pesos abiertos (*Open Weights*):** La organización publica los números calculados durante el entrenamiento. Cualquiera puede descargarlos y usarlos en su equipo, pero no se revelan los datos de entrenamiento ni el código fuente original. Además, licencias como la de Meta fijan límites comerciales (exigen autorización si se superan 700 millones de usuarios activos mensuales) o prohíben usar sus salidas para entrenar modelos rivales.
- **Código abierto estricto (*Open Source AI*):** En octubre de 2024, la *Open Source Initiative* (OSI) aprobó la Definición de IA de Código Abierto (*OSAID v1.0*). Exige acceso público al código de entrenamiento, a los pesos y a información suficiente sobre los datos de entrenamiento para auditar o replicar el sistema. Proyectos como OLMo, del Allen Institute for AI (AI2), cumplen este criterio.

---

## 2. Cómo funciona por dentro

### El principio de la compresión: Cuantización
Los modelos se entrenan habitualmente con números de coma flotante de 16 bits (formatos FP16 o BF16, donde cada valor ocupa 2 bytes). Así, un modelo mediano de 8.000 millones de parámetros (8B) exige unos 16 gigabytes (GB) de memoria (RAM o VRAM de tarjeta gráfica) solo para cargar sus pesos en reposo.

Para ejecutarlo en un ordenador común se aplica la **cuantización**: una técnica matemática que reduce la precisión de cada número de 16 bits a 8, 4 o incluso 3 bits. Es análogo a comprimir una foto sin pérdidas a formato JPEG: se descartan matices casi imperceptibles, pero el archivo se reduce hasta un 75% u 80%.

El estándar actual para ejecución local es el formato **GGUF** (*GPT-Generated Unified Format*), creado por `llama.cpp` en agosto de 2023. GGUF almacena en un único archivo binario los parámetros cuantizados, el vocabulario y los metadatos de la red, facilitando una carga directa y eficiente en memoria.

### Estimación de memoria para inferencia
Para estimar la memoria requerida antes de descargar un modelo, se usa esta relación aritmética:

```text
Memoria requerida (GB) ≈ [(Parámetros en miles de millones × Bits por peso) ÷ 8] × 1,2
```

Donde:
- **Parámetros en miles de millones:** Por ejemplo, 8 para un modelo 8B, o 70 para uno de 70B.
- **Bits por peso:** Precisión elegida (habitualmente 4 bits en variantes como Q4_K_M, u 8 bits en Q8_0).
- **Factor de contexto (1,2):** Margen del 20% para la memoria intermedia de claves y valores (*KV Cache*), que retiene el historial de la conversación mientras se genera texto.

**Ejemplo práctico (modelo 8B en 4 bits):**
```text
[(8 × 4) ÷ 8] × 1,2 = (32 ÷ 8) × 1,2 = 4 × 1,2 = 4,8 GB
```
Un ordenador personal con 8 GB o 16 GB de RAM puede ejecutar este modelo con total fluidez.

### Puesta en marcha práctica con Ollama
Plataformas como **Ollama** integraron `llama.cpp` en un sistema muy accesible. Permiten descargar y consultar modelos desde la terminal o mediante peticiones locales:

```bash
# Descarga e inicia el modelo en la terminal
ollama run llama3.2:3b

# Consulta mediante una petición HTTP local en formato JSON
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "¿Cómo funciona el ciclo del agua?",
  "stream": false
}'
```

Todo el cálculo ocurre en el procesador (CPU) o chip gráfico (GPU) local; ningún dato viaja por internet.

---

## 3. Dónde se usa hoy en la vida real

- **Sectores con secreto profesional:** Despachos jurídicos, asesorías fiscales y hospitales usan modelos locales para analizar expedientes privados respetando leyes de privacidad como el RGPD europeo o la normativa HIPAA en Estados Unidos.
- **Asistentes de programación en código privado:** Empresas en sectores estratégicos conectan modelos como Qwen 2.5 Coder a sus editores para autocompletar código sin exponer código propietario a terceros.
- **Entornos desconectados y expediciones:** Barcos en alta mar, bases en la Antártida o plantas industriales sin conexión satelital emplean modelos locales para traducir manuales y diagnosticar incidentes técnicos.
- **Procesamiento masivo a coste marginal cero:** Organizaciones que clasifican millones de documentos aprovechan que el coste por consulta local es nulo tras adquirir el equipo, evitando facturas crecientes por consumo de tokens en la nube.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Criterio | Servicios Comerciales en la Nube | Modelos Locales de Pesos Abiertos |
| :--- | :--- | :--- |
| **Privacidad de los datos** | La información viaja a servidores ajenos | **Total:** Los datos nunca salen del dispositivo |
| **Modelo de costes** | Gasto variable periódico según las palabras procesadas | **Fijo:** Inversión única en el hardware |
| **Dependencia de red** | Requiere conexión ininterrumpida a internet | **Nula:** Opera al 100% sin conexión |
| **Razonamiento en problemas complejos** | Superior en modelos colosales de cientos de miles de millones de parámetros | Muy bueno en tareas cotidianas, pero limitado por la memoria del equipo |
| **Control del servicio** | El proveedor puede retirar o modificar el modelo | **Garantizado:** El modelo descargado permanece bajo control del usuario |
| **Dificultad de gestión** | Ninguna gestión de hardware por parte del usuario | Exige administrar memoria, formatos y controladores locales |

### Limitaciones y consideraciones técnicas
- **El cuello de botella del ancho de banda de memoria:** En modelos de lenguaje, la velocidad de respuesta depende de cuán rápido la memoria envía datos al procesador (*Memory Bandwidth*). Por ello, arquitecturas con memoria unificada veloz (como Apple Silicon) o tarjetas gráficas con memoria GDDR6 generan texto a mucha mayor velocidad que equipos con memoria RAM estándar.
- **Techo cognitivo en hardware doméstico:** Modelos de 3B a 14B parámetros resuelven con soltura redacción, resúmenes y código básico. Sin embargo, para deducciones lógicas complejas de múltiples etapas, los modelos comerciales más grandes aún conservan ventaja.
- **Ausencia de filtros externos y responsabilidad:** Sin intermediarios que filtren peticiones, los modelos locales pueden modificarse para suprimir barreras de seguridad. La responsabilidad sobre el uso, la detección de datos falsos (*alucinaciones*) y la seguridad de la aplicación recae exclusivamente en quien opera el sistema.

---

## 5. Temas relacionados

- **Cuantización y Aceleración Numérica (GGUF, AWQ, GPTQ):** Técnicas algorítmicas para comprimir redes neuronales y acelerar su ejecución en hardware doméstico.
- **Ajuste Fino Eficiente (LoRA y QLoRA):** Métodos para especializar modelos de pesos abiertos con un consumo mínimo de memoria.
- **Generación Aumentada por Recuperación (RAG):** Arquitectura que enlaza modelos locales con bases documentales privadas para responder con precisión sin reenviar información a la red.
- **Hardware y Arquitecturas de Inferencia (GPU, NPU y Memoria Unificada):** Componentes físicos optimizados para maximizar el ancho de banda y la eficiencia energética en inteligencia artificial.
