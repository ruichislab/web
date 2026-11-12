# Arquitectura Transformer y Mecanismo de Auto-Atención

La **arquitectura Transformer** y el **mecanismo de auto-atención** (*self-attention*) constituyen la base matemática y conceptual que transformó radicalmente el procesamiento del lenguaje natural y el aprendizaje profundo contemporáneo. Introducida en 2017 por Vaswani et al. en el influyente artículo *"Attention Is All You Need"*, esta arquitectura eliminó por completo la dependencia de mecanismos recurrentes y convolucionales, empleando operaciones de atención para capturar dependencias contextuales directas en tiempo constante $O(1)$ entre cualquier par de posiciones de una secuencia. Su diseño vectorizado desbloqueó el entrenamiento altamente paralelizable en clústeres de GPUs y TPUs, sentando las bases de los grandes modelos de lenguaje (LLMs), la visión computacional basada en transformadores y la modelización molecular contemporánea.

---

## 1. Origen e Intuición Fundamental

Antes del surgimiento del Transformer, el modelado de secuencias dependía de arquitecturas recurrentes (RNN, LSTM y GRU). Dichas redes procesan la información de manera estrictamente secuencial: cada elemento $x_t$ actualiza un estado oculto $h_t = f(h_{t-1}, x_t)$. Esta dependencia temporal conllevaba dos limitaciones intrínsecas:
1. **Falta de paralelismo:** El cálculo en el paso $t$ exige haber computado el paso $t-1$, impidiendo aprovechar plenamente los aceleradores modernos durante el entrenamiento.
2. **Cuello de botella de memoria y gradiente:** La información distante debe propagarse paso a paso a lo largo de la secuencia, lo que provoca la disolución o degradación del contexto semántico lejano.

La intuición fundamental de la auto-atención consiste en reemplazar la recurrencia temporal por un mecanismo de **recuperación asociativa continua**. En lugar de comprimir la historia en un vector único, cada token de la secuencia examina y pondera directamente a todos los demás tokens de manera simultánea.

Para materializar esta dinámica, el mecanismo recurre a una analogía con sistemas de consulta de bases de datos:
* **Consulta (*Query*, $Q$):** Representa la información que un token busca para contextualizarse.
* **Clave (*Key*, $K$):** Identificador o etiqueta semántica que cada token expone al resto.
* **Valor (*Value*, $V$):** Contenido semántico ponderado que se transferirá según la compatibilidad entre $Q$ y $K$.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### 2.1. Atención Producto Punto Escalada (*Scaled Dot-Product Attention*)

Dadas las proyecciones lineales $Q \in \mathbb{R}^{N \times d_k}$, $K \in \mathbb{R}^{M \times d_k}$ y $V \in \mathbb{R}^{M \times d_v}$, donde $N$ y $M$ son las longitudes de secuencia y $d_k$ es la dimensión de la clave, la formulación fundamental se expresa como:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

El factor de escala $\frac{1}{\sqrt{d_k}}$ cumple una función matemática vital: si las componentes de $Q$ y $K$ son variables independientes con media $0$ y varianza $1$, el producto punto $\sum q_i k_i$ alcanza una varianza de $d_k$. Con dimensiones elevadas, las magnitudes crecen de forma desmedida, empujando la función softmax hacia zonas con pendientes casi nulas (gradientes desvanecidos). Dividir por $\sqrt{d_k}$ devuelve la varianza unitaria, estabilizando la retropropagación.

### 2.2. Atención Multicabezal (*Multi-Head Attention* - MHA)

Para dotar al modelo de la capacidad de atender a múltiples tipos de relaciones simultáneamente (sintácticas, semánticas y posicionales), $Q$, $K$ y $V$ se proyectan en $h$ subespacios independientes de menor dimensión ($d_k = d_{\text{model}} / h$):

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) W^O$$
$$\text{head}_i = \text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$$

Donde $W_i^Q, W_i^K \in \mathbb{R}^{d_{\text{model}} \times d_k}$, $W_i^V \in \mathbb{R}^{d_{\text{model}} \times d_v}$ y $W^O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$ son matrices aprendibles.

### 2.3. Codificación de Posición: Sinusoidal y RoPE

Como la auto-atención es invariable ante permutaciones, se debe inyectar información de orden espacial o temporal.

* **Codificación Sinusoidal:** Vaswani et al. introdujeron funciones armónicas fijas añadidas a los embeddings de entrada:
  $$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i / d_{\text{model}}}}\right), \quad PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i / d_{\text{model}}}}\right)$$
* **Rotary Position Embedding (RoPE):** Empleado en arquitecturas de vanguardia (LLaMA, Mistral), RoPE aplica rotaciones ortogonales a $Q$ y $K$ en el plano complejo bidimensional. Para cada coordenada par e impar:
  $$R_{\Theta, m} q = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix} \begin{pmatrix} q_0 \\ q_1 \end{pmatrix}$$
  Esta rotación garantiza matemáticamente que el producto escalar $\langle R_m q, R_n k \rangle$ dependa exclusivamente del desplazamiento relativo $m - n$, optimizando la extrapolación en contextos extensos.

