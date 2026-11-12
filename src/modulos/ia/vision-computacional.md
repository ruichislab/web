# Visión computacional: cómo las máquinas aprenden a ver

Para una persona, reconocer una taza de café sobre una mesa es instantáneo. Los ojos captan la luz y el cerebro reconstruye formas, distancias y colores al momento. Para una computadora, una foto es solo una cuadrícula de números: miles o millones de píxeles con valores de color entre 0 y 255. La visión computacional es la rama de la inteligencia artificial que enseña a las máquinas a interpretar esos números para identificar qué objetos hay en una escena, dónde están y hacia dónde se mueven.

> **En pocas palabras:** La visión computacional transforma matrices de números en percepción visual, permitiendo a las computadoras reconocer objetos, personas y movimientos en tiempo real.

## 1. De dónde viene y cómo se entiende fácil

Pensemos en cómo aprende a mirar un niño. No analiza a un perro con una regla; primero detecta contrastes de luz y sombra, luego bordes y curvas, más adelante texturas como el pelaje, y finalmente la silueta completa.

Durante décadas, se intentó programar esa visión a mano usando algoritmos como SIFT (*Scale-Invariant Feature Transform*, David Lowe, 1999) o HOG (*Histogram of Oriented Gradients*, Navneet Dalal y Bill Triggs, 2005). Aunque detectaban esquinas en laboratorio, fallaban si cambiaba la luz o si el objeto giraba levemente.

La solución provino de la neurociencia. Entre 1959 y 1962, David Hubel y Torsten Wiesel descubrieron que las neuronas visuales de los mamíferos procesan la información en cascada jerárquica: células simples detectan líneas orientadas y células complejas combinan esas respuestas para abstraer contornos. Esta jerarquía inspiró el Neocognitron de Kunihiko Fukushima (1980) y la red LeNet-5 de Yann LeCun (1998) para leer números en cheques postales.

El cambio definitivo ocurrió en 2012. En la competencia ImageNet, Alex Krizhevsky, Ilya Sutskever y Geoffrey Hinton presentaron AlexNet. En vez de diseñar reglas a mano, entrenaron una red profunda con más de un millón de fotos usando procesadores gráficos (GPU). El algoritmo aprendió por sí solo qué rasgos buscar, redujo el error a casi la mitad y desató la era moderna del aprendizaje profundo.

## 2. Cómo funciona por dentro

La visión moderna resuelve tareas complejas mediante cinco innovaciones clave:

### Redes Neuronales Convolucionales (CNN)
Una red convolucional pasa un filtro matemático deslizante (*kernel*), habitualmente de 3×3 píxeles, por toda la imagen. Como una lupa que barre un lienzo, multiplica sus valores por los píxeles que cubre para resaltar patrones: bordes en las primeras capas, texturas en las intermedias y partes complejas en las finales. El tamaño de salida se calcula así:

```text
Salida = piso((Entrada - Filtro + 2 × Relleno) / Avance) + 1
```

Donde el relleno (*padding*) añade ceros en los bordes y el avance (*stride*) define cuántos píxeles salta el filtro.

### ResNet y las conexiones de atajo (2015)
Al apilar muchas capas surgía el desvanecimiento del gradiente: el error matemático se diluía al retroceder durante el entrenamiento. Kaiming He y Microsoft Research lo resolvieron con ResNet (*Residual Networks*), sumando la entrada original a la salida de cada bloque (`y = F(x) + x`):

```python
import torch
import torch.nn as nn

class BloqueResidual(nn.Module):
    def __init__(self, canales: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(canales, canales, 3, padding=1, bias=False),
            nn.BatchNorm2d(canales),
            nn.ReLU(inplace=True),
            nn.Conv2d(canales, canales, 3, padding=1, bias=False),
            nn.BatchNorm2d(canales)
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.relu(self.conv(x) + x)
```

Si una capa no aporta nada, la red fija sus pesos en cero y deja pasar la señal intacta, lo que permitió entrenar redes estables de más de 100 capas.

