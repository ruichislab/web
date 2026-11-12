# Grandes Modelos de Lenguaje (LLMs)

Los grandes modelos de lenguaje (conocidos comúnmente como LLMs, por sus siglas en inglés *Large Language Models*) son sistemas informáticos avanzados diseñados para comprender, resumir, traducir y generar texto con fluidez. En lugar de consultar respuestas prefijadas en una base de datos estática, estos programas analizan inmensos volúmenes de lecturas digitalizadas y operan prediciendo, paso a paso, cuál es la siguiente pieza de texto más probable según todo lo escrito hasta ese momento.

> **En pocas palabras:** Un gran modelo de lenguaje es un sistema informático que aprende leyendo bibliotecas enteras para comunicarse calculando qué palabra encaja mejor a continuación.

---

## 1. De dónde viene y cómo se entiende fácil

El funcionamiento de un LLM se asemeja al texto predictivo del teclado de un teléfono móvil. Cuando alguien teclea «Buenas...», la pantalla sugiere «tardes» o «noches». Un LLM parte de ese principio, pero a una escala monumental: en lugar de mirar solo las dos últimas palabras, examina miles de términos a la vez para determinar qué fragmento encaja a continuación. Para acertar con precisión si debe completar un código informático, redactar un contrato o continuar una explicación científica, el modelo asimila de forma indirecta reglas gramaticales, relaciones lógicas y conocimientos del mundo.

Durante décadas, la lingüística computacional utilizó modelos estadísticos de n-gramas, formulados a partir de los trabajos de Claude Shannon en 1948. Estos sistemas contaban con qué frecuencia aparecían juntas ciertas palabras en archivos impresos. Su gran limitación era la rigidez: ante cualquier frase nueva, el cálculo fallaba por falta de coincidencias exactas. En 2003, Yoshua Bengio y su equipo introdujeron los primeros modelos neuronales de lenguaje, asignando a cada palabra coordenadas numéricas continuas (*word embeddings*). En la década de 2010, las redes recurrentes (RNN) y las unidades de memoria LSTM (creadas por Sepp Hochreiter y Jürgen Schmidhuber en 1997) permitieron procesar oraciones más largas, aunque su lectura secuencial palabra por palabra impedía aprovechar el cálculo paralelo en tarjetas gráficas (GPU) y diluía el contexto en textos extensos.

El salto definitivo llegó en 2017 con la arquitectura Transformer (*Attention Is All You Need*, Vaswani et al.), que sustituyó la recurrencia por el mecanismo de autoatención para analizar todas las palabras de un texto en paralelo. En 2018, OpenAI presentó GPT-1 (*Generative Pre-trained Transformer*), demostrando que predecir el siguiente token sobre millones de lecturas crea una base versátil para resolver múltiples tareas lingüísticas. Pronto se formalizaron las leyes de escalado (*Scaling Laws*): Jared Kaplan y su equipo demostraron en 2020 que la precisión del modelo mejora de forma predecible según leyes de potencias al aumentar el número de parámetros, los datos y el cómputo. En 2022, el estudio del modelo Chinchilla (Hoffmann et al., DeepMind) demostró que para optimizar el rendimiento, los datos de lectura y el tamaño del modelo deben crecer a la par, requiriendo unas 20 fichas de texto por cada parámetro entrenado.

---

## 2. Cómo funciona por dentro

El ciclo técnico de un LLM se divide en tres etapas: tokenización del texto, preentrenamiento autorregresivo y decodificación en inferencia.

```text
Texto original --> Tokenización (BPE) --> Bloques Transformer --> Logits y Softmax --> Muestreo --> Respuesta generada
```

### 1. Tokenización mediante Byte Pair Encoding (BPE)
Las redes neuronales procesan números, no letras. Si asignáramos un número a cada palabra, el vocabulario sería inmanejable; si usáramos letras sueltas, las secuencias serían demasiado largas. La solución estándar es dividir el texto en subpalabras con el algoritmo *Byte Pair Encoding* (BPE), creado por Philip Gage en 1994 y adaptado al procesamiento de lenguaje en 2016 por Rico Sennrich et al. BPE analiza el texto y fusiona repetidamente los pares de caracteres más frecuentes:

```python
from collections import Counter

def unir_par_frecuente(vocabulario):
    """Localiza el par contiguo más repetido y lo fusiona en un token nuevo."""
    pares = Counter()
    for tokens, freq in vocabulario.items():
        for i in range(len(tokens) - 1):
            pares[(tokens[i], tokens[i + 1])] += freq
    if not pares:
        return vocabulario
    mejor_par = pares.most_common(1)[0][0]
    nuevo_vocab = {}
    patron = " ".join(mejor_par)
    fusionado = "".join(mejor_par)
    for tokens, freq in vocabulario.items():
        nuevo_texto = " ".join(tokens).replace(patron, fusionado)
        nuevo_vocab[tuple(nuevo_texto.split())] = freq
    return nuevo_vocab
```

En modelos como GPT-4 o LLaMA, se utiliza la variante a nivel de bytes (*byte-level BPE*), que parte de los 256 bytes elementales de UTF-8. Esto permite procesar cualquier idioma, código o símbolo sin producir errores de palabras desconocidas. En promedio, un token equivale a cuatro caracteres o a tres cuartas partes de una palabra en español.

### 2. Preentrenamiento autorregresivo
Una vez tokenizado el texto, la red se entrena de forma autorregresiva: predice el siguiente token basándose exclusivamente en los anteriores. Una máscara de atención triangular oculta los tokens futuros para evitar atajos indebidos durante el cálculo en paralelo. La probabilidad conjunta de una frase de T tokens se calcula como el producto de sus probabilidades sucesivas:

