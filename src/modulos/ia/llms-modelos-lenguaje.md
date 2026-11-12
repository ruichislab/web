# Grandes Modelos de Lenguaje (LLMs): Tokenización BPE, Pre-entrenamiento Autoregresivo, Decodificación y Capacidades Emergentes

Los **Grandes Modelos de Lenguaje** (*Large Language Models* o LLMs) son redes neuronales profundas basadas en la arquitectura Transformer, parametrizadas con miles de millones de coeficientes y entrenadas sobre vastos corpus textuales mediante objetivos autorregresivos. Matemáticamente, modelan la distribución de probabilidad conjunta de secuencias discretas de símbolos (*tokens*). Al optimizar la predicción secuencial a escala masiva, comprimen inductivamente la sintaxis, semántica, pragmática y conocimiento estructurado del lenguaje humano, consolidándose como modelos fundacionales multipropósito en la inteligencia artificial contemporánea.

---

## 1. Origen e Intuición Fundamental

El origen de los LLMs se remonta al modelado estadístico tradicional mediante $n$-gramas, restringido por la suposición de Markov y la maldición de la dimensionalidad ante la dispersión léxica. La transición hacia representaciones distribuidas continuas (*word embeddings*) y redes recurrentes (RNN, LSTM) permitió capturar dependencias contextuales densas, pero se vio limitada por el desvanecimiento del gradiente y el cuello de botella computacional del procesamiento secuencial.

En 2017, la introducción de la arquitectura Transformer (*Attention Is All You Need*) superó la recurrencia mediante la **autoatención** (*self-attention*), posibilitando la paralelización masiva en clústeres de GPU/TPU. Modelos pioneros como GPT (*Generative Pre-trained Transformer*, 2018) demostraron que la tarea auto-supervisada de predecir el siguiente token constituye un mecanismo de compresión universal: predecir con exactitud el siguiente fragmento textual exige inducir tácitamente hechos fácticos, reglas gramaticales y patrones de inferencia lógica.

Esta intuición fue formalizada mediante las **leyes de escalamiento empíricas** (*Scaling Laws*, Kaplan et al., 2020; Hoffmann et al., 2022 / Chinchilla), las cuales demostraron que la pérdida de entropía cruzada disminuye según leyes de potencia predecibles frente al escalamiento conjunto de parámetros ($N$), tokens de entrenamiento ($D$) y cómputo total en FLOPs ($C$):

$$L(N, D) = \frac{A}{N^\alpha} + \frac{B}{D^\beta} + L_0$$

Donde $L_0$ representa el límite teórico de entropía irreducible del lenguaje natural, y $\alpha, \beta, A, B$ son constantes empíricas.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

El ciclo técnico fundamental de un LLM comprende tres fases algorítmicas cardinales: tokenización subléxica, pre-entrenamiento autorregresivo causal y decodificación estocástica en inferencia.

### A. Tokenización: Byte Pair Encoding (BPE)

Los LLMs operan sobre un vocabulario discreto predeterminado $\mathcal{V}$ de subpalabras (habitualmente de 32.000 a 128.000 unidades). La tokenización a nivel de palabra completa sufre de términos fuera de vocabulario (*Out-Of-Vocabulary*, OOV), mientras que la tokenización por caracteres individuales satura la memoria cuadrática del mecanismo de atención.

El algoritmo **Byte Pair Encoding (BPE)** resuelve esta dicotomía: comienza con un vocabulario base de caracteres individuales (o bytes UTF-8) y fusiona iterativamente los pares de símbolos contiguos más frecuentes en el corpus:

```python
from collections import Counter

def merge_bpe_step(corpus_vocab: dict[tuple[str, ...], int]) -> dict[tuple[str, ...], int]:
    """Identifica el par contiguo más frecuente y lo fusiona en un nuevo token."""
    pairs = Counter()
    for word_tokens, freq in corpus_vocab.items():
        for i in range(len(word_tokens) - 1):
            pairs[word_tokens[i], word_tokens[i + 1]] += freq
    if not pairs:
        return corpus_vocab
    best_pair = pairs.most_common(1)[0][0]
    
    new_vocab = {}
    bigram = " ".join(best_pair)
    merged = "".join(best_pair)
    for word_tokens, freq in corpus_vocab.items():
        w_str = " ".join(word_tokens).replace(bigram, merged)
        new_vocab[tuple(w_str.split())] = freq
    return new_vocab
```

En implementaciones modernas a nivel de bytes (*byte-level BPE*, como en GPT-4 o LLaMA), la base son los 256 bytes elementales, lo que asegura una representación universal para cualquier texto binario sin tokens desconocidos.

### B. Pre-entrenamiento Autoregresivo (Causal Language Modeling)

Dado un corpus expresado como una secuencia de tokens $X = (x_1, x_2, \dots, x_T)$, el objetivo de modelado causal de lenguaje (*Causal Language Modeling*, CLM) consiste en maximizar la verosimilitud de la secuencia factorizada mediante la regla de la cadena:

$$P(X) = \prod_{t=1}^T P(x_t \mid x_1, \dots, x_{t-1}; \theta)$$

En cada paso $t$, el Transformer proyecta el estado contextual oculto $h_t \in \mathbb{R}^d$ hacia el espacio de logits $z_t \in \mathbb{R}^{|\mathcal{V}|}$ mediante una matriz de desempaquetado $W_u$:

$$z_t = W_u h_t + b_u$$

La distribución sobre el siguiente token se obtiene mediante la normalización *softmax*:

$$P(x_{t+1} = v \mid x_{\le t}) = \frac{\exp(z_{t, v})}{\sum_{j \in \mathcal{V}} \exp(z_{t, j})}$$

