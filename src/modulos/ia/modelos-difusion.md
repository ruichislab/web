# Modelos de Difusión y Generación Visual Profunda

Los **modelos de difusión** son una clase de modelos generativos probabilísticos basados en la termodinámica de no equilibrio y el cálculo estocástico. Su objetivo es modelar distribuciones complejas invirtiendo un proceso progresivo de degradación por ruido gaussiano. Desde los modelos probabilísticos de difusión con eliminación de ruido (*Denoising Diffusion Probabilistic Models* o DDPM) hasta la difusión latente (*Latent Diffusion Models* o LDM), junto con avances como *ControlNet*, *Classifier-Free Guidance* (CFG) y *Flow Matching*, esta familia de modelos se ha establecido como el estándar predominante en síntesis visual de alta resolución y multimodalidad.

---

## 1. Origen e Intuición Fundamental

El marco conceptual de los modelos de difusión fue propuesto por Sohl-Dickstein et al. (2015), inspirándose en la física estadística y en los procesos descritos por la ecuación de Langevin. La intuición fundamental reside en que resulta trivial destruir la estructura de un dato coherente añadiendo ruido gaussiano progresivamente hasta el vacío térmico; si una red neuronal aprende a predecir y revertir cada micro-etapa de ese deterioro estocástico, podrá sintetizar datos nuevos partiendo de ruido puro.

En 2020, Ho, Jain y Abbeel formalizaron **DDPM**, demostrando la equivalencia matemática entre la difusión y el emparejamiento de puntuación (*score matching*). Frente a las Redes Generativas Antagónicas (GAN), cuya optimización min-max sufre frecuentemente de inestabilidad y colapso de modos, los modelos de difusión emplean un objetivo de máxima verosimilitud optimizado mediante una cota inferior de la evidencia (*Evidence Lower Bound* o ELBO), garantizando cobertura distributiva y estabilidad numérica.

No obstante, operar directamente en el espacio de píxeles resultaba intratable a escala. Rombach et al. (2022) introdujeron los **Modelos de Difusión Latente** (LDM), desacoplando la compresión perceptual mediante un Autoencoder Variacional (VAE) del modelado generativo y semántico de la difusión.

---

## 2. Arquitectura, Mecánica y Formulación Matemática

### 2.1. Formulación de DDPM

Un proceso de difusión clásico se define por dos cadenas de Markov acopladas:

#### Proceso hacia Adelante (Forward / Noising)
Dada una muestra $x_0 \sim q(x)$, se perturba en $T$ pasos según varianzas prefijadas $\beta_1, \dots, \beta_T \in (0, 1)$:

$$q(x_t | x_{t-1}) = \mathcal{N}\left(x_t; \sqrt{1 - \beta_t}\, x_{t-1}, \beta_t \mathbf{I}\right)$$

Con $\alpha_t = 1 - \beta_t$ y $\bar{\alpha}_t = \prod_{s=1}^t \alpha_s$, el truco de reparametrización permite muestrear directamente cualquier estado intermedio:

$$x_t = \sqrt{\bar{\alpha}_t}\, x_0 + \sqrt{1 - \bar{\alpha}_t}\,\epsilon, \quad \epsilon \sim \mathcal{N}(0, \mathbf{I})$$

#### Proceso Reverso (Denoising)
La transición inversa $q(x_{t-1} | x_t)$ se aproxima mediante una red parametrizada $p_\theta(x_{t-1} | x_t) = \mathcal{N}(x_{t-1}; \boldsymbol{\mu}_\theta(x_t, t), \boldsymbol{\Sigma}_\theta(x_t, t))$. Ho et al. parametrizan la media con un estimador de ruido $\boldsymbol{\epsilon}_\theta(x_t, t)$:

$$\boldsymbol{\mu}_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}} \left( x_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_\theta(x_t, t) \right)$$

La función de pérdida simplificada resultante es:

$$\mathcal{L}_{\text{simple}}(\theta) = \mathbb{E}_{t, x_0, \epsilon} \left[ \| \epsilon - \boldsymbol{\epsilon}_\theta(x_t, t) \|^2 \right]$$

### 2.2. Difusión Latente (LDM / Stable Diffusion) y VAE

Para reducir la demanda computacional, LDM utiliza un **Autoencoder Variacional (VAE)**:
- **Codificador ($\mathcal{E}$):** Comprime la imagen $x$ al espacio latente compacto $z = \mathcal{E}(x)$, reduciendo la resolución espacial por un factor $f = 8$.
- **Decodificador ($\mathcal{D}$):** Reconstruye la muestra generada: $\tilde{x} = \mathcal{D}(z)$.

La difusión se ejecuta exclusivamente en el espacio latente $z$, incorporando condicionamiento multimodal (texto o atributos) mediante capas de atención cruzada (*Cross-Attention*).

### 2.3. Control y Condicionamiento: CFG y ControlNet

- **Classifier-Free Guidance (CFG):** Durante el entrenamiento se descarta la condición textual $c$ de forma aleatoria ($\approx 10\%$). En inferencia, se extrapola la dirección semántica según una escala $s \ge 1$:

$$\tilde{\boldsymbol{\epsilon}}_\theta(z_t, c) = \boldsymbol{\epsilon}_\theta(z_t, \emptyset) + s \cdot \left( \boldsymbol{\epsilon}_\theta(z_t, c) - \boldsymbol{\epsilon}_\theta(z_t, \emptyset) \right)$$

- **ControlNet:** Permite añadir restricciones espaciales rígidas (bordes Canny, profundidad o poses). Congela los pesos del modelo preentrenado y clona los bloques codificadores conectándolos mediante convoluciones $1 \times 1$ inicializadas en cero (*Zero Convolutions*), asegurando un aprendizaje estable sin degradar el conocimiento previo.

### 2.4. Flow Matching y Trayectorias Continuas

Modelos de última generación (como Stable Diffusion 3 o Flux) reemplazan las SDE estocásticas por **Flow Matching**. Se modela un transporte óptimo rectilíneo entre ruido $x_0 \sim \mathcal{N}(0, \mathbf{I})$ y datos $x_1$:

$$x_t = (1 - t) x_0 + t x_1, \quad \frac{d x_t}{d t} = x_1 - x_0$$

La red $v_\theta(x_t, t)$ aprende el campo vectorial constante mediante regresión:

$$\mathcal{L}_{\text{FM}}(\theta) = \mathbb{E}_{t, x_0, x_1} \left[ \| v_\theta(x_t, t) - (x_1 - x_0) \|^2 \right]$$

Esto reduce la inferencia a solo 4-15 pasos mediante integradores ODE sencillos.

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
    z_in = torch.cat([z_t, z_t], dim=0)
    t_in = torch.cat([t, t], dim=0)
    ctx_in = torch.cat([ctx_cond, ctx_uncond], dim=0)

    # Inferencia paralela condicional e incondicional
    v_pred = model(z_in, t_in, ctx_in)
    v_cond, v_uncond = v_pred.chunk(2, dim=0)
    v_guided = v_uncond + guidance_scale * (v_cond - v_uncond)

    return z_t + v_guided * dt
```

---

## 3. Casos de Uso y Aplicaciones Reales

* **Síntesis y Diseño Visual:** Generación y edición de contenido fotográfico, diseño publicitario y producción cinematográfica guiada por texto.
* **Diseño Molecular y Plegamiento de Proteínas:** Modelos como *RFdiffusion* sintetizan biomoléculas de novo sobre variedades euclidianas y rotacionales $\mathrm{SE}(3)$, optimizando la ingeniería de fármacos.
* **Diagnóstico e Imagen Médica:** Creación de tomografías computarizadas y resonancias sintéticas para mitigar el sesgo y la escasez de datos patológicos, preservando la privacidad.
* **Restauración y Super-Resolución:** Reparación de imágenes degradadas, reconstrucción de datos satelitales e interpolación espacial.
* **Políticas Robóticas:** Enfoques de *Diffusion Policy* predicen distribuciones multimodales continuas para manipuladores autónomos.

---

## 4. Ventajas, Limitaciones y Riesgos

### Tabla Comparativa de Modelos Generativos Visuales

| Enfoque | Estabilidad | Cobertura de Modos | Calidad Visual | Pasos de Inferencia | Controlabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GANs (StyleGAN)** | Baja (min-max) | Media (riesgo de colapso) | Excelente | 1 paso | Moderada |
| **VAE Clásico** | Alta (ELBO) | Completa | Media / Borrosa | 1 paso | Baja |
| **DDPM (Píxeles)** | Muy Alta | Completa | Sobresaliente | 250 - 1000 pasos | Media |
| **Latent Diffusion** | Muy Alta | Completa y granular | Sobresaliente | 20 - 50 pasos | Muy Alta (ControlNet) |
| **Flow Matching** | Óptima | Completa y estructurada | Estado del arte | 4 - 15 pasos | Sobresaliente (DiT) |

### Limitaciones y Riesgos Principales

1. **Latencia en Inferencia:** A pesar de los solucionadores ODE acelerados, la naturaleza iterativa impone demandas elevadas de GPU, limitando su ejecución en tiempo real interactivo estricto.
2. **Inconsistencias Físicas y Anatómicas:** Los modelos carecen de causalidad física explícita, pudiendo manifestar distorsiones en extremidades, simetrías complejas o dinámicas cinemáticas.
3. **Propiedad Intelectual y Memorización:** Puede producirse extracción no autorizada de muestras en casos de fuerte sobreajuste o duplicación masiva en el corpus de entrenamiento.
4. **Desinformación y Deepfakes:** La alta fidelidad visual facilita la síntesis de engaños realistas, demandando verificación de procedencia criptográfica (marcas C2PA).

---

## 5. Conceptos Relacionados

* **Redes Generativas Antagónicas (GAN):** Paradigma competitivo de inferencia en un solo paso, referente clásico en síntesis rápida.
* **Autoencoders Variacionales (VAE):** Arquitectura generativa que proporciona el espacio latente regularizado empleado por LDM.
* **Diffusion Transformers (DiT):** Sustitución del núcleo U-Net por bloques Transformer, escalando modelos como Flux y Sora.
* **Ecuaciones Diferenciales Estocásticas (SDE) y Transporte Óptimo:** Formulación matemática continua que vincula la difusión con los campos de velocidad y flujos rectilíneos.
