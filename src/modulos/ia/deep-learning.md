# Deep Learning: Cómo las Máquinas Aprenden por Capas

> **En pocas palabras:** El Deep Learning (aprendizaje profundo) organiza millones de operaciones matemáticas sencillas en capas apiladas, de modo que cada nivel extrae conceptos más abstractos a partir del anterior, igual que nuestra vista pasa de detectar bordes y sombras a reconocer rostros completos.

Cuando un sistema tradicional de aprendizaje automático intenta distinguir entre la radiografía de un pulmón sano y una con neumonía, un ingeniero humano debe indicarle primero qué medir: el brillo promedio de ciertas zonas, el contraste de los bordes o la textura del tejido. El **Deep Learning** (aprendizaje profundo) elimina esa programación manual de pistas. En lugar de que una persona diseñe las reglas de inspección, la máquina recibe miles de imágenes con su diagnóstico correcto y descubre por sí misma qué patrones visuales importan, organizándolos en una escalera de complejidad creciente.

---

## 1. De dónde viene y cómo se entiende fácil

La pregunta que dio origen al aprendizaje profundo es sencilla: ¿por qué apilar decenas o cientos de capas de cálculo en lugar de construir una sola capa gigantesca?

En 1989 y 1991, los matemáticos George Cybenko y Kurt Hornik demostraron el **Teorema de Aproximación Universal**: en teoría, una red neuronal con una única capa intermedia suficientemente ancha puede imitar cualquier función matemática continua. Sin embargo, ese resultado teórico escondía una trampa práctica: para problemas complejos del mundo real, esa única capa necesitaría una cantidad astronómica de neuronas, creciendo de forma exponencial hasta volverse imposible de entrenar en cualquier ordenador.

La naturaleza y el lenguaje funcionan por jerarquías, y ahí reside la ventaja de la profundidad. Piensa en cómo lees esta página: primero tus ojos detectan trazos curvos y rectos; luego tu cerebro agrupa esos trazos en letras; las letras forman palabras; las palabras construyen frases con significado. Una línea de montaje dividida en estaciones especializadas trabaja mucho mejor que un único operario intentando fabricar un automóvil entero desde cero.

En inteligencia artificial, cada capa de una red profunda actúa como una estación de esa línea de montaje:

* **Primeras capas:** detectan elementos simples (líneas diagonales, cambios de color, frecuencias de sonido).
* **Capas intermedias:** combinan esos trazos para reconocer piezas con forma (ojos, ruedas, sílabas).
* **Capas finales:** ensamblan esas piezas para tomar una decisión global ("es un peatón cruzando", "esta frase expresa duda").

Aunque el concepto teórico existía desde los años ochenta, el aprendizaje profundo despegó en 2012 cuando Alex Krizhevsky, Ilya Sutskever y Geoffrey Hinton entrenaron **AlexNet** usando tarjetas gráficas (GPU, procesadores diseñados originalmente para videojuegos) y redujeron casi a la mitad el error en el gran concurso visual ImageNet. Desde entonces, la combinación de datos masivos, GPUs y arquitecturas profundas transformó por completo la informática.

---

## 2. Cómo funciona por dentro

Entrenar redes con decenas o cientos de capas trajo un problema grave en los primeros intentos: al corregir los errores desde la salida hacia atrás (mediante **retropropagación**, el algoritmo que reparte la culpa del fallo entre todas las neuronas), la señal de ajuste se iba debilitando al multiplicarse capa tras capa hasta volverse casi cero (*desvanecimiento del gradiente*), o bien crecía sin control (*explosión del gradiente*).

La ingeniería moderna resolvió este bloqueo gracias a cuatro piezas clave:

### A. Conexiones residuales (autopistas de información)
En 2015, Kaiming He y su equipo presentaron **ResNet**, una arquitectura que introdujo las **conexiones residuales** (*skip connections*). La idea es muy intuitiva: en lugar de obligar a cada bloque de neuronas a reconstruir toda la señal desde cero, se le permite sumar directamente la entrada original al resultado de la capa:

```text
salida = transformacion(entrada) + entrada
```

Si una capa intermedia aún no aporta nada útil al principio del entrenamiento, la señal y el error pueden viajar sin obstáculos por ese atajo directo. Gracias a este principio fue posible entrenar redes de más de cien capas de forma estable.

### B. Normalización de señales (mantener los números en rango)
Mientras una red aprende, los números que circulan entre capas pueden dispararse hacia valores enormes o encogerse hacia cero, desestabilizando el ajuste de pesos. Para evitarlo se usan capas de normalización que reescalan las señales para que mantengan una media cercana a cero y una dispersión controlada:

* **BatchNorm** (Sergey Ioffe y Christian Szegedy, 2015): compara y normaliza cada característica usando el promedio del grupo de ejemplos (*mini-lote*) que se procesa en ese instante. Funciona muy bien en visión por ordenador, pero depende del tamaño del grupo.
* **LayerNorm** (Jimmy Lei Ba, Jamie Ryan Kiros y Geoffrey Hinton, 2016): normaliza los valores dentro de cada ejemplo individual a lo largo de sus neuronas, sin depender de otros ejemplos del lote. Es el estándar en modelos de lenguaje y Transformers.

