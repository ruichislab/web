# Fine-Tuning y Adaptación Eficiente de Parámetros (PEFT): Full Fine-Tuning vs. LoRA, QLoRA, SFT y Fusión de Adaptadores

El **Ajuste Fino** (*Fine-Tuning*) constituye la metodología central para especializar modelos fundacionales en tareas, estilos y dominios específicos. En la era de los Modelos de Lenguaje Masivos (*Large Language Models*, LLMs) con decenas o cientos de miles de millones de parámetros, el ajuste completo de pesos (*Full Fine-Tuning*, FFT) impone requerimientos computacionales que saturan la memoria gráfica (VRAM). Para superar este límite surgieron las técnicas de **Adaptación Eficiente de Parámetros** (*Parameter-Efficient Fine-Tuning*, PEFT), destacando **LoRA** (*Low-Rank Adaptation*) y **QLoRA** (*Quantized LoRA*). Estos métodos permiten adaptar modelos masivos optimizando únicamente una fracción diminuta de parámetros adicionales (< 1%), preservando los pesos base intactos y permitiendo su fusión directa en inferencia sin penalización de latencia.

---

## 1. Origen e Intuición Fundamental

### El Colapso de Memoria en Full Fine-Tuning
En el entrenamiento supervisado (*Supervised Fine-Tuning*, SFT) tradicional, optimizar una red exige almacenar pesos, gradientes y estados del optimizador. Bajo AdamW en precisión mixta (FP16/BF16, 2 bytes), la memoria estática por parámetro escala drásticamente:

1. **Pesos del modelo:** 2 bytes.
2. **Gradientes:** 2 bytes.
3. **Estados del optimizador (AdamW):** 8 bytes (primer y segundo momento en FP32).
4. **Copia maestra en FP32:** 4 bytes.

Esto suma de **16 a 20 bytes por parámetro**. Sin contar activaciones transitorias ni longitud de contexto, un modelo de 70B parámetros requiere más de 1,2 TB de VRAM distribuida, exigiendo clústeres empresariales de GPUs A100/H100 inaccesibles para la mayoría de entornos.

### La Hipótesis de la Dimensión Intrínseca
En 2020, investigaciones sobre la geometría de pérdidas en redes neuronales (Aghajanyan et al.) demostraron que las actualizaciones efectivas durante el ajuste fino residen en un subespacio de dimensionalidad intrínseca notablemente baja. Los modelos preentrenados están sobreparametrizados: la matriz de actualización $\Delta W$ exhibe valores singulares que decaen con rapidez, concentrando la información útil en pocos grados de libertad.

En 2021, Edward Hu et al. propusieron **LoRA**: congelar la matriz preentrenada $W_0$ y descomponer $\Delta W$ en dos matrices de bajo rango. En 2023, Tim Dettmers et al. introdujeron **QLoRA**, combinando cuantización a 4 bits del modelo base con adaptadores LoRA, democratizando el entrenamiento de modelos masivos en GPUs comerciales.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### Formulación Matemática de LoRA
Dada una capa lineal preentrenada con matriz $W_0 \in \mathbb{R}^{d \times k}$ y entrada $x \in \mathbb{R}^{b \times d}$, la transformación original calcula:

$$h_0 = x W_0$$

En lugar de actualizar $W_0$ directamente ($W = W_0 + \Delta W$), LoRA factoriza la matriz de actualización $\Delta W \in \mathbb{R}^{d \times k}$ como el producto de dos matrices de rango reducido:

$$\Delta W = B \cdot A$$

donde:
- $A \in \mathbb{R}^{r \times k}$
- $B \in \mathbb{R}^{d \times r}$
- El hiperparámetro de rango satisface $r \ll \min(d, k)$ (típicamente $r \in \{4, 8, 16, 32, 64\}$).

La salida de la capa combinada es:

$$h = x W_0 + \frac{\alpha}{r} (x A^T) B^T$$

*(o en formulación vectorial columna: $h = W_0 x + \frac{\alpha}{r} B A x$)*.

#### Inicialización y Factor de Escala ($\alpha$)
- **Inicialización:** $A$ se inicializa mediante una distribución gaussiana aleatoria $\mathcal{N}(0, \sigma^2)$ (o Kaiming normal), y $B$ se inicializa en **ceros** ($B = 0$). Al inicio del entrenamiento ($t = 0$):
  $$\Delta W = B \cdot A = 0 \cdot A = 0$$
  El modelo parte exactamente del comportamiento original sin alterar las representaciones aprendidas.
- **Factor de Escala $\frac{\alpha}{r}$:** El escalar constante $\alpha$ modula la magnitud del gradiente adaptativo. Al normalizar por $\frac{\alpha}{r}$, cambiar el rango $r$ no desestabiliza la tasa de aprendizaje (*learning rate*). Convencionalmente se utiliza $\alpha = 2r$ o $\alpha = r$.

### Innovaciones Algorítmicas de QLoRA
QLoRA reduce la huella de memoria en un 65% adicional mediante tres mecanismos:

1. **Cuantización NormalFloat4 (NF4):** Tipo de datos óptimo para variables con distribución normal $\mathcal{N}(0, \sigma^2)$, asignando igual densidad de probabilidad a cada uno de sus 16 niveles cuantizados.
2. **Cuantización Doble (*Double Quantization*):** Cuantiza las constantes de escala de la primera cuantización, reduciendo el sobrecoste de metadatos de 0,5 a 0,127 bits por parámetro.
3. **Optimizadores Paginados (*Paged Optimizers*):** Gestiona transferencias automáticas de memoria del optimizador entre VRAM y memoria RAM de CPU vía CUDA Unified Memory durante picos de contexto, previniendo errores de falta de memoria (*OOM*).

