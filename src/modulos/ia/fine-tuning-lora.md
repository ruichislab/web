# Fine-Tuning y Adaptación Eficiente de Parámetros (PEFT): Full Fine-Tuning vs. LoRA, QLoRA, SFT y Fusión de Adaptadores

El **Ajuste Fino** (*Fine-Tuning*) constituye la metodología central para especializar modelos fundacionales preentrenados en tareas, estilos y dominios específicos. En la era de los Modelos de Lenguaje Masivos (*Large Language Models*, LLMs) y arquitecturas con decenas o cientos de miles de millones de parámetros, el ajuste fino tradicional de todos los pesos (*Full Fine-Tuning*, FFT) impone requerimientos computacionales prohibitivos que saturan la memoria de procesamiento gráfico (VRAM). Para superar este cuello de botella surgieron las técnicas de **Adaptación Eficiente de Parámetros** (*Parameter-Efficient Fine-Tuning*, PEFT), entre las cuales destacan **LoRA** (*Low-Rank Adaptation*) y **QLoRA** (*Quantized LoRA*). Estos métodos permiten adaptar modelos de escala masiva optimizando únicamente una pequeña fracción de parámetros adicionales (generalmente inferior al 1%), preservando los pesos base intactos y habilitando la consolidación o fusión directa en inferencia sin penalización de latencia.

---

## 1. Origen e Intuición Fundamental

### El Colapso de Memoria en Full Fine-Tuning
En el entrenamiento clásico supervisado (*Supervised Fine-Tuning*, SFT) de una red neuronal, la optimización requiere calcular y almacenar gradientes para la totalidad de los parámetros del modelo. Cuando se emplea un optimizador estándar basado en momentos como AdamW, el consumo de memoria estática por cada parámetro en precisión de media coma flotante (FP16 o BF16, 2 bytes) escala dramáticamente:

1. **Pesos del modelo:** 2 bytes.
2. **Gradientes:** 2 bytes.
3. **Estados del optimizador (AdamW):** 8 bytes (primer momento $m_t$ y segundo momento $v_t$ en FP32 de 4 bytes cada uno).
4. **Copia de respaldo en FP32 para acumulación:** 4 bytes.

Esto totaliza aproximadamente **16 a 20 bytes de memoria por parámetro**, sin incluir el almacenamiento transitorio de activaciones intermedias (*activation memory*), el tamaño de lote (*batch size*) ni la longitud de contexto. Por consiguiente, ajustar completamente un modelo de 70.000 millones de parámetros (70B) demanda más de 1,2 a 1,4 terabytes de VRAM distribuida, exigiendo clústeres empresariales de GPUs H100/A100 inaccesibles para la mayoría de los investigadores y laboratorios.

### La Hipótesis de la Dimensión Intrínseca
En 2020, investigaciones sobre la geometría del espacio de pérdidas en redes neuronales (Aghajanyan et al.) demostraron que las modificaciones efectivas que sufre una red preentrenada durante el ajuste fino residen en un subespacio de dimensionalidad intrínseca notablemente baja. Es decir, los modelos densos están sobreparametrizados para la tarea de adaptación: las matrices de actualización de peso $\Delta W$ exhiben un espectro de valores singulares que decae exponencialmente, indicando que la mayor parte de la información relevante se concentra en unos pocos grados de libertad.

Inspirados en este principio, Edward Hu y sus colaboradores en Microsoft propusieron en 2021 **LoRA (Low-Rank Adaptation)**: congelar los pesos preentrenados del modelo base y modelar la variación de pesos $\Delta W$ como el producto de dos matrices de bajo rango. Posteriormente, en 2023, Tim Dettmers et al. introdujeron **QLoRA**, combinando la cuantización del modelo base a 4 bits con adaptadores de bajo rango, democratizando el ajuste fino de modelos masivos en GPUs individuales de consumo comercial.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### Formulación Matemática de LoRA
Sea una capa lineal preentrenada con matriz de pesos $W_0 \in \mathbb{R}^{d \times k}$. Para una entrada $x \in \mathbb{R}^{b \times d}$ (donde $b$ representa la dimensión de lote y longitud de secuencia), la transformación densa original produce:

$$h_0 = x W_0$$

Durante el ajuste fino estándar, la matriz se actualiza como $W = W_0 + \Delta W$. En LoRA, la matriz de cambio $\Delta W \in \mathbb{R}^{d \times k}$ se parametriza mediante la descomposición matricial de bajo rango:

$$\Delta W = B \cdot A$$

donde:
- $A \in \mathbb{R}^{r \times k}$
- $B \in \mathbb{R}^{d \times r}$
- El hiperparámetro de rango $r \ll \min(d, k)$ define el número de columnas y filas intermedias (usualmente $r \in \{4, 8, 16, 32, 64\}$).

La salida de la capa adaptada se calcula en paralelo sumando la proyección lineal base (congelada) y la contribución modulada del adaptador:

$$h = x W_0 + \frac{\alpha}{r} (x A^T) B^T$$

*(o en notación estándar vector-matriz por columna: $h = W_0 x + \frac{\alpha}{r} B A x$)*.

#### Inicialización y Factor de Escala ($\alpha$)
- **Inicialización:** La matriz $A$ se inicializa habitualmente mediante una distribución gaussiana aleatoria $\mathcal{N}(0, \sigma^2)$ (o Kaiming normal/uniforme), mientras que la matriz $B$ se inicializa estrictamente en **ceros** ($B = 0$). De este modo, en el paso de entrenamiento $t = 0$:
  $$\Delta W = B \cdot A = 0 \cdot A = 0$$
  El modelo comienza su proceso de optimización exactamente con el comportamiento y rendimiento del modelo base original, sin perturbaciones iniciales indeseadas.
- **Factor de Escala $\frac{\alpha}{r}$:** El escalar constante $\alpha$ modula la magnitud del gradiente transmitido a los adaptadores. Al escalar por $\frac{\alpha}{r}$, si se decide modificar experimentalmente el rango $r$ (por ejemplo, de $r=8$ a $r=32$), la intensidad del aprendizaje se mantiene estable sin necesidad de recalibrar exhaustivamente la tasa de aprendizaje (*learning rate*). Comúnmente se define $\alpha = 2r$ o $\alpha = r$.

```
     Entrada x
      │      │
      │      ▼
      │   ┌──────────────────────────┐
      │   │ Matriz A: (d x r)        │ <- Inicialización Gaussiana
      │   └──────────┬───────────────┘
      │              ▼
      │   ┌──────────────────────────┐
      │   │ Matriz B: (r x k)        │ <- Inicialización en Ceros (0)
      │   └──────────┬───────────────┘
      │              ▼
      │       Escalado: * (α / r)
      ▼              │
┌──────────────┐     │
│ Matriz W0    │     │
│ (Congelada)  │     │
└──────┬───────┘     │
       │             │
       ▼             ▼
       [     (+)     ]  <── Suma de salidas
              │
              ▼
           Salida h
```

### Innovaciones de QLoRA: NF4, Double Quantization y Paged Optimizers
QLoRA extiende la arquitectura de LoRA al incorporar tres innovaciones algorítmicas críticas:

1. **Cuantización NormalFloat4 (NF4):** Tipo de datos óptimo desde la teoría de la información para tensores cuyos pesos siguen una distribución normal empírica $\mathcal{N}(0, \sigma^2)$. NF4 asigna un número igual de valores de parámetros a cada uno de sus 16 intervalos discretos, maximizando la entropía y minimizando el error de cuantización frente a enteros estándar (INT4).
2. **Cuantización Doble (*Double Quantization*, DQ):** Proceso que cuantiza las propias constantes de escala de cuantización del modelo. Reduce la huella de memoria de los metadatos de escala de 0,5 bits por parámetro a aproximadamente 0,127 bits por parámetro, ahorrando gigabytes cruciales en modelos masivos.
3. **Optimizadores Paginados (*Paged Optimizers*):** Mecanismo basado en memoria unificada de CUDA (CUDA Unified Memory) que expulsa dinámicamente páginas de memoria del optimizador hacia la RAM del CPU durante picos esporádicos de activación, impidiendo fallos catastróficos por desbordamiento de memoria (*Out of Memory*, OOM).