### C. Optimizadores adaptativos (AdamW)
Ajustar millones de parámetros requiere decidir cuánto cambiar cada peso tras cada error. El optimizador **Adam** (Diederik Kingma y Jimmy Ba, 2014) recuerda la dirección reciente de los ajustes (el *momento*) y adapta el tamaño del paso según cuánto ha variado cada parámetro. En 2017, Ilya Loshchilov y Frank Hutter propusieron **AdamW**, que separa limpiamente la penalización por pesos demasiado grandes (*weight decay*) del paso adaptativo, evitando que la red memorice ruido en lugar de aprender reglas generales:

```python
# Paso conceptual de actualización en AdamW (simplificado)
# g: error actual (gradiente) | lr: tasa de aprendizaje | wd: penalización de peso
momento = 0.9 * momento + 0.1 * g
escala = 0.999 * escala + 0.001 * (g ** 2)

paso_adaptativo = momento / ((escala ** 0.5) + 1e-8)
peso = peso - lr * paso_adaptativo - lr * wd * peso
```

### D. Leyes de escalamiento y regla de Chinchilla
En 2020, investigadores de OpenAI observaron que el error de los modelos de lenguaje disminuye de forma predecible al aumentar tres ingredientes: tamaño del modelo, cantidad de datos y capacidad de cómputo. Dos años después, Jordan Hoffmann y su equipo en DeepMind (2022) demostraron con el estudio **Chinchilla** que muchos modelos gigantes estaban desaprovechados porque tenían demasiados parámetros pero pocos textos de entrenamiento.

Para un presupuesto de cómputo medido en operaciones matemáticas (`C ≈ 6 × N × D`, donde `N` es el número de parámetros y `D` la cantidad de tokens o fragmentos de texto):

```text
Regla de Chinchilla para entrenamiento óptimo:
Si multiplicas el presupuesto de cómputo por 10,
conviene multiplicar por ~3,16 el tamaño del modelo (N)
y multiplicar también por ~3,16 la cantidad de datos (D).
```

Es decir, un modelo más compacto pero entrenado con muchos más datos de calidad suele rendir mejor y costar menos de operar que un gigante entrenado a medias.

---

## 3. Dónde se usa hoy en la vida real

* **Asistentes de texto y código:** Modelos basados en aprendizaje profundo y arquitectura Transformer redactan documentos, resumen expedientes, traducen idiomas y ayudan a programar software en segundos.
* **Diagnóstico médico por imagen:** Redes profundas analizan mamografías, tomografías y retinografías para señalar lesiones milimétricas que podrían pasar desapercibidas tras una jornada larga de guardia.
* **Biología estructural:** El sistema **AlphaFold 2** (DeepMind, 2020) predijo la forma tridimensional de millones de proteínas a partir de su secuencia genética, un avance reconocido con el Premio Nobel de Química en 2024 para Demis Hassabis y John Jumper.
* **Conducción asistida y robótica:** Cámaras y sensores procesados por redes profundas identifican carriles, señales de tráfico, peatones y obstáculos en milisegundos.
* **Audio, voz y creación visual:** Sistemas de transcripción automática como Whisper, traductores de voz en tiempo real y generadores de imágenes operan íntegramente sobre capas profundas.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Aspecto | Qué hace bien | Qué falla o qué riesgos tiene |
| :--- | :--- | :--- |
| **Aprendizaje de patrones** | Descubre reglas ocultas en imágenes, audio o texto sin que nadie las programe a mano. | Funciona como una "caja negra": es difícil explicar con certeza por qué tomó una decisión concreta. |
| **Rendimiento con escala** | Mejora de forma constante cuando se le dan más datos limpios y más cómputo. | Entrenar modelos grandes consume enormes cantidades de electricidad, agua para refrigeración y chips costosos. |
| **Generalización** | Tolera ruido cotidiano como mala iluminación, acentos variados o faltas de ortografía. | Puede fallar ante ejemplos manipulados (*ataques adversarios*) o situaciones distintas a las vistas al entrenar. |
| **Dependencia de datos** | Aprovecha millones de ejemplos reales sin requerir etiquetas en modelos auto-supervisados. | Si los datos históricos contienen sesgos o errores, la red los aprende y los amplifica a gran escala. |

Un fallo frecuente en la práctica es el **aprendizaje por atajos** (*shortcut learning*): si todas las fotos de lobos en un conjunto de entrenamiento tienen nieve en el fondo y las de perros tienen césped, una red profunda puede volverse experta en detectar nieve en lugar de reconocer al animal. Auditar con datos variados y pruebas independientes sigue siendo obligatorio antes de usar cualquier modelo en decisiones sensibles.

---

## 5. Temas relacionados

* **[Redes Neuronales Artificiales](redes-neuronales.md):** Cómo funciona una neurona artificial individual, las funciones de activación y el entrenamiento básico.
* **[Machine Learning](machine-learning.md):** El marco general del aprendizaje automático, desde modelos estadísticos clásicos hasta la evaluación de errores.
* **[Arquitectura Transformer y Atención](transformers-atencion.md):** El diseño de capas profundas que revolucionó el procesamiento de texto, audio e imagen.
* **[Hardware, GPU e Inferencia](hardware-gpu-inferencia.md):** Por qué las tarjetas gráficas y la cuantización permiten entrenar y ejecutar estos modelos.