### Fusión de Adaptadores (*Weight Merging*)
Al finalizar el entrenamiento, gracias a la linealidad de la transformación, los pesos del adaptador pueden fusionarse analíticamente en la matriz base:

$$W_{\text{final}} = W_0 + \frac{\alpha}{r} (B \cdot A)$$

Esta suma directa genera un único conjunto de pesos equivalente. En producción, el modelo se despliega sin ramas paralelas ni latencia adicional de inferencia.

### Implementación en PyTorch

```python
import torch
import torch.nn as nn
import math

class LoRALinear(nn.Module):
    """Capa lineal con adaptación de bajo rango (LoRA)."""
    def __init__(self, in_features: int, out_features: int, r: int = 16, lora_alpha: float = 32.0):
        super().__init__()
        self.r = r
        self.scaling = lora_alpha / r
        
        # Capa densa original congelada
        self.linear = nn.Linear(in_features, out_features, bias=False)
        self.linear.weight.requires_grad = False
        
        # Matrices de adaptación de bajo rango
        self.lora_A = nn.Parameter(torch.empty(r, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, r))
        
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)
        self.merged = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.merged:
            return self.linear(x)
        base = self.linear(x)
        lora = (x @ self.lora_A.t()) @ self.lora_B.t() * self.scaling
        return base + lora

    def merge_weights(self):
        """Fusiona los pesos de LoRA en la matriz principal para inferencia."""
        if not self.merged:
            self.linear.weight.data += (self.lora_B @ self.lora_A) * self.scaling
            self.merged = True
```

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Ajuste Fino de Instrucciones (SFT Conversacional):** Modelos preentrenados como LLaMA o Mistral se especializan para responder instrucciones directas mediante adaptadores LoRA entrenados sobre diálogos estructurados (formatos Alpaca o ChatML).
2. **Especialización Vertical de Dominio:** En medicina (informes clínicos, codificación CIE), derecho (revisión de contratos) y finanzas, donde se requiere dominar taxonomías técnicas complejas sin destruir las competencias lingüísticas generales.
3. **Servicio Multitarea Multinquilino (*Multi-Tenant Serving*):** Plataformas como vLLM o LoRAX alojan un único modelo base (ej. 70B) en VRAM y conmutan dinámicamente adaptadores específicos por petición de cliente (20–100 MB cada uno), disminuyendo drásticamente los costes operacionales.
4. **Personalización en Modelos de Difusión:** En síntesis visual (Stable Diffusion XL, Flux), LoRA permite incorporar personajes, estilos visuales y conceptos propietarios sin alterar los bloques troncales del modelo generativo.

---

## 4. Ventajas, Limitaciones y Riesgos

### Comparativa de Técnicas de Adaptación

| Dimensión | Full Fine-Tuning (FFT) | LoRA | QLoRA | Prefix / Prompt Tuning |
| :--- | :--- | :--- | :--- | :--- |
| **Parámetros Entrenables** | 100% | 0,05% – 1,0% | 0,05% – 1,0% | < 0,1% (tokens virtuales) |
| **Precisión de Base** | 16 bits (FP16/BF16) | 16 bits (FP16/BF16) | 4 bits (NF4) | 16 bits (FP16/BF16) |
| **VRAM Modelo 70B** | > 1.200 GB | ~160–200 GB | ~48–55 GB | ~150 GB |
| **Latencia Inferencia** | Nativa | Nativa (tras fusión) | Nativa (tras fusión) | Sobrecarga de longitud |
| **Olvido Catastrófico** | Alto riesgo | Mínimo ($W_0$ congelado) | Mínimo ($W_0$ congelado) | Mínimo |
| **Peso del Checkpoint** | 100% (~140 GB) | ~50–200 MB | ~50–200 MB | < 10 MB |

### Limitaciones y Consideraciones
- **Incorporación de Conocimiento Fáctico Masivo:** LoRA sobresale ajustando estilo, formato y alineamiento. Cuando se requiere incorporar grandes volúmenes de conocimiento nuevo inexistente en el preentrenamiento, el rango acotado $r$ genera un cuello de botella expresivo frente al preentrenamiento continuo o a sistemas RAG.
- **Interferencia en Mezcla de Adaptadores:** La combinación directa de múltiples adaptadores LoRA (vía *SLERP*, *TIES* o promedios ponderados) puede generar interferencia destructiva en los subespacios de atención, demandando validación empírica.
- **Coste de Descuantización en QLoRA:** El desempaquetado de NF4 a BF16/FP16 durante los pasos de propagación introduce una penalización en tiempo de entrenamiento (20–35% más lento que LoRA FP16 puro).

---

## 5. Conceptos Relacionados

- **Modelos de Lenguaje Masivos (LLMs) y Transformers:** Arquitectura neuronal cuyos módulos de atención y capas lineales actúan como objetivo de adaptación en LoRA.
- **Cuantización de Redes Neuronales (GPTQ, AWQ, GGUF):** Técnicas de compresión para inferencia complementarias a la cuantización NF4 de entrenamiento.
- **Alineamiento de Modelos (RLHF y DPO):** Métodos de alineamiento con preferencias humanas comúnmente ejecutados sobre adaptadores LoRA.
- **Generación Aumentada por Recuperación (RAG):** Arquitectura sinérgica que provee información factual actualizada sin modificar los pesos del modelo.
