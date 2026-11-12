# Grandes Modelos de Lenguaje (LLMs): Tokenización BPE, Pre-entrenamiento Autoregresivo, Decodificación y Capacidades Emergentes

Los **Grandes Modelos de Lenguaje** (*Large Language Models* o LLMs) son sistemas de aprendizaje profundo fundamentados en la arquitectura Transformer, parametrizados típicamente con decenas o cientos de miles de millones de coeficientes sinápticos y entrenados sobre volúmenes masivos de texto no estructurado mediante objetivos de modelado autorregresivo. Matemáticamente, operan como estimadores de distribuciones de probabilidad multivariadas y condicionales sobre secuencias discretas de unidades léxicas (*tokens*). Su capacidad para comprimir patrones sintácticos, semánticos, lógicos y pragmáticos del lenguaje humano ha impulsado una transformación paradigmática en el procesamiento del lenguaje natural (PLN), evolucionando desde modelos estadísticos limitados hacia arquitecturas fundacionales multipropósito con habilidades cognitivas y operativas complejas.

---

## 1. Origen e Intuición Fundamental

El desarrollo de los LLMs es el punto culminante de décadas de investigación en el modelado estadístico del lenguaje. Inicialmente, los modelos de lenguaje basados en $n$-gramas estimaban la probabilidad de una palabra condicionada a una ventana estricta de orden $n-1$, apoyándose en el supuesto de Markov y técnicas de suavizado (como Kneser-Ney). Sin embargo, padecían de una severa maldición de la dimensionalidad ante la explosión combinatoria del vocabulario. 

Con la introducción de los modelos de espacio vectorial distribuido (*word embeddings* como Word2Vec y GloVe) y las Redes Neuronales Recurrentes (RNN y LSTM), se posibilitó una representación densa y continua del contexto. No obstante, las RNN exhibían dos limitaciones estructurales fundamentales: el desvanecimiento del gradiente en dependencias de largo alcance y la imposibilidad intrínseca de paralelización temporal durante el entrenamiento.

La ruptura definitiva se produjo en 2017 con el artículo *Attention Is All You Need* (Vaswani et al.), que introdujo la arquitectura Transformer. Al prescindir por completo de la recurrencia y fundamentar el procesamiento en mecanismos de **autoatención** (*self-attention*), el Transformer permitió procesar secuencias completas de manera simultánea en hardware acelerado (GPU y TPU). 

A partir de esta innovación, trabajos pioneros como GPT (*Generative Pre-trained Transformer*, Radford et al., 2018) formularon una intuición radical pero elegante: **la predicción autorregresiva del siguiente token a escala masiva actúa como un objetivo universal de compresión y aprendizaje representacional**. Siguiendo las formulaciones teóricas de la complejidad de Kolmogorov y la teoría de la información de Shannon, comprimir eficientemente el acervo textual de la humanidad exige que la red neuronal internalice tácitamente la gramática, el conocimiento enciclopédico del mundo, las estructuras formales del código y esquemas de inferencia lógica.

Posteriormente, las **leyes de escalamiento empíricas** (*Scaling Laws*) formuladas por Kaplan et al. (2020) y refinadas por Hoffmann et al. (2022, modelo Chinchilla) demostraron que la función de pérdida del modelo decrece de acuerdo con leyes de potencia predecibles frente al incremento coordinado de tres variables cardinales: el número de parámetros del modelo ($N$), el tamaño del corpus de entrenamiento medido en tokens ($D$) y el presupuesto de cómputo en FLOPs ($C$):

$$L(N, D) = \frac{A}{N^\alpha} + \frac{B}{D^\beta} + L_0$$

Donde $L_0$ representa la entropía irreductible del lenguaje natural y $\alpha, \beta, A, B$ son constantes empíricas. Esto consolidó la certeza científica de que aumentar la escala de manera equilibrada producía mejoras directas y predecibles en la capacidad del modelo.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

