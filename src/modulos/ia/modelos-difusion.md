# Modelos de Difusión y Generación Visual Profunda

Los **modelos de difusión** son una clase de modelos generativos probabilísticos fundamentados en la termodinámica de no equilibrio y el cálculo estocástico. Su objetivo es aprender la distribución de probabilidad de datos complejos invirtiendo de forma progresiva un proceso de degradación por ruido gaussiano. Desde los modelos probabilísticos de difusión con eliminación de ruido (*Denoising Diffusion Probabilistic Models* o DDPM) hasta la difusión latente (*Latent Diffusion Models* o LDM, base de Stable Diffusion), complementados por *ControlNet*, *Classifier-Free Guidance* (CFG) y formulaciones de *Flow Matching*, esta familia de modelos se ha establecido como el estándar predominante en síntesis visual de alta resolución y multimodalidad.

---

## 1. Origen e Intuición Fundamental

El marco teórico de los modelos de difusión fue propuesto originalmente por Jascha Sohl-Dickstein et al. (2015), inspirándose en la física estadística y en los procesos de difusión de partículas descritos por la ecuación de Langevin. La intuición de partida es directa: resulta trivial destruir sistemáticamente la estructura de una imagen añadiendo perturbaciones microscópicas de ruido gaussiano hasta convertirla en una señal isotrópica aleatoria; si una red neuronal aprende a predecir y revertir cada micro-etapa de ese deterioro térmico, podrá generar muestras sintéticas coherentes a partir de ruido blanco puro.

En 2020, Jonathan Ho, Ajay Jain y Pieter Abbeel formalizaron **DDPM**, demostrando la convergencia entre la difusión probabilística y el emparejamiento de puntuación (*score matching*). Frente a las Redes Generativas Antagónicas (GAN), cuya optimización min-max suele sufrir de inestabilidad y colapso de modos, los modelos de difusión emplean un objetivo de máxima verosimilitud optimizado mediante una cota inferior de la evidencia (*Evidence Lower Bound* o ELBO), garantizando un aprendizaje estable y una cobertura completa de los modos de la distribución.

No obstante, procesar directamente el espacio de píxeles resultaba prohibitivo en coste computacional. Para superarlo, Rombach et al. (2022) introdujeron los **Modelos de Difusión Latente** (LDM), desacoplando la compresión perceptiva mediante un Autoencoder Variacional (VAE) del modelado generativo y semántico de la difusión.

---

## 2. Arquitectura, Mecánica y Formulación Matemática

### 2.1. Formulación de DDPM

Un proceso de difusión clásico consta de dos cadenas de Markov orientadas en direcciones opuestas:

#### Proceso hacia Adelante (Forward / Noising)
Dada una muestra $x_0 \sim q(x)$, se perturba en $T$ pasos discretos mediante varianzas predefinidas $\beta_1, \dots, \beta_T \in (0, 1)$:

$$q(x_t | x_{t-1}) = \mathcal{N}\left(x_t; \sqrt{1 - \beta_t}\, x_{t-1}, \beta_t \mathbf{I}\right)$$

Definiendo $\alpha_t = 1 - \beta_t$ y $\bar{\alpha}_t = \prod_{s=1}^t \alpha_s$, el truco de reparametrización permite muestrear directamente cualquier estado intermedio $x_t$:

$$x_t = \sqrt{\bar{\alpha}_t}\, x_0 + \sqrt{1 - \bar{\alpha}_t}\,\epsilon, \quad \epsilon \sim \mathcal{N}(0, \mathbf{I})$$

#### Proceso Reverso (Denoising)
La transición inversa $q(x_{t-1} | x_t)$ se aproxima mediante una red parametrizada $p_\theta(x_{t-1} | x_t)$:

$$p_\theta(x_{t-1} | x_t) = \mathcal{N}\left(x_{t-1}; \boldsymbol{\mu}_\theta(x_t, t), \boldsymbol{\Sigma}_\theta(x_t, t)\right)$$

Ho et al. reparametrizan la media $\boldsymbol{\mu}_\theta$ a través de un estimador de ruido $\boldsymbol{\epsilon}_\theta(x_t, t)$:

$$\boldsymbol{\mu}_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}} \left( x_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_\theta(x_t, t) \right)$$

La pérdida simplificada optimizada por descenso de gradiente es:

