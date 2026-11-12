# Visión Computacional: Redes Convolucionales, ResNet, Vision Transformers, YOLO y Segment Anything Model (SAM)

La **visión computacional** es la disciplina de la inteligencia artificial y el aprendizaje automático dedicada a modelar la percepción visual algorítmica, permitiendo a los sistemas computacionales extraer representaciones semánticas de alto nivel a partir de tensores de datos visuales bidimensionales o tridimensionales. Su alcance abarca desde tareas discriminativas elementales como la clasificación de imágenes y la regresión de coordenadas espaciales, hasta la detección simultánea de objetos en tiempo real y la segmentación perceptual a nivel de píxel. Históricamente dependiente de la ingeniería manual de características, el área experimentó un cambio de paradigma con la consolidación de las redes neuronales profundas y, más recientemente, con la adopción de arquitecturas basadas en autoatención y modelos fundacionales de segmentación generalizable.

---

## 1. Origen e Intuición Fundamental

Durante décadas, la visión por computador dependió de descriptores artesanales diseñados por expertos, como SIFT (*Scale-Invariant Feature Transform*), SURF y los histogramas de gradientes orientados (HOG). Estos métodos extraían primitivas geométricas invariantes a transformaciones afines, pero carecían de adaptabilidad ante variaciones complejas de iluminación, oclusión y deformación no rígida.

La base biológica de la visión moderna proviene de los experimentos electrofisiológicos de David Hubel y Torsten Wiesel (1959-1962) sobre la corteza visual primaria felina. Descubrieron que las neuronas poseen campos receptivos locales sensibles a patrones específicos (bordes y orientaciones) y que el procesamiento visual se organiza en una jerarquía retinotópica: células simples detectan contrastes locales, mientras que células complejas integran estas señales para capturar invarianzas. Este principio inspiró el *Neocognitron* de Kunihiko Fukushima (1980) y, posteriormente, la arquitectura LeNet-5 de Yann LeCun (1998).

El punto de inflexión definitivo ocurrió en 2012 con AlexNet, que demostró que el aprendizaje directo de representaciones a partir de píxeles mediante optimización por gradiente descendente superaba con creces a cualquier descriptor manual. La intuición estructural de las Redes Neuronales Convolucionales (CNN) reside en dos sesgos inductivos fundamentales:
1. **Localidad espacial:** Los píxeles contiguos exhiben una correlación estadística sustancialmente mayor que los píxeles distantes.
2. **Equivarianza a la traslación:** Una característica visual (como un contorno o una textura) conserva su significado independientemente de su posición en la cuadrícula de la imagen, lo que justifica la compartición de pesos mediante núcleos de convolución.

A medida que las redes se profundizaron para capturar semánticas más complejas, surgió el problema de la degradación del entrenamiento y el desvanecimiento del gradiente, resuelto elegantemente por ResNet (2015) mediante conexiones residuales. Posteriormente, la necesidad de modelar relaciones globales de largo alcance sin estar limitados por el tamaño del kernel convolucional impulsó la adaptación del mecanismo de autoatención a la visión mediante los Vision Transformers (ViT, 2020), mientras que la inferencia en tiempo real y la interacción generalizable quedaron personificadas por YOLO en detección y SAM en segmentación fundacional.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### 2.1 Convolución Discreta 2D y Dinámica Espacial

En el procesamiento de imágenes tensoriales, la operación de convolución discreta (formalmente una correlación cruzada sin inversión de kernel) entre un mapa de características de entrada $I \in \mathbb{R}^{H \times W \times C_{in}}$ y un banco de filtros $K \in \mathbb{R}^{k_h \times k_w \times C_{in} \times C_{out}}$ se expresa para un canal de salida $c$ como:

$$S(i, j, c) = b_c + \sum_{m=0}^{k_h-1} \sum_{n=0}^{k_w-1} \sum_{d=0}^{C_{in}-1} I(i \cdot s + m, j \cdot s + n, d) \cdot K(m, n, d, c)$$

Donde $s$ representa el paso de desplazamiento (*stride*) y $b_c$ es el sesgo. La resolución espacial del mapa resultante tras aplicar relleno (*padding*) $p$ se determina mediante:

$$O_h = \left\lfloor \frac{H - k_h + 2p}{s} \right\rfloor + 1, \quad O_w = \left\lfloor \frac{W - k_w + 2p}{s} \right\rfloor + 1$$

### 2.2 Bloques Residuales y Flujo de Gradiente (ResNet)

En redes convolucionales profundas convencionales, apilar capas incrementa exponencialmente la dificultad de optimización debido a la degradación de la señal de retropropagación. Kaiming He et al. (2015) reformularon el objetivo de aprendizaje: en lugar de forzar a los bloques apilados a aproximar directamente una función subyacente $\mathcal{H}(\mathbf{x})$, el bloque aprende una función residual $\mathcal{F}(\mathbf{x}) = \mathcal{H}(\mathbf{x}) - \mathbf{x}$. La salida final resulta de:

