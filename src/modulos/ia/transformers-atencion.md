# Arquitectura Transformer y Autoatención

En junio de 2017, un equipo de ocho investigadores de Google Brain y Google Research presentó el artículo técnico *"Attention Is All You Need"*, liderado por Ashish Vaswani y Noam Shazeer. Aquel trabajo introdujo el Transformer, una arquitectura neuronal que eliminó por completo los bucles secuenciales para procesar información. En pocos años, este diseño sustituyó a las tecnologías previas y se convirtió en el motor detrás de los grandes modelos de lenguaje, la traducción automática, la visión artificial y herramientas científicas como AlphaFold.

> **En pocas palabras:** El Transformer permite que una computadora comprenda el significado de una palabra o imagen analizando todas las demás partes de la secuencia al mismo tiempo, en lugar de leer elemento por elemento en orden estricto.

---

## 1. De dónde viene y cómo se entiende fácil

Antes de la llegada del Transformer, el procesamiento de texto y secuencias temporales dependía de las redes neuronales recurrentes (RNN) y variantes como LSTM (Hochreiter y Schmidhuber, 1997) o GRU (Cho et al., 2014). Estos modelos leían los datos como quien mira por una ranura estrecha: palabra por palabra, de izquierda a derecha. Cada término nuevo actualizaba una memoria interna que intentaba arrastrar el contexto acumulado.

Este diseño presentaba dos grandes cuellos de botella:
- **Sin paralelismo:** Para calcular la quinta palabra era obligatorio haber procesado la cuarta. Los procesadores modernos (GPU y TPU) no podían acelerar el entrenamiento leyendo todo el texto en bloque.
- **Pérdida de memoria lejana:** En textos largos, la información de las primeras frases se diluía al comprimirse en un único vector de estado, perdiendo referencias cruciales.

### La analogía de la biblioteca digital

Para resolver este obstáculo, el Transformer introdujo la **autoatención** (*self-attention*), un mecanismo inspirado en la búsqueda asociativa dentro de una biblioteca mediante tres elementos:

1. **Consulta (*Query* o Q):** La pregunta o necesidad informativa que tiene una palabra concreta.
2. **Clave (*Key* o K):** La etiqueta temática que describe a cada una de las palabras presentes en el texto.
3. **Valor (*Value* o V):** El contenido semántico real que aporta cada término si su etiqueta coincide con la búsqueda.

Imagina la frase: *"El banco del parque estaba mojado porque llovió, así que evité sentarme en él"*. Cuando el modelo procesa la palabra *"él"*, emite una consulta (*Query*) preguntando: "¿A qué objeto masculino me refiero?". Las claves (*Keys*) de *"parque"* y *"banco"* responden. Al evaluar el contexto de la acción (*"sentarme"*), el sistema otorga máxima afinidad a *"banco"*, extrae su valor (*Value*) y enlaza ambos conceptos al instante, sin importar las palabras intermedias.

---

## 2. Cómo funciona por dentro

El Transformer evalúa de forma simultánea todas las posiciones de la secuencia entre sí mediante cuatro mecanismos clave:

```
[Tokens de entrada] 
         ↓
[Embeddings + Posición (RoPE)] 
         ↓
[Proyecciones lineales: Q, K, V] 
         ↓
[Atención Producto Punto Escalada] → softmax( (Q × Kᵀ) ÷ √d_k ) × V
         ↓
[Múltiples Cabezales (MHA)]
         ↓
[Redes Feed-Forward + Normalización]
```

### 1. Atención producto punto escalada

Cada token se proyecta en tres vectores numéricos mediante matrices de pesos entrenables: consulta (Q), clave (K) y valor (V). La afinidad matemática se calcula con la siguiente operación:

```text
Atención(Q, K, V) = softmax( (Q × Kᵀ) ÷ √d_k ) × V
```

- **Producto punto (Q × Kᵀ):** Multiplica las consultas por las claves transpuestas para medir la compatibilidad numérica entre cada par de palabras.
- **Factor de escala (√d_k):** Divide entre la raíz cuadrada de la dimensión de las claves (d_k). Esto estabiliza los valores y evita que la función *softmax* entre en zonas de gradiente plano donde la red deja de aprender.
- **Función softmax:** Transforma las puntuaciones en probabilidades porcentuales entre 0 y 1 que suman 1 por fila.
- **Ponderación por el valor (V):** Multiplica los porcentajes obtenidos por los vectores de valor para sintetizar el significado contextual final.

### 2. Múltiples cabezales (*Multi-Head Attention*)

Un único cálculo de atención solo rastrea un tipo de relación a la vez. Al proyectar Q, K y V en varios subespacios independientes llamados cabezales (*heads*), el modelo aprende en paralelo múltiples patrones: un cabezal vigila la concordancia gramatical, otro rastrea la causa de una acción y un tercero analiza los conectores. Al final, los resultados de todos los cabezales se concatenan y proyectan juntos.

### 3. Codificación de posición