El ciclo funcional de un LLM moderno comprende tres componentes matemáticos y algorítmicos esenciales: la tokenización de subpalabras, el pre-entrenamiento autorregresivo causal y la decodificación estocástica en inferencia.

### A. Tokenización: Byte Pair Encoding (BPE)

Los LLMs no procesan texto crudo en formato de cadenas de caracteres directamente, sino índices numéricos correspondientes a un vocabulario predeterminado $\mathcal{V}$ (habitualmente de entre 32.000 y 128.000 unidades). La tokenización por palabras completas enfrenta el problema de palabras desconocidas (*Out-Of-Vocabulary* o OOV), mientras que la tokenización a nivel de carácter genera secuencias excesivamente largas que saturan la memoria cuadrática de la atención.

El algoritmo **Byte Pair Encoding (BPE)** resuelve este dilema segmentando el texto en subpalabras estadísticas. Inicialmente, el vocabulario contiene todos los bytes individuales o caracteres elementales. De manera iterativa, se identifican y fusionan los pares de caracteres o subpalabras más frecuentes en el corpus de entrenamiento hasta alcanzar el tamaño prefijado $|\mathcal{V}|$.

```python
from collections import Counter

def get_stats(vocab: dict[tuple[str, ...], int]) -> Counter:
    """Calcula la frecuencia de pares adyacentes de símbolos."""
    pairs = Counter()
    for word, freq in vocab.items():
        for i in range(len(word) - 1):
            pairs[word[i], word[i + 1]] += freq
    return pairs

def merge_vocab(pair: tuple[str, str], v_in: dict[tuple[str, ...], int]) -> dict[tuple[str, ...], int]:
    """Fusiona el par más frecuente en una nueva subpalabra unificada."""
    v_out = {}
    bigram = " ".join(pair)
    replacement = "".join(pair)
    for word in v_in:
        w_str = " ".join(word)
        w_str = w_str.replace(bigram, replacement)
        v_out[tuple(w_str.split())] = v_in[word]
    return v_out
```

En implementaciones avanzadas como *byte-level BPE* (adoptado en GPT-2, GPT-4 y LLaMA), el algoritmo opera directamente sobre la representación en bytes UTF-8, garantizando que el vocabulario base cubra cualquier cadena binaria sin requerir jamás tokens OOV.

### B. Pre-entrenamiento Autoregresivo (Causal Language Modeling)

Dado un corpus de texto representado como una secuencia ordenada de tokens discretos $X = (x_1, x_2, \dots, x_T)$, el objetivo de modelado causal de lenguaje (*Causal Language Modeling*, CLM) consiste en maximizar la verosimilitud conjunta de la secuencia descomponiéndola mediante la regla de la cadena de probabilidades:

$$P(X) = \prod_{i=1}^T P(x_i \mid x_1, x_2, \dots, x_{i-1}; \theta)$$

Donde $\theta$ representa los pesos entrenables de la red. Durante el paso hacia adelante (*forward pass*), para cada posición temporal $t \in [1, T-1]$, el Transformer proyecta la representación contextualizada $h_t \in \mathbb{R}^d$ hacia el espacio de logits de vocabulario $z_t \in \mathbb{R}^{|\mathcal{V}|}$ mediante una matriz de desempaquetado (*unembedding matrix*) $W_u$:

$$z_t = W_u h_t + b_u$$

La distribución sobre el siguiente token se obtiene normalizando los logits con la función *softmax*:

$$P(x_{t+1} = v \mid x_{\le t}) = \frac{\exp(z_{t, v})}{\sum_{j \in \mathcal{V}} \exp(z_{t, j})}$$

La función de pérdida para el entrenamiento es la entropía cruzada negativa promediada sobre toda la secuencia:

$$\mathcal{L}_{\text{CLM}}(\theta) = -\frac{1}{T} \sum_{t=1}^T \log P_\theta(x_t \mid x_{< t})$$