$$\mathbf{y} = \mathcal{F}(\mathbf{x}, \{W_i\}) + \mathbf{x}$$

```
Entrada x ---> [ Conv 3x3 + BatchNorm + ReLU ] ---> [ Conv 3x3 + BatchNorm ] ---> (+) ---> ReLU ---> Salida y
      |                                                                            ^
      +---------------------------- Conexión Residual (Identidad) -----------------+
```

La ventaja matemática cardinal se observa en el flujo retropropagado de gradientes. Considerando una función de pérdida $\mathcal{E}$, la regla de la cadena para una capa residual cualquiera $l$ respecto a una capa anterior $L$ establece:

$$\frac{\partial \mathcal{E}}{\partial \mathbf{x}_l} = \frac{\partial \mathcal{E}}{\partial \mathbf{x}_L} \frac{\partial \mathbf{x}_L}{\partial \mathbf{x}_l} = \frac{\partial \mathcal{E}}{\partial \mathbf{x}_L} \left( \mathbf{I} + \frac{\partial}{\partial \mathbf{x}_l} \sum_{i=l}^{L-1} \mathcal{F}(\mathbf{x}_i, W_i) \right)$$

Dado que la matriz identidad $\mathbf{I}$ se mantiene sumada de forma aditiva, el gradiente $\frac{\partial \mathcal{E}}{\partial \mathbf{x}_L}$ se propaga directamente a capas tempranas $\mathbf{x}_l$ sin atravesar multiplicaciones sucesivas por matrices de pesos, mitigando de raíz el desvanecimiento del gradiente.

### 2.3 Vision Transformers (ViT)

El Vision Transformer (Dosovitskiy et al., 2020) prescinde de los sesgos inductivos convolucionales y procesa la imagen como una secuencia de fichas (*tokens*).
1. **Tokenización de parches:** Una imagen $\mathbf{x} \in \mathbb{R}^{H \times W \times C}$ se fragmenta en $N = \frac{HW}{P^2}$ parches bidimensionales de tamaño $P \times P$.
2. **Proyección lineal e incrustación:** Cada parche aplanado $\mathbf{x}_p^i \in \mathbb{R}^{P^2 C}$ se proyecta linealmente a una dimensión latente $D$ mediante una matriz $E \in \mathbb{R}^{(P^2 C) \times D}$. Se prepende un token aprendible de clasificación $\mathbf{x}_{class}$ y se añade una matriz de incrustaciones de posición $\mathbf{E}_{pos} \in \mathbb{R}^{(N+1) \times D}$:
   $$\mathbf{z}_0 = [\mathbf{x}_{class}; \, \mathbf{x}_p^1 E; \, \mathbf{x}_p^2 E; \dots; \, \mathbf{x}_p^N E] + \mathbf{E}_{pos}$$
3. **Mecanismo de Autoatención Multi-Cabezal (MSA):**
   $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$
Al no depender de campos receptivos locales fijos, cada capa del ViT calcula relaciones entre cualquier par de parches con complejidad $\mathcal{O}(N^2)$, permitiendo capturar contexto global desde la primera capa.

### 2.4 Detección en Tiempo Real: YOLO (*You Only Look Once*)

YOLO (Redmon et al., 2016, y sus evoluciones modernas) transformó la detección de objetos de un proceso lento de dos etapas (propuesta de regiones en R-CNN seguido de clasificación) a un problema unificado de regresión espacial directa en una sola pasada hacia adelante.
* La red divide la imagen en una cuadrícula $S \times S$.
* Para cada celda, predice simultáneamente las coordenadas relativas del cuadro delimitador $(t_x, t_y, t_w, t_h)$, la puntuación de objetualidad (*objectness score*) $P(\text{Objeto})$ y la distribución de probabilidades condicionadas de clase $P(\text{Clase}_c | \text{Objeto})$.
* Emplea funciones de pérdida avanzadas basadas en *Complete Intersection over Union* (CIoU / Complete IoU) para penalizar desalineaciones angulares y de escala, combinadas con *Non-Maximum Suppression* (NMS) para eliminar predicciones redundantes a velocidades superiores a 60 cuadros por segundo.

### 2.5 Segmentación Fundacional: Segment Anything Model (SAM)

SAM (Kirillov et al., 2023) introdujo un paradigma interactivo generalizable entrenado con más de mil millones de máscaras (conjunto SA-1B). Su arquitectura modular desacopla el cálculo intensivo de la respuesta en tiempo real:
* **Image Encoder:** Un Vision Transformer pesado (basado en MAE) procesa la imagen completa una sola vez y genera un mapa denso de características embebidas a escala reducida.
* **Prompt Encoder:** Transforma en tiempo real estímulos dispersos (puntos, cajas delimitadoras o texto codificado con CLIP) en vectores densos o dispersos mediante incrustaciones posicionales de Fourier.
* **Lightweight Mask Decoder:** Un decodificador basado en bloques de atención cruzada bidireccional (*prompt-to-image* e *image-to-prompt*) proyecta las señales combinadas para predecir múltiples máscaras binarias plausibles y sus índices de calidad IoU en aproximadamente 50 milisegundos sobre GPU.