$$\mathcal{L}_{\text{simple}}(\theta) = \mathbb{E}_{t, x_0, \epsilon} \left[ \| \epsilon - \boldsymbol{\epsilon}_\theta(x_t, t) \|^2 \right]$$

### 2.2. Difusión Latente (LDM / Stable Diffusion) y VAE

Para optimizar recursos, LDM entrena un **Autoencoder Variacional (VAE)**:
- **Codificador ($\mathcal{E}$):** Comprime la imagen $x \in \mathbb{R}^{H \times W \times 3}$ a un espacio latente compacto $z = \mathcal{E}(x) \in \mathbb{R}^{h \times w \times c}$, reduciendo la dimensionalidad espacial (habitualmente un factor $f = 8$).
- **Decodificador ($\mathcal{D}$):** Reconstruye la imagen generada: $\tilde{x} = \mathcal{D}(z)$.

El proceso de difusión se ejecuta en el espacio latente $z$, guiado por capas de atención cruzada (*Cross-Attention*) que inyectan representaciones textuales $\tau_\theta(c)$ de modelos como CLIP o T5.

```
Píxeles:  Imagen x  ----[ VAE E ]---->  z_0  -----------------------> [ VAE D ] ----> Imagen x̃
                                         |                               ^
Latente:                           Difusión / Ruido                      |
                                         v                               |
                                        z_t  ----[ U-Net / DiT ]----+----+
                                                      ^             |
                                                      |             v
Texto:    Prompt c  ----[ CLIP τ(c) ]-----------------+          z̃_0 (desruido)
```

### 2.3. Control y Condicionamiento: CFG y ControlNet

- **Classifier-Free Guidance (CFG):** Ho y Salimans (2021) propusieron alternar el entrenamiento condicional e incondicional descartando el texto con probabilidad $\sim 10\%$. En inferencia, el ruido previsto se ajusta escalando la dirección del condicionamiento con un factor $s \ge 1$:

$$\tilde{\boldsymbol{\epsilon}}_\theta(z_t, c) = \boldsymbol{\epsilon}_\theta(z_t, \emptyset) + s \cdot \left( \boldsymbol{\epsilon}_\theta(z_t, c) - \boldsymbol{\epsilon}_\theta(z_t, \emptyset) \right)$$

- **ControlNet:** Zhang y Agrawala (2023) introdujeron una arquitectura que bloquea los pesos de la red generativa principal y clona sus bloques de codificación, acoplándolos mediante convoluciones $1 \times 1$ inicializadas en cero (*Zero Convolutions*). Esto permite guiar la síntesis con condicionamientos espaciales estrictos (bordes Canny, profundidad o poses humanas) sin desestabilizar el modelo preentrenado.

### 2.4. Flow Matching y Trayectorias Continuas

Modelos de última generación (como Stable Diffusion 3 y Flux) adoptan **Flow Matching** (Lipman et al., 2022). En lugar de ecuaciones diferenciales estocásticas, modelan el transporte óptimo lineal entre una gaussiana $x_0 \sim \mathcal{N}(0, \mathbf{I})$ y los datos reales $x_1$:

$$x_t = (1 - t) x_0 + t x_1, \quad \frac{d x_t}{d t} = x_1 - x_0$$

La red $v_\theta(x_t, t)$ aprende directamente el campo vectorial de velocidad constante:

$$\mathcal{L}_{\text{FM}}(\theta) = \mathbb{E}_{t, x_0, x_1} \left[ \| v_\theta(x_t, t) - (x_1 - x_0) \|^2 \right]$$

Al trazar trayectorias casi rectilíneas, la generación requiere solo de 4 a 15 pasos de integración numérica con solucionadores tipo Euler o Heun.

### 2.5. Implementación en Python: Paso de Muestreo con CFG

```python
import torch
import torch.nn as nn

@torch.no_grad()
def flow_euler_step(
    model: nn.Module,
    z_t: torch.Tensor,
    t: torch.Tensor,
    dt: float,
    ctx_cond: torch.Tensor,
    ctx_uncond: torch.Tensor,
    guidance_scale: float = 7.0
) -> torch.Tensor:
    """Ejecuta un paso de integración Euler para Flow Matching con CFG."""
    # Duplicar estados para inferencia condicional e incondicional simultánea
    z_in = torch.cat([z_t, z_t], dim=0)
    t_in = torch.cat([t, t], dim=0)
    ctx_in = torch.cat([ctx_cond, ctx_uncond], dim=0)

    # Predecir campo de velocidad y aplicar CFG
    v_pred = model(z_in, t_in, ctx_in)
    v_cond, v_uncond = v_pred.chunk(2, dim=0)
    v_guided = v_uncond + guidance_scale * (v_cond - v_uncond)

    # Actualizar estado latente hacia el objetivo x_1
    return z_t + v_guided * dt
```