La optimización de parámetros $\theta$ se realiza minimizando la entropía cruzada promedio:

$$\mathcal{L}_{\text{CLM}}(\theta) = -\frac{1}{T} \sum_{t=1}^T \log P_\theta(x_t \mid x_{< t})$$

Para procesar secuencias en paralelo durante el entrenamiento sin violar la causalidad temporal, se introduce una máscara triangular estricta en el cálculo de atención: $\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}} + M\right) V$, donde $M_{i,j} = -\infty$ para $j > i$.

### C. Estrategias de Decodificación: Temperatura, Top-$k$ y Top-$p$ (Nucleus)

Durante la inferencia, la generación puramente determinista (*greedy search*) produce patrones repetitivos. Se emplean estrategias estocásticas calibradas:

- **Temperatura ($T > 0$):** Escala los logits previos al softmax ($z_i / T$). Valores bajos concentran la masa de probabilidad en los tokens de mayor rango; valores altos aplanan la distribución aumentando la variabilidad léxica.
- **Top-$k$:** Restringe la selección a los $k$ candidatos más probables.
- **Top-$p$ (Nucleus Sampling):** Selecciona el conjunto dinámico más pequeño de tokens $V^{(p)}$ cuya probabilidad acumulada alcanza el umbral $p \in (0, 1]$: $\sum_{i \in V^{(p)}} P(x = i) \ge p$.

```python
import torch
import torch.nn.functional as F

def sample_next_token(logits: torch.Tensor, temperature: float = 0.7, top_p: float = 0.9) -> int:
    """Escala logits por temperatura y filtra por probabilidad acumulada Top-p."""
    probs = F.softmax(logits / max(temperature, 1e-5), dim=-1)
    sorted_probs, sorted_indices = torch.sort(probs, descending=True)
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)

    # Enmascarar tokens que exceden el umbral p preservando el primero
    remove_mask = cumulative_probs > top_p
    remove_mask[..., 1:] = remove_mask[..., :-1].clone()
    remove_mask[..., 0] = False

    sorted_probs[remove_mask] = 0.0
    filtered_probs = sorted_probs / torch.sum(sorted_probs, dim=-1, keepdim=True)
    selected_idx = torch.multinomial(filtered_probs, num_samples=1)
    return sorted_indices[selected_idx].item()
```

### D. Capacidades Emergentes

Al superar umbrales críticos de escala computacional ($>10^{22}$ FLOPs) y parámetros, surgen **capacidades emergentes**: propiedades no observables en modelos reducidos. Entre ellas destacan el **aprendizaje en contexto** (*In-Context Learning*, resolver tareas a partir de ejemplos en el prompt sin ajustar pesos), el **razonamiento en cadena de pensamiento** (*Chain-of-Thought*) y la habilidad para interpretar y traducir código formal.

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Ingeniería de Software:** Asistencia interactiva, autocompletado sintáctico, síntesis de pruebas de software y traducción entre lenguajes de programación.
2. **Agentes Autónomos y Uso de Herramientas:** Planificación jerárquica (*ReAct*), invocación de funciones externas (APIs, motores SQL) y navegación web contextualizada.
3. **Generación Aumentada por Recuperación (RAG):** Integración con bases de datos vectoriales para la consulta documental en derecho, medicina y finanzas, reduciendo alucinaciones factuales.
4. **Biología Computacional y Química:** Modelado de secuencias biológicas (aminoácidos, SMILES) para predicción de plegamiento proteico y diseño molecular.

---

## 4. Ventajas, Limitaciones y Riesgos

| Dimensión | Ventajas Clave | Limitaciones Técnicas | Riesgos Críticos |
| :--- | :--- | :--- | :--- |
| **Capacidad y Flexibilidad** | Generalización *zero-shot* y comprensión profunda de estructuras sintácticas variadas. | Coste de atención cuadrático o lineal respecto a la longitud del contexto; límites de memoria de trabajo. | Inyección de directivas (*prompt injection*) y extracción de datos confidenciales. |
| **Rendimiento e Inferencia** | Generación natural coherente; aceleración con cuantización (FP8/INT4) y decodificación especulativa. | Elevada huella de VRAM para la caché KV (*Key-Value*); coste energético masivo en entrenamiento. | Centralización del poder de cómputo en grandes proveedores tecnológicos. |
| **Calidad Epistémica** | Integración y síntesis de grandes volúmenes de conocimiento multidisciplinar. | Alucinaciones estocásticas: formulación de aseveraciones formalmente erróneas con alta convicción. | Proliferación automatizada de desinformación creíble a gran escala. |
| **Alineamiento y Gobernanza** | Adaptabilidad conductual mediante técnicas post-entrenamiento (SFT, RLHF, DPO). | Imposibilidad teórica de garantizar un comportamiento libre de fallos bajo cualquier distribución de entrada. | Perpetuación de sesgos algorítmicos reflejados en el corpus de pre-entrenamiento. |

---

## 5. Conceptos Relacionados

- **Arquitectura Transformer y Autoatención:** Mecanismo subyacente de proyecciones lineales Query, Key, Value y atención multi-cabeza.
- **Alineamiento mediante RLHF y DPO:** Métodos de aprendizaje por refuerzo y optimización de preferencias directas para alinear modelos con la intención humana.
- **Generación Aumentada por Recuperación (RAG):** Paradigma que enlaza modelos generativos con sistemas de recuperación de información semántica densa.
- **Leyes de Escalamiento Neuronal (*Scaling Laws*):** Principios que gobiernan el rendimiento predictivo en función del tamaño del modelo, datos y cómputo invertido.