Como la autoatención pura procesa todas las palabras a la vez, no distingue el orden sintáctico por sí sola. En 2017 se sumaban funciones sinusoidales fijas a los vectores de entrada. Hoy predominan esquemas dinámicos como RoPE (*Rotary Position Embedding*, propuesto por Jianlin Su en 2021), que aplica rotaciones ortogonales en el plano complejo para que la afinidad entre tokens dependa de su distancia relativa.

### 4. Complejidad cuadrática y FlashAttention

Calcular la matriz completa de atención exige una complejidad cuadrática de O(N²) en tiempo y memoria respecto a la longitud del texto (N). En 2022, Tri Dao introdujo **FlashAttention**, una técnica que reorganiza el cálculo en pequeños bloques procesados en la memoria ultrarrápida del chip (SRAM), reduciendo las transferencias a la memoria principal (HBM) de la GPU de O(N²) a O(N) sin perder precisión matemática.

```python
import torch
import torch.nn.functional as F

def autoatencion(q: torch.Tensor, k: torch.Tensor, v: torch.Tensor) -> torch.Tensor:
    """Calcula la atención producto punto escalada."""
    dimension_k = q.size(-1)
    puntuaciones = torch.matmul(q, k.transpose(-2, -1)) / (dimension_k ** 0.5)
    pesos = F.softmax(puntuaciones, dim=-1)
    return torch.matmul(pesos, v)
```

---

## 3. Dónde se usa hoy en la vida real

1. **Grandes modelos de lenguaje (LLM):** Modelos como GPT-4 (OpenAI), Claude (Anthropic), Gemini (Google) y LLaMA (Meta) emplean variantes del Transformer (*decoder-only*) para redacción, programación asistida y razonamiento analítico.
2. **Visión por computadora (Vision Transformers o ViT):** Presentados por Alexey Dosovitskiy en 2020, dividen imágenes en cuadrículas de parches tratados como tokens visuales, utilizándose en diagnóstico médico y vehículos autónomos.
3. **Biología molecular:** AlphaFold 2 (DeepMind, 2020) utilizó variantes del Transformer (bloques *Evoformer*) para predecir la estructura tridimensional de más de 200 millones de proteínas a partir de secuencias genéticas.
4. **Procesamiento de audio:** Sistemas como Whisper (OpenAI, 2022) transcriben y traducen audio procesando ondas acústicas como secuencias continuas.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

La flexibilidad del Transformer le permite aprender correlaciones complejas sin imponer sesgos previos, pero introduce demandas operativas considerables.

| Característica | Redes Recurrentes (LSTM / GRU) | Transformer Estándar (2017) | Transformer Moderno (FlashAttention + RoPE) | Modelos de Espacio de Estados (Mamba) |
| :--- | :--- | :--- | :--- | :--- |
| **Entrenamiento paralelo** | Nulo (cálculo secuencial) | Total (toda la secuencia junta) | Total (optimizado en SRAM) | Total (escaneo asociativo) |
| **Memoria en inferencia** | Fija: O(1) | O(N) por almacenamiento de claves y valores (KV Cache) | O(N) reducido con atención agrupada (GQA) | Fija: O(1) con estado recurrente |
| **Generación interactiva** | Rápida sin guardar historial | Requiere almacenar claves y valores previos | Optimizada con gestión paginada de memoria | Rápida con actualización interna de estados |
| **Contexto largo** | Pobre (degradación progresiva) | Directo pero costoso en O(N²) | Eficiente hasta más de 100.000 tokens | Alto sin sobrecoste cuadrático de atención |

### Limitaciones críticas y retos en producción

- **Cuello de botella de la memoria KV Cache:** Al generar texto palabra por palabra, el modelo debe conservar en memoria VRAM todas las claves y valores previos para no recalcularlos, lo que agota los servidores en chats largos y obliga a usar técnicas como la atención agrupada (GQA, *Grouped-Query Attention*).
- **Consumo intensivo de cómputo:** Al no asumir reglas fijas sobre el lenguaje o la visión, requiere miles de millones de ejemplos para deducir patrones, lo que demanda centros de datos con alto consumo energético.
- **Opacidad interpretativa:** Las conexiones se dispersan entre decenas de capas y cabezales cruzados, lo que dificulta aislar la causa exacta de fallos lógicos o respuestas falsas generadas con total verosimilitud (alucinaciones).

---

## 5. Temas relacionados

- **Grandes modelos de lenguaje (LLM):** Escalado industrial del Transformer para tareas de comprensión y síntesis de conocimiento.
- **Redes neuronales y optimización profunda:** Mecanismos de retropropagación, descenso de gradiente estocástico y normalización.
- **Modelos de Espacio de Estados (SSM y Mamba):** Arquitecturas alternativas que reducen el coste computacional en secuencias extensas.
- **Aceleración de inferencia:** Métodos como PagedAttention, cuantización numérica de pesos y poda neuronal para despliegues eficientes en servidores comerciales.