### Fusión de Adaptadores (*Weight Merging*)
Al finalizar el entrenamiento, no es necesario mantener la ejecución bifurcada de las ramas $W_0$ y $B \cdot A$. Puesto que la transformación es lineal, los pesos entrenados del adaptador pueden colapsarse algebraicamente dentro de la matriz preentrenada:

$$W_{\text{final}} = W_0 + \frac{\alpha}{r} (B \cdot A)$$

Esta operación de fusión (*merge*) devuelve un modelo con idéntica arquitectura que el original. Por ende, en entornos de producción, la inferencia se ejecuta a la máxima velocidad teórica del modelo base, sin incurrir en latencia computacional adicional ni modificaciones en el motor de servicio.

### Implementación Vectorizada en PyTorch

```python
import torch
import torch.nn as nn
import math

class LoRALinear(nn.Module):
    """
    Capa Lineal con adaptación LoRA integrada (Low-Rank Adaptation).
    Mantiene la matriz base congelada y entrena únicamente matrices A y B.
    """
    def __init__(self, in_features: int, out_features: int, r: int = 16, lora_alpha: float = 32.0):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.r = r
        self.scaling = lora_alpha / r
        
        # 1. Capa densa base congelada
        self.linear = nn.Linear(in_features, out_features, bias=False)
        self.linear.weight.requires_grad = False
        
        # 2. Matrices de bajo rango entrenables
        self.lora_A = nn.Parameter(torch.empty(r, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, r))
        
        # Inicialización de pesos
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)
        
        self.merged = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.merged:
            return self.linear(x)
        
        # Inferencia o entrenamiento con bifurcación de bajo rango
        base_output = self.linear(x)
        # delta_output = x @ A^T @ B^T * scaling
        lora_output = (x @ self.lora_A.t()) @ self.lora_B.t() * self.scaling
        return base_output + lora_output

    def merge_weights(self):
        """Fusiona los pesos del adaptador en la matriz principal para inferencia sin sobrecoste."""
        if not self.merged:
            # W_merged = W_0 + scaling * (B @ A)
            delta_w = (self.lora_B @ self.lora_A) * self.scaling
            self.linear.weight.data += delta_w
            self.merged = True

    def unmerge_weights(self):
        """Revierte la fusión para continuar el entrenamiento."""
        if self.merged:
            delta_w = (self.lora_B @ self.lora_A) * self.scaling
            self.linear.weight.data -= delta_w
            self.merged = False
```

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Ajuste Fino de Instrucciones (*Instruction Tuning* y SFT):**
   Modelos base como LLaMA, Mistral o Gemma se transforman en asistentes conversacionales que siguen directrices complejas mediante el entrenamiento de adaptadores LoRA sobre conjuntos de datos curados de preguntas y respuestas (por ejemplo, formatos Alpaca, ShareGPT o ChatML).
2. **Especialización Vertical en Dominios Críticos:**
   - **Medicina y Farmacología:** Ajuste de adaptadores en terminología clínica (ej. PubMed, codificación ICD-10) manteniendo intacta la capacidad de redacción general.
   - **Sector Jurídico y Financiero:** Adaptación para extracción de cláusulas contractuales, análisis de solvencia y auditoría fiscal sin riesgo de colapso de capacidades cognitivas previas.
3. **Sistemas Multinquilino (*Multi-Tenant Serving*):**
   En arquitecturas de producción distribuidas (empleando frameworks como *vLLM*, *LoRAX* o *Punica*), una única instancia de un modelo de 70B se mantiene residente en la VRAM de la GPU. Cuando llegan peticiones de distintos clientes (atención al cliente, generación de código, traducción), el servidor conmuta en microsegundos el adaptador LoRA correspondiente (cuyo peso oscila típicamente entre 20 MB y 150 MB), reduciendo los costes de infraestructura en más de un 90%.
4. **Modelos de Difusión y Generación de Imágenes:**
   En arquitecturas como Stable Diffusion XL y Flux, LoRA se emplea masivamente para fijar estilos artísticos específicos, personajes, tipografías y conceptos fotográficos sin necesidad de reentrenar los pesados bloques de atención cruzada de la U-Net o del Transformer DiT.

---

## 4. Ventajas, Limitaciones y Riesgos

