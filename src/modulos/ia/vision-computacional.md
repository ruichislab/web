# Visión Computacional: Redes Convolucionales, ResNet, Vision Transformers, YOLO y Segment Anything Model (SAM)

La **visión computacional** es la disciplina de la inteligencia artificial y el aprendizaje automático orientada a modelar la percepción visual algorítmica, permitiendo a los sistemas computacionales inferir representaciones semánticas y geométricas de alto nivel a partir de tensores de datos visuales. Su espectro metodológico abarca desde tareas discriminativas como la clasificación global de imágenes hasta la detección simultánea de objetos en tiempo real y la segmentación granular a nivel de píxel. Tras superar la fase clásica de descriptores geométricos artesanales, el campo experimentó una transformación paradigmática con las arquitecturas neuronales profundas y la reciente emergencia de modelos fundacionales basados en atención.

---

## 1. Origen e Intuición Fundamental

Durante décadas, la visión por computador se estructuró sobre descriptores artesanales como SIFT (*Scale-Invariant Feature Transform*), SURF y HOG (*Histogram of Oriented Gradients*). Aunque matemáticamente rigurosos ante transformaciones afines, presentaban una rigidez intrínseca ante oclusiones severas, variaciones lumínicas y deformaciones no rígidas.

La base biológica de las arquitecturas contemporáneas proviene de las investigaciones de David Hubel y Torsten Wiesel (1959-1962) sobre la corteza visual primaria. Demostraron que el procesamiento retinotópico es jerárquico: células simples responden a gradientes de orientación y bordes locales, mientras que células complejas sintetizan estas respuestas para otorgar invarianza espacial. Este esquema inspiró el *Neocognitron* de Fukushima (1980) y la red LeNet-5 de Yann LeCun (1998).

En 2012, la victoria de AlexNet consolidó el aprendizaje de representaciones directamente desde píxeles brutos. La intuición de las Redes Neuronales Convolucionales (CNN) se apoya en dos sesgos inductivos cardinales:
1. **Localidad espacial:** Los píxeles adyacentes presentan una correlación semántica superior a los distantes.
2. **Equivarianza a la traslación:** Los patrones visuales conservan su identidad con independencia de su posición espacial, lo que legitima la compartición de parámetros mediante núcleos (*kernels*) deslizantes.

Conforme las redes crecieron en profundidad, la saturación y degradación del gradiente se erigieron como barreras críticas, resueltas en 2015 por ResNet mediante atajos residuales. Posteriormente, la necesidad de sortear la restricción del campo receptivo local motivó la adopción de la autoatención en visión con los Vision Transformers (ViT, 2020), mientras que la inferencia en tiempo real y la segmentación interactiva generalizable se materializaron en modelos de referencia como YOLO y SAM.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### 2.1 Convolución Discreta 2D y Dinámica Espacial

La operación de convolución discreta bidimensional (correlación cruzada) entre un tensor de entrada $I \in \mathbb{R}^{H \times W \times C_{in}}$ y un banco de filtros $K \in \mathbb{R}^{k_h \times k_w \times C_{in} \times C_{out}}$ para un canal de salida $c$ se define como:

$$S(i, j, c) = b_c + \sum_{m=0}^{k_h-1} \sum_{n=0}^{k_w-1} \sum_{d=0}^{C_{in}-1} I(i \cdot s + m, j \cdot s + n, d) \cdot K(m, n, d, c)$$

Donde $s$ denota el paso (*stride*) y $b_c$ el sesgo. La resolución espacial de salida con relleno (*padding*) $p$ se calcula mediante:

$$O_h = \left\lfloor \frac{H - k_h + 2p}{s} \right\rfloor + 1, \quad O_w = \left\lfloor \frac{W - k_w + 2p}{s} \right\rfloor + 1$$

### 2.2 Bloques Residuales y Flujo de Gradiente (ResNet)

En lugar de ajustar una función subyacente $\mathcal{H}(\mathbf{x})$ con capas convolucionales apiladas, Kaiming He et al. (2015) parametrizaron la señal como un residuo: $\mathcal{F}(\mathbf{x}) = \mathcal{H}(\mathbf{x}) - \mathbf{x}$. La formulación del bloque residual resulta en:

$$\mathbf{y} = \mathcal{F}(\mathbf{x}, \{W_i\}) + \mathbf{x}$$

```
Entrada x ---> [ Conv 3x3 + BatchNorm + ReLU ] ---> [ Conv 3x3 + BatchNorm ] ---> (+) ---> ReLU ---> Salida y
      |                                                                            ^
      +---------------------------- Conexión Identidad ----------------------------+
```

Bajo retropropagación con función de pérdida $\mathcal{E}$, la derivada respecto a una activación intermedia $\mathbf{x}_l$ para una capa superior $L$ es:

$$\frac{\partial \mathcal{E}}{\partial \mathbf{x}_l} = \frac{\partial \mathcal{E}}{\partial \mathbf{x}_L} \left( \mathbf{I} + \frac{\partial}{\partial \mathbf{x}_l} \sum_{i=l}^{L-1} \mathcal{F}(\mathbf{x}_i, W_i) \right)$$

La presencia del operador identidad $\mathbf{I}$ asegura una vía directa para la propagación del gradiente, evitando que se atenúe exponencialmente con la profundidad.

### 2.3 Vision Transformers (ViT)