### Vision Transformers o ViT (2020)
Adaptados por Alexey Dosovitskiy y Google Research, los ViT dividen la imagen en parches cuadrados (ej. 16×16 píxeles) y los tratan como palabras mediante autoatención global:

```text
Atención(Q, K, V) = softmax((Q × Kᵀ) / √d) × V
```

Cada parche calcula atención con todos los demás a la vez, captando relaciones lejanas sin limitarse a píxeles vecinos.

### YOLO: detección en una sola pasada (2015-2016)
Antes de YOLO (*You Only Look Once*, Joseph Redmon et al.), ubicar objetos exigía evaluar cientos de regiones por separado. YOLO predice cajas delimitadoras y clases en una sola pasada, superando los 45 cuadros por segundo en video en vivo.

### SAM: segmentar cualquier objeto (2023)
Presentado por Meta AI en 2023, SAM (*Segment Anything Model*) divide el recorte visual en dos: un codificador pesado que analiza la imagen una sola vez y un decodificador interactivo muy rápido que delimita cualquier silueta píxel por píxel en menos de 50 milisegundos tras recibir un clic o recuadro.

## 3. Dónde se usa hoy en la vida real

- **Medicina asistida:** Detección de retinopatía en fondos de ojo, localización de nódulos y delimitación de tumores en biopsias.
- **Vehículos autónomos:** Cámaras con YOLO para rastrear peatones, ciclistas y carriles a más de 60 cuadros por segundo.
- **Inspección industrial:** Control de calidad en fábricas para detectar fallas micrométricas en circuitos y envases.
- **Agricultura de precisión:** Drones con Vision Transformers para identificar malezas y optimizar fertilizantes en cultivos.

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Enfoque / Modelo | Lo que hace bien | Dónde falla | Aplicación ideal |
| :--- | :--- | :--- | :--- |
| **CNN tradicionales** | Eficientes con pocas fotos y bajo cómputo. | Campo visual limitado a su entorno inmediato. | Sensores y móviles sencillos. |
| **ResNet** | Entrena redes muy profundas sin inestabilidad. | Alto consumo de memoria en entrenamiento. | Columna vertebral (*backbone*) general. |
| **Vision Transformers** | Captura relaciones globales entre zonas distantes. | Costo cuadrático; exige muchos datos. | Modelos fundacionales y multimodalidad. |
| **YOLO** | Inferencia ultrarrápida en tiempo real en una pasada. | Puede omitir objetos diminutos o agrupados. | Cámaras viales, drones y robótica. |
| **SAM** | Recorta cualquier objeto de forma interactiva. | Codificador inicial pesado; no clasifica clases. | Anotación de datos y edición fotográfica. |

### Riesgos y consideraciones críticas
- **Ataques adversarios:** Pequeñas alteraciones en píxeles específicos pueden engañar a una red para que confunda una señal de alto con una de velocidad.
- **Sesgos demográficos:** Entrenar sistemas faciales con datos poco diversos genera mayores errores en personas de piel oscura y en mujeres.
- **Vigilancia biométrica:** El rastreo facial sin consentimiento en espacios públicos amenaza la privacidad; por ello, el Reglamento Europeo de Inteligencia Artificial (2024) prohíbe su uso biométrico indiscriminado en tiempo real en lugares públicos.

## 5. Temas relacionados

- **Modelos Multimodales (VLM):** Redes como GPT-4o o Gemini que unen visión y lenguaje para razonar sobre imágenes.
- **Modelos de Difusión:** Algoritmos generativos (Stable Diffusion, Midjourney) que producen imágenes a partir de texto.
- **Aprendizaje Autosupervisado (DINO, MAE):** Métodos que entrenan redes ocultando partes de la imagen para que las reconstruyan sin etiquetas humanas.
- **Segmentación Semántica e Instanciada:** Técnicas para clasificar escenas píxel por píxel o distinguir cada objeto individual.