Para procesar todos los pasos temporales en paralelo sin violar la causalidad (evitar que la posición $t$ filtre información de posiciones futuras $t' > t$), se aplica una **máscara causal triangular inferior** en el producto escalar del cálculo de atención:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}} + M\right) V$$

Donde $M_{i,j} = 0$ si $j \le i$, y $M_{i,j} = -\infty$ si $j > i$.

### C. Estrategias de Decodificación: Temperatura, Top-$k$ y Top-$p$ (Nucleus)

En inferencia, la generación opera token por token de manera autorregresiva. Decodificar puramente mediante búsqueda codiciosa (*greedy search*, seleccionando $\arg\max_v P(v)$) produce bucles degenerados y prosa monótona. Para mitigar esto, se aplican transformaciones estocásticas controladas:

1. **Temperatura ($T > 0$):** Escala los logits antes de la aplicación de softmax:
   $$P(x = i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$
   - Cuando $T \to 0$, la distribución colapsa en un vector *one-hot* coincidente con *greedy search*.
   - A valores altos ($T > 1$), suaviza la distribución hacia una forma uniforme, incrementando la entropía y diversidad léxica.

2. **Muestreo Top-$k$:** Trunca la distribución reteniendo únicamente los $k$ tokens con mayor logit, redistribuyendo la masa de probabilidad sobre ellos y fijando el resto a cero.

3. **Muestreo Top-$p$ (Nucleus Sampling):** Introduce un filtro dinámico. Selecciona el subconjunto más pequeño de tokens $V^{(p)} \subset \mathcal{V}$ cuya suma acumulada de probabilidad excede un umbral $p \in (0, 1]$:
   $$\sum_{i \in V^{(p)}} P(x = i) \ge p$$

```python
import torch
import torch.nn.functional as F

def sample_next_token(logits: torch.Tensor, temperature: float = 0.7, top_p: float = 0.9) -> int:
    """Aplica escala de temperatura, filtrado Top-p y muestreo estocástico."""
    # 1. Escalamiento por temperatura
    scaled_logits = logits / max(temperature, 1e-6)
    probs = F.softmax(scaled_logits, dim=-1)

    # 2. Ordenamiento descendente para Top-p
    sorted_probs, sorted_indices = torch.sort(probs, descending=True)
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)

    # 3. Máscara de corte para descartar tokens fuera del núcleo 'p'
    sorted_indices_to_remove = cumulative_probs > top_p
    # Conservar siempre al menos el token principal
    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
    sorted_indices_to_remove[..., 0] = False

    sorted_probs[sorted_indices_to_remove] = 0.0
    filtered_probs = sorted_probs / torch.sum(sorted_probs, dim=-1, keepdim=True)

    # 4. Muestreo de la distribución categórica resultante
    selected_idx = torch.multinomial(filtered_probs, num_samples=1)
    return sorted_indices[selected_idx].item()
```

### D. Capacidades Emergentes

Conforme el cómputo y el tamaño de parámetros superan ciertos umbrales críticos ($>10^{22}$ FLOPs, típicamente a partir de decenas de miles de millones de parámetros), los modelos manifiestan **capacidades emergentes**: comportamientos cualitativamente nuevos ausentes en modelos de menor escala que surgen de forma aparentemente discontinua. Entre ellos destacan:
- **Aprendizaje en Contexto (*In-Context Learning* o ICL):** Habilidad para internalizar tareas nuevas a partir de unos pocos ejemplos en el prompt (*few-shot*) sin actualizar gradientes sinápticos.
- **Razonamiento en Cadena de Pensamiento (*Chain-of-Thought*):** Descomposición autónoma de problemas de razonamiento multifactorial al incentivarse la generación de pasos intermedios.
- **Traducción y Transferencia Lingüística Espontánea:** Proyección semántica entre idiomas poco representados sin entrenamiento explícito bilingüe.

*Nota técnica:* La literatura reciente (e.g., Schaeffer et al., 2023) señala que parte de la aparente discontinuidad de estas habilidades se debe al uso de métricas no lineales (como exactitud binaria); bajo métricas continuas, la evolución del rendimiento muestra un progreso monotónico consistente con las leyes de potencia.

---

## 3. Casos de Uso y Aplicaciones Reales

La versatilidad de los LLMs ha permitido su despliegue en múltiples áreas industriales, científicas y operativas:

1. **Ingeniería de Software y Programación Automatizada:** Generación de código sintácticamente correcto, síntesis de pruebas unitarias, refactorización y depuración en tiempo real (ejemplificado por modelos como Codex y GitHub Copilot).
2. **Sistemas de Agentes Autónomos y Tool Calling:** Integración de LLMs como motores de razonamiento central (patrones *ReAct*) capaces de descomponer directivas complejas, invocar APIs REST externas, ejecutar código en entornos *sandbox* e interactuar con interfaces gráficas.
3. **Generación Aumentada por Recuperación (*Retrieval-Augmented Generation*, RAG):** Vinculación dinámica con bases de datos vectoriales para la consulta documental fáctica en banca, salud y derecho, minimizando el riesgo de alucinación mediante fuentes verificables.
4. **Descubrimiento Científico y Biología Computacional:** Adaptación de modelos autorregresivos a lenguajes moleculares (SMILES) y secuencias proteicas (ej. ESMFold) para el diseño *de novo* de fármacos y enzimas.

---

## 4. Ventajas, Limitaciones y Riesgos

A pesar de su capacidad sin precedentes, los LLMs plantean desafíos computacionales, de fiabilidad y de seguridad ética que restringen su autonomía en entornos de misión crítica.

| Dimensión | Ventajas y Capacidades | Limitaciones Técnicas | Riesgos y Desafíos Éticos |
| :--- | :--- | :--- | :--- |
| **Arquitectura y Generalización** | Generalización *zero-shot*; comprensión sintáctica profunda y capacidad multitarea con una sola red. | Dependencia de ventanas de contexto finitas y coste de memoria cuadrático o lineal en atención. | Ataques por inyección de directivas (*prompt injection*) y extracción de pesos. |
| **Inferencia y Despliegue** | Respuestas en lenguaje fluido natural; gran velocidad con decodificación especulativa y cuantización (INT4/FP8). | Gran huella de VRAM por el almacenamiento de la caché KV (*Key-Value cache*); alto coste energético. | Centralización de infraestructura en proveedores hiperescalares con restricciones de soberanía de datos. |
| **Fiabilidad del Conocimiento** | Condensación de petabytes de conocimiento universal en una representación paramétrica compacta. | Alucinaciones estocásticas: generación de afirmaciones verosímiles pero formalmente falsas. | Difusión masiva de desinformación automatizada y degradación epistémica del contenido en la web. |
| **Alineamiento y Control** | Adaptabilidad a preferencias humanas mediante RLHF, DPO y ajuste fino supervisado (*SFT*). | Dificultad para garantizar cumplimiento estricto de restricciones lógicas o matemáticas sin herramientas. | Propagación de sesgos socioculturales codificados en los datos de pre-entrenamiento. |

---

## 5. Conceptos Relacionados

Para profundizar en la arquitectura y ecosistema de los Grandes Modelos de Lenguaje en esta enciclopedia, se sugiere consultar:

- **Mecanismo de Autoatención y Arquitectura Transformer:** Los fundamentos del producto escalar escalado, matrices Q, K, V y capas de atención multi-cabeza.
- **Alineamiento de IA y RLHF (*Reinforcement Learning from Human Feedback*):** Las metodologías de optimización (como PPO y DPO) utilizadas para guiar modelos pre-entrenados hacia la utilidad, veracidad e inocuidad.
- **Generación Aumentada por Recuperación (RAG):** Arquitecturas híbridas que combinan modelos densos de recuperación en espacios de *embeddings* con generadores autorregresivos.
- **Leyes de Escalamiento Neuronal (*Scaling Laws*):** El marco matemático que cuantifica la relación óptima entre capacidad de cómputo, parámetros de la red y volumen de tokens de entrenamiento.