---

## 3. Casos de Uso y Aplicaciones Reales

* **Síntesis y Edición Multimedia:** Generación de arte conceptual, diseño de interfaces, publicidad y efectos visuales cinematográficos mediante plataformas como Stable Diffusion, Midjourney y sistemas de vídeo generativo.
* **Diseño Molecular y Plegamiento de Proteínas:** Aplicaciones como *RFdiffusion* implementan difusión en variedades geométricas para sintetizar estructuras de novo con afinidades biológicas diana, acelerando la ingeniería farmacológica.
* **Imagenología Médica y Aumento de Datos:** Síntesis de tomografías computarizadas y resonancias magnéticas realistas para equilibrar datos escasos en enfermedades raras, preservando la privacidad del paciente.
* **Restauración y Super-Resolución:** Reparación de artefactos de compresión, reconstrucción de imágenes satelitales degradadas y eliminación controlada de ruido en astronomía y fotografía profesional.
* **Políticas de Control Robótico:** Implementación de *Diffusion Policy*, modelando secuencias de acciones multimodales continuas para manipuladores robóticos.

---

## 4. Ventajas, Limitaciones y Riesgos

### Tabla Comparativa de Modelos Generativos Visuales

| Enfoque | Estabilidad | Cobertura de Modos | Calidad y Detalle | Pasos de Inferencia | Controlabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GANs (StyleGAN)** | Baja (min-max) | Media (riesgo de colapso) | Excelente | 1 paso directo | Moderada |
| **VAE Clásico** | Alta (ELBO) | Completa | Media / Difusa | 1 paso directo | Baja |
| **DDPM (Píxeles)** | Muy Alta | Completa | Sobresaliente | 250 - 1000 pasos | Media |
| **Latent Diffusion** | Muy Alta | Completa y granular | Sobresaliente | 20 - 50 pasos | Muy Alta (ControlNet/Cross-Attn) |
| **Flow Matching** | Óptima | Completa y estructurada | Estado del arte | 4 - 15 pasos | Sobresaliente (DiT) |

### Limitaciones y Riesgos Principales

1. **Coste Computacional de Inferencia:** A pesar de optimizadores ODE rápidos, las múltiples evaluaciones secuenciales de modelos de varios miles de millones de parámetros demandan hardware de aceleración (GPU/TPU) y dificultan su adopción en tiempo real estricto (<30 ms).
2. **Coherencia Anatómica y Espaciotemporal:** Al ser aproximadores estadísticos sin comprensión de leyes físicas, los modelos pueden inducir aberraciones anatómicas (dedos anómalos, simetrías rotas) o discontinuidades físicas en vídeo.
3. **Propiedad Intelectual y Memorización:** En regímenes con sobremuestreo de patrones de entrenamiento, existe la posibilidad demostrada de memorización directa de imágenes con copyright protegidas.
4. **Desinformación y Suplantación:** La capacidad para generar contenido fotorrealista facilita la proliferación de *deepfakes*, requiriendo estándares de auditoría y marcado criptográfico de procedencia (*C2PA*, marcas invisibles de agua).

---

## 5. Conceptos Relacionados

* **Redes Generativas Antagónicas (GAN):** Paradigma competitivo de inferencia en un solo paso, antecedente y principal contraparte en velocidad y entrenamiento.
* **Autoencoders Variacionales (VAE):** Estructura generativa fundacional cuyo espacio latente probabilístico sustenta la compresión eficiente de LDM.
* **Diffusion Transformers (DiT):** Evolución estructural que reemplaza la red U-Net convolucional por arquitecturas Transformer escalables, base de modelos como Flux y Sora.
* **Ecuaciones Diferenciales Estocásticas (SDE) y Transporte Óptimo:** Marco matemático continuo que unifica el modelado score-based y la difusión hacia flujos rectilíneos de probabilidad.