El Vision Transformer (Dosovitskiy et al., 2020) abandona el sesgo convolucional procesando la imagen como una secuencia unidimensional de parches planos.
* **Tokenización:** Una imagen $\mathbf{x} \in \mathbb{R}^{H \times W \times C}$ se particiona en $N = \frac{HW}{P^2}$ parches de dimensión $P \times P$.
* **Proyección e incrustación:** Cada parche se proyecta a dimensión latente $D$ mediante la matriz $E \in \mathbb{R}^{(P^2 C) \times D}$, incorporando un vector de clase $\mathbf{x}_{class}$ y términos de posición $\mathbf{E}_{pos}$:
  $$\mathbf{z}_0 = [\mathbf{x}_{class}; \, \mathbf{x}_p^1 E; \dots; \, \mathbf{x}_p^N E] + \mathbf{E}_{pos}$$
* **Autoatención Multi-Cabezal (MSA):**
  $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$
Esto confiere un campo receptivo global instantáneo con costo computacional $\mathcal{O}(N^2)$.

### 2.4 Detección en Tiempo Real: YOLO (*You Only Look Once*)

YOLO (Redmon et al., 2016) reformuló la detección multiobjeto: en lugar de generar propuestas de región iterativas (familia R-CNN), estructura el problema como una regresión directa en una sola pasada de red.
* Divide la imagen en una cuadrícula $S \times S$.
* Cada celda predice simultáneamente coordenadas delimitadoras relativas $(t_x, t_y, t_w, t_h)$, confianza objetual $P(\text{Objeto})$ y probabilidades condicionales de clase $P(\text{Clase}_c | \text{Objeto})$.
* El entrenamiento emplea pérdidas compuestas basadas en métricas IoU continuas (CIoU) y filtrado de colisiones espaciales mediante supresión de no máximos (NMS) en tiempo real.

### 2.5 Segmentación Fundacional: SAM (*Segment Anything Model*)

SAM (Kirillov et al., 2023) desacopla la percepción visual profunda del procesamiento de instrucciones en tiempo real:
* **Image Encoder:** Un ViT pesado genera representaciones densas de la imagen una única vez.
* **Prompt Encoder:** Transforma puntos, cajas delimitadoras o máscaras en incrustaciones de atención dispersas.
* **Mask Decoder:** Capas ligeras de atención cruzada fusionan las características del prompt y de la imagen para producir múltiples hipótesis de segmentación e índices IoU en sub-50 ms.

```python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """Implementación canónica de un bloque residual con conexión de atajo."""
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv_path = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(out_channels)
        )
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.relu(self.conv_path(x) + self.shortcut(x))
```

---

## 3. Casos de Uso y Aplicaciones Reales

* **Vehículos Autónomos y Robótica Móvil:** Localización ultrarrápida de obstáculos y peatones con arquitecturas YOLO, combinadas con segmentación de carril y superficies transitables.
* **Diagnóstico Médico por Imágenes:** Detección de lesiones patológicas en radiografías y resonancias magnéticas, así como segmentación asistida de núcleos celulares en patología digital con SAM.
* **Control de Calidad Industrial:** Inspección micrométrica automatizada en líneas de fabricación de obleas de semiconductores mediante CNNs optimizadas.
* **Observación Satelital y Teledetección:** Cartografía de cobertura vegetal, estimación de estrés hídrico y análisis de catástrofes con Vision Transformers multiespectrales.

---

## 4. Ventajas, Limitaciones y Riesgos

| Paradigma / Modelo | Fortalezas Principales | Limitaciones Técnicas | Caso Óptimo de Aplicación |
| :--- | :--- | :--- | :--- |
| **CNN Clásicas** | Fuerte sesgo inductivo local; gran eficiencia muestral en datasets pequeños. | Campo receptivo local limitado; rigidez ante deformaciones afines globales. | Inferencia en hardware perimetral (*edge*) y microcontroladores. |
| **ResNet** | Mitiga el desvanecimiento del gradiente; posibilita arquitecturas ultra profundas. | Alto consumo de memoria para activaciones durante el entrenamiento. | Red de extracción de características base (*backbone*) multipropósito. |
| **Vision Transformers (ViT)** | Captura de dependencias globales sin sesgo de proximidad; alta escalabilidad. | Complejidad cuadrática $\mathcal{O}(N^2)$; alta exigencia de datos previos. | Modelos fundacionales masivos y percepción multimodal. |
| **YOLO** | Velocidad de inferencia sobresaliente en una sola pasada (>60 FPS). | Dificultad histórica ante agrupaciones densas de objetos diminutos. | Detección de objetos en video y sistemas embebidos de tiempo real. |
| **SAM** | Gran capacidad *zero-shot*; interactividad flexible con diversos prompts. | Codificador de imagen computacionalmente pesado; sin etiquetas semánticas nativas. | Segmentación interactiva, anotación de datos y recorte biomédico. |

### Riesgos y Consideraciones Críticas
* **Vulnerabilidad Adversaria:** Susceptibilidad a perturbaciones imperceptibles en píxeles que desvían erróneamente clasificaciones críticas en seguridad.
* **Sesgo Algorítmico:** Disparidades de rendimiento en reconocimiento facial debidas a bases de datos subrepresentadas.
* **Vigilancia y Privacidad:** Riesgos derivados del monitoreo visual biométrico masivo no consentido.

---

## 5. Conceptos Relacionados

* **Aprendizaje Profundo (Deep Learning):** Paradigma jerárquico base sobre el que operan los extractores convolucionales y basados en atención.
* **Mecanismos de Atención y Transformers:** Principio matemático de ponderación de secuencias extrapolado exitosamente de NLP a visión.
* **Aprendizaje Autosupervisado (Self-Supervised Learning):** Esquemas como MAE y DINO que posibilitan el entrenamiento de modelos de visión sin etiquetas manuales.
* **Modelos de Difusión:** Sistemas generativos condicionales que integran encoders visuales para la síntesis de imágenes.