### Tabla Comparativa de Estrategias de Ajuste

| Dimensión | Full Fine-Tuning (FFT) | LoRA | QLoRA | Prefix / Prompt Tuning |
| :--- | :--- | :--- | :--- | :--- |
| **Parámetros Entrenables** | 100% de la red | 0,05% – 1,0% | 0,05% – 1,0% | < 0,1% (tokens virtuales) |
| **Precisión del Modelo Base** | FP16 / BF16 (16-bit) | FP16 / BF16 (16-bit) | NF4 (4-bit cuantizado) | FP16 / BF16 (16-bit) |
| **Consumo de VRAM (Modelo 70B)** | > 1.200 GB (Multi-Nodo) | ~160–200 GB (8x A100) | ~48–55 GB (2x RTX 3090/4090) | ~150 GB |
| **Velocidad de Inferencia** | Máxima nativa | Máxima (tras fusión `merge`) | Máxima (descuantizando) o nativa NF4 | Ligera penalización (longitud de contexto) |
| **Capacidad de Nuevo Conocimiento** | Muy Alta (modifica toda la memoria) | Media-Alta (orientada a estilo y tarea) | Media-Alta (orientada a estilo y tarea) | Baja-Media (sensible a optimización) |
| **Prevención de Olvido Catastrófico** | Pobre (alta degradación sin regularizar) | Excelente ($W_0$ congelado) | Excelente ($W_0$ congelado) | Excelente |
| **Tamaño de Almacenamiento Checkpoint** | 100% (~140 GB en 70B) | ~50–200 MB por tarea | ~50–200 MB por tarea | < 10 MB |

### Limitaciones y Desafíos Técnicos
- **Capacidad de Ingestión de Conocimiento Fáctico Crudo:** LoRA y QLoRA destacan en adaptar el comportamiento, formato, tono y estilo de razonamiento. No obstante, si el objetivo es incorporar bibliotecas enteras de conocimiento fáctico completamente ausente en el preentrenamiento, el rango acotado $r$ actúa como un cuello de botella de capacidad expresiva. En tales escenarios, el preentrenamiento continuo (*Continual Pre-training*) o el uso de arquitecturas RAG (*Retrieval-Augmented Generation*) resultan superiores.
- **Interferencia y Conflictos en Fusión Multimodelo:** Al combinar múltiples adaptadores entrenados de forma independiente mediante técnicas como *TIES-Merging*, *SLERP* (Spherical Linear Interpolation) o *DARE*, pueden suscitarse colisiones en los subespacios vectoriales (cancelación destructiva de gradientes), exigiendo matrices de ponderación empíricas para mitigar la degradación funcional.
- **Sobrecarga Computacional en Cuantización Dinámica:** En QLoRA, aunque la huella de memoria se minimiza drásticamente mediante NF4, cada paso hacia adelante (*forward pass*) requiere des-cuantizar los pesos a BF16/FP16 en los registros antes de la multiplicación matricial, lo que puede inducir una ralentización temporal de entrenamiento de entre el 20% y el 35% frente a un entorno LoRA puro en punto flotante nativo.

---

## 5. Conceptos Relacionados

- **Modelos de Lenguaje Masivos (LLMs) y Mecanismos de Atención:** Fundamentos arquitectónicos del Transformer sobre cuyas matrices de proyección ($W_q, W_k, W_v, W_o$) y capas *feed-forward* se acoplan prioritariamente las matrices LoRA.
- **Cuantización de Redes Neuronales (GPTQ, AWQ y GGUF):** Técnicas complementarias de compresión numérica posteriores al entrenamiento orientadas a la inferencia de ultra-alta eficiencia.
- **Alineamiento de Modelos (RLHF y DPO):** Métodos de optimización por preferencias humanas (*Reinforcement Learning from Human Feedback* y *Direct Preference Optimization*) que habitualmente se implementan sobre adaptadores LoRA para optimizar la recompensa de seguridad y veracidad.
- **Generación Aumentada por Recuperación (RAG):** Paradigma arquitectónico sinérgico que complementa la especialización procedimental de LoRA proporcionando conocimiento factual verificado y dinámico en tiempo de consulta.