```text
P(token_1, ..., token_T) = P(token_1) × P(token_2 | token_1) × ... × P(token_T | token_1, ..., token_{T-1})
```

En la salida del Transformer, el modelo emite puntuaciones crudas (*logits*) para cada token del vocabulario (entre 32.000 y 128.000 términos). La función softmax convierte esas puntuaciones en porcentajes de probabilidad que suman 1:

```text
Probabilidad(token_i) = exp(logit_i) ÷ ∑ exp(logit_j)
```

Mediante una función de pérdida de entropía cruzada y el optimizador AdamW, los pesos del modelo se ajustan gradualmente para aumentar la probabilidad del término correcto.

### 3. Decodificación y muestreo
Elegir siempre la palabra con mayor probabilidad (*greedy search*) produce repeticiones y textos monótonos. Para equilibrar coherencia y variedad, se emplean tres parámetros de muestreo:

- **Temperatura:** Factor divisor positivo aplicado a los logits antes de la función softmax. Valores bajos (como 0.2) concentran la probabilidad en las opciones principales, ideal para programación o matemáticas. Valores altos (como 0.8) aplanan la distribución, fomentando la creatividad léxica.
- **Top-k:** Filtra la selección a los k candidatos más probables (por ejemplo, los 40 primeros), descartando términos inverosímiles (Angela Fan et al., 2018).
- **Top-p (muestreo de núcleo):** Selecciona el conjunto más reducido de tokens cuya probabilidad acumulada alcanza el umbral p, típicamente 0.90 (Ari Holtzman et al., 2019). Si una palabra es muy predecible, la lista de opciones se reduce de inmediato; si el contexto es abierto, se amplía.

---

## 3. Dónde se usa hoy en la vida real

- **Ingeniería de software:** Asistentes de programación (como GitHub Copilot, Cursor o Claude Code) que sugieren funciones, escriben pruebas unitarias y traducen código entre lenguajes.
- **Búsqueda empresarial y RAG:** Sistemas de Generación Aumentada por Recuperación que consultan reglamentos legales, historiales médicos o manuales corporativos para responder con fuentes contrastadas.
- **Atención al usuario y traducción:** Asistentes multilingües capaces de gestionar consultas operativas, resumir reuniones y adaptar textos a registros formales específicos.
- **Biología computacional:** Modelos adaptados a secuencias moleculares (como ESM de Meta) que interpretan aminoácidos como tokens para predecir el plegamiento de proteínas y diseñar nuevos fármacos.
- **Agentes autónomos:** Modelos integrados con herramientas externas para consultar bases de datos SQL, ejecutar llamadas a APIs y coordinar tareas digitales complejas sin supervisión paso a paso.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Dimensión | Qué hace bien | Dónde falla o se limita | Riesgo principal |
| :--- | :--- | :--- | :--- |
| **Capacidad expresiva** | Redacción fluida, síntesis ágil y adaptación a múltiples registros lingüísticos. | Falta de sentido común físico; no verifica la verdad de sus afirmaciones por sí mismo. | Difusión masiva de desinformación convincente pero falsa. |
| **Razonamiento formal** | Descomposición de problemas paso a paso (*Chain-of-Thought*) y traducción lógica. | Vulnerabilidad ante cambios sutiles en las premisas y fallos en aritmética elemental. | Inclusión inadvertida de vulnerabilidades de seguridad en código de software. |
| **Eficiencia operativa** | Versatilidad multitarea con un único modelo base sin necesidad de programar cada función. | Alto consumo de memoria VRAM para almacenar el historial de claves y valores (*KV cache*). | Concentración tecnológica en un número reducido de proveedores de computación e infraestructura. |
| **Seguridad y control** | Asimilación de directrices éticas y rechazo de peticiones peligrosas mediante RLHF y DPO. | Imposibilidad matemática de garantizar respuestas seguras ante cualquier entrada imprevista. | Vulnerabilidad ante inyecciones de instrucciones (*prompt injection*) que eluden los filtros. |

### Limitaciones críticas y riesgos prácticos

- **Alucinaciones factuales:** Los LLMs optimizan la verosimilitud estadística del lenguaje, no la veracidad objetiva. Por tanto, pueden generar datos falsos con tono de certeza si no cuentan con mecanismos de verificación externa.
- **Sobrecarga de memoria de contexto (*KV Cache*):** A medida que la conversación se amplía, retener en la memoria de la GPU las representaciones previas eleva considerablemente el coste computacional por consulta.
- **Ataques por inyección de instrucciones:** Al procesar las directivas del sistema y el texto del usuario en el mismo canal, un atacante puede camuflar órdenes para alterar el comportamiento del modelo y extraer información reservada.

---

## 5. Temas relacionados

- **Arquitectura Transformer y Autoatención:** El diseño neuronal que habilitó el procesamiento masivo de secuencias en paralelo.
- **Fine-Tuning y Adaptación Eficiente (LoRA):** Técnicas para especializar modelos de lenguaje optimizando solo una fracción de sus parámetros.
- **Generación Aumentada por Recuperación (RAG):** Método que vincula los modelos generativos con bases documentales externas para sustentar sus respuestas.
- **Ingeniería de Prompts (*Prompt Engineering*):** Buenas prácticas de diseño de instrucciones para obtener respuestas precisas y estructuradas.
- **Alineamiento y Seguridad en IA:** Metodologías como RLHF y DPO para ajustar las respuestas del modelo a normas éticas y de utilidad humana.