### 2.4. Complejidad Cuadrática vs. FlashAttention

La auto-atención convencional calcula explícitamente la matriz $N \times N$, exigiendo:
* **Complejidad Temporal:** $O(N^2 \cdot d)$ operaciones aritméticas.
* **Complejidad de Memoria:** $O(N^2)$ escrituras y lecturas en la memoria principal de la GPU (HBM).

Para sortear este obstáculo, **FlashAttention** (*Dao et al.*) reestructura el algoritmo a nivel de hardware sin introducir aproximaciones numéricas:
1. **División en Bloques (*Tiling*):** Carga bloques reducidos de $Q$, $K$ y $V$ en la memoria rápida compartida (SRAM) del chip.
2. **Softmax Incremental (*Online Softmax*):** Normaliza las puntuaciones mediante máximos locales y factores de escala progresivos, eliminando la necesidad de materializar la matriz cuadrática completa en HBM.
3. **Recomputación en Retropropagación:** Reconstruye la atención de forma instantánea en SRAM durante la pasada regresiva, reduciendo el cuello de botella de transferencia de datos de $O(N^2)$ a $O(N)$.

### 2.5. Implementación del Núcleo de Atención

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(
    q: torch.Tensor, 
    k: torch.Tensor, 
    v: torch.Tensor, 
    mask: torch.Tensor | None = None
) -> torch.Tensor:
    """Calcula la atención producto punto escalada con soporte de máscara causal."""
    d_k = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) / (d_k ** 0.5)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
        
    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, v)
```

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Grandes Modelos de Lenguaje (LLMs):** Familia GPT, LLaMA, Gemini y Claude, fundamentados en variantes autorregresivas (*decoder-only*) para generación de código, traducción y razonamiento complejo.
2. **Visión por Computadora (Vision Transformers - ViT):** Descomposición de imágenes en parches matriciales tratados como tokens visuales para clasificación, detección de objetos y segmentación médica.
3. **Biología Computacional:** Modelos como AlphaFold 2 emplean variantes del Transformer (*Evoformer*) para predecir la estructura tridimensional de proteínas a partir de secuencias de aminoácidos.
4. **Modelos Multimodales y Audio:** Whisper (reconocimiento fonético de voz) y arquitecturas multimodales que fusionan texto, visión y señales acústicas en un espacio de atención unificado.

---

## 4. Ventajas, Limitaciones y Riesgos

La ausencia de restricciones inductivas confiere al Transformer una enorme plasticidad expresiva, si bien genera demandas rigurosas de cómputo y datos.

### Tabla Comparativa de Paradigmas Secuenciales

| Característica | Redes Recurrentes (LSTM/GRU) | Transformer Estándar | Transformer con FlashAttention + RoPE | Modelos de Espacio de Estados (Mamba) |
| :--- | :--- | :--- | :--- | :--- |
| **Paralelismo en Entrenamiento** | Nulo (recorrido paso a paso) | Completo (toda la secuencia) | Completo (optimizado en SRAM) | Completo (mediante escaneo asociativo) |
| **Complejidad de Memoria** | $O(1)$ constante | $O(N^2)$ cuadrática en HBM | $O(N)$ lineal respecto a memoria HBM | $O(1)$ en inferencia recurrente |
| **Inferencia por Token** | $O(1)$ sin almacenamiento previo | $O(N)$ mediante KV Cache | $O(N)$ acelerado con KV Cache | $O(1)$ sin degradación temporal |
| **Acceso a Contexto Remoto** | Débil (difusión en vector fijo) | Directo e inmediato $O(1)$ | Directo y escalable en ventanas largas | Alto (selectividad matricial de estados) |

### Limitaciones Principales y Retos Operativos

* **Consumo de Memoria por KV Cache:** En inferencia autorregresiva, acumular las claves y valores de secuencias prolongadas para evitar recomputaciones agota la memoria VRAM de las GPUs, obligando a adoptar técnicas como *Grouped-Query Attention* (GQA) o *PagedAttention*.
* **Dependencia Masiva de Datos:** Al carecer de sesgos inductivos innatos (como la invariancia a traslaciones de las convoluciones), requiere corpus gigantescos de entrenamiento para descubrir estructuras gramaticales o geométricas.
* **Interpretabilidad Difusa:** La propagación difusa de activaciones a través de múltiples cabezales y capas profundas dificulta la auditoría mecanicista y la mitigación de alucinaciones factuales.

---

## 5. Conceptos Relacionados

* **Grandes Modelos de Lenguaje (LLMs):** Escalado masivo de transformadores entrenados mediante predicción del siguiente token.
* **Deep Learning y Redes Neuronales Profundas:** Fundamentos de optimización estocástica, normalización y capas feed-forward.
* **Modelos de Espacio de Estados (SSMs / Mamba):** Alternativas lineales de modelado secuencial orientadas a secuencias de longitud extrema.
* **Optimización de Inferencia y Compresión (KV Cache, GQA, Cuantización):** Metodologías de aceleración de hardware para el despliegue eficiente de transformadores.