```python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """Implementación canónica de un bloque residual con atajo de identidad."""
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv_path = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(out_channels)
        )
        # Adaptación dimensional si las dimensiones espaciales o canales cambian
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # F(x) + x
        return self.relu(self.conv_path(x) + self.shortcut(x))
```

---

## 3. Casos de Uso y Aplicaciones Reales

* **Vehículos Autónomos y Robótica Móvil:** Fusión sensorial con modelos YOLO y ViT para la detección instantánea de peatones, ciclistas y señalizaciones viales bajo latencias estrictas (<15 ms), complementado con segmentación semántica continua del área transitable y límites de carril.
* **Imagenología Médica y Telepatología:** Localización de lesiones tumorales en tomografías computarizadas y resonancias magnéticas mediante arquitecturas residuales y segmentación celular guiada por prompts con modelos derivados de SAM en biopsias histológicas digitalizadas.
* **Inspección Industrial Automatizada y Control de Calidad:** Detección de fallas superficiales micrométricas en líneas de ensamblaje de alta velocidad (semiconductores, soldaduras robóticas y manufactura de vidrio), donde las CNNs optimizadas analizan miles de piezas por minuto con tasa nula de fatiga.
* **Teledetección y Agricultura de Precisión:** Segmentación de cubiertas vegetales, estimación de estrés hídrico de cultivos y detección de deforestación a partir de constelaciones de satélites multiespectrales (Sentinel, Landsat) procesadas por Vision Transformers de contexto extendido.

---

## 4. Ventajas, Limitaciones y Riesgos

| Paradigma / Modelo | Principales Fortalezas | Limitaciones Técnicas | Caso Óptimo de Aplicación |
| :--- | :--- | :--- | :--- |
| **CNN Clásicas / ConvNets** | Fuerte sesgo inductivo local; alta eficiencia con conjuntos de datos reducidos. | Campo receptivo local limitado; rigidez ante deformaciones afines globales. | Clasificación e inferencia en dispositivos embebidos o edge. |
| **ResNet** | Elimina el desvanecimiento del gradiente; converge en arquitecturas muy profundas (>100 capas). | Costo de memoria en activaciones; saturación de capacidad representacional. | Extractor de características general (*backbone*) multipropósito. |
| **Vision Transformers (ViT)** | Relaciones globales sin restricción espacial; escala predictiva superior con datos masivos. | Alto consumo computacional cuadrático $\mathcal{O}(N^2)$; carece de sesgo de localidad (requiere preentrenamiento extenso). | Modelos fundacionales a gran escala y visión multimodal. |
| **YOLO (v1 a v10+)** | Extrema velocidad de inferencia; regresión unificada de cajas y clases en una etapa. | Precisión menor ante conglomerados densos de objetos minúsculos. | Detección en tiempo real, videovigilancia y robótica activa. |
| **SAM (*Segment Anything*)** | Capacidad fundacional *zero-shot*; segmentación guiada por prompts flexibles en tiempo real. | El codificador de imágenes requiere recursos computacionales masivos; no genera etiquetas semánticas textuales de forma nativa. | Anotación de datos asistida, edición interactiva y recorte biomédico. |

### Limitaciones y Riesgos Éticos
1. **Ataques Adversarios y Robustez:** Las redes visuales son vulnerables a perturbaciones imperceptibles añadidas a los píxeles (*adversarial noise*), capaces de alterar drásticamente la clasificación de señales de tráfico o diagnósticos clínicos.
2. **Sesgos Demográficos:** Conjuntos de entrenamiento desbalanceados provocan disparidades sistemáticas en la precisión del reconocimiento facial y detección de peatones entre diferentes etnias y grupos etarios.
3. **Privacidad y Vigilancia Masiva:** La capacidad de rastrear y segmentar individuos de forma masiva en espacios públicos plantea tensiones críticas respecto a libertades civiles y protección de datos personales.

---

## 5. Conceptos Relacionados

* **Aprendizaje Profundo (Deep Learning):** Marco subyacente de optimización jerárquica no lineal que sustenta todas las arquitecturas de visión contemporáneas.
* **Mecanismos de Atención y Transformers:** Fundamento algorítmico de la autoatención que transformó tanto el procesamiento de lenguaje natural como los modelos visuales modernos.
* **Aprendizaje Autosupervisado (Self-Supervised Learning):** Técnicas como *Masked Autoencoders* (MAE) y DINO, esenciales para entrenar codificadores masivos de visión sin requerir etiquetado manual previo.
* **Modelos de Difusión y Visión Generativa:** Sistemas generativos condicionales (como Stable Diffusion) que integran extractores visuales para sintetizar y editar contenido fotorrealista.
