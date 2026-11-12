# Historia de la inteligencia artificial y el camino hacia la AGI

Durante más de setenta años, la computación ha perseguido una meta audaz: construir máquinas capaces de aprender, razonar y resolver problemas complejos por sí mismas. Este trayecto ha oscilado entre olas de optimismo desmedido, crisis de financiación conocidas como los inviernos de la IA y saltos técnicos que hoy transforman la ciencia. En la actualidad, la investigación se concentra en la Inteligencia Artificial General (AGI, por sus siglas en inglés: *Artificial General Intelligence*), el umbral en el que un sistema de software iguale o supere el intelecto humano en cualquier tarea cognitiva, económica o creativa.

> **En pocas palabras:** La inteligencia artificial pasó de programar a mano miles de reglas rígidas a permitir que las computadoras descubran patrones por sí solas analizando grandes volúmenes de datos, sentando las bases de sistemas capaces de razonar, aprender y operar en el mundo físico.

---

## 1. De dónde viene y cómo se entiende fácil

Para comprender la evolución de la inteligencia artificial, conviene pensar en cómo aprende una persona. Si intentas enseñar a un niño a reconocer un gato dándole una lista de mandatos rígidos («debe tener cuatro patas, bigotes y dos orejas puntiagudas»), el niño se confundirá en cuanto vea un gato persa sin orejas visibles o confunda un perro pequeño con un felino. Durante décadas, los pioneros creyeron que programar la mente consistía en escribir a mano todas las reglas lógicas posibles. La revolución moderna ocurrió cuando dejamos de dictar instrucciones fijas y diseñamos algoritmos que descubren esos patrones examinando millones de imágenes.

Esta trayectoria histórica se resume en cuatro momentos decisivos:

1. **Nacimiento formal (1950–1956):** En 1950, Alan Turing publicó *Computing Machinery and Intelligence*, proponiendo el Test de Turing para evaluar si una máquina podía exhibir un comportamiento indistinguible del humano. En el verano de 1956, John McCarthy, Marvin Minsky, Nathaniel Rochester y Claude Shannon organizaron la Conferencia de Dartmouth, donde acuñaron formalmente el término «Inteligencia Artificial».
2. **Primeros tropiezos e inviernos (1958–1980):** En 1958, Frank Rosenblatt presentó el Perceptrón, la primera red neuronal física capaz de clasificar patrones simples. En 1969, Marvin Minsky y Seymour Papert demostraron matemáticamente que no podía resolver problemas elementales como el «o exclusivo» (XOR). Esto, sumado al Informe Lighthill en Reino Unido (1973) y recortes de DARPA, desató el primer «invierno de la IA». En los años 80 resurgieron los sistemas expertos basados en miles de reglas comerciales, pero colapsaron ante su extrema fragilidad para manejar excepciones. En esa época, Hans Moravec enunció su paradoja: lo que a un adulto le parece difícil (jugar al ajedrez) es computacionalmente sencillo para un ordenador, mientras que lo que un niño de dos años hace sin pensar (mantener el equilibrio o reconocer un objeto) exige un cálculo colosal.
3. **El salto del aprendizaje profundo (2012):** David Rumelhart, Geoffrey Hinton y Ronald Williams popularizaron en 1986 la retropropagación de errores (*backpropagation*) para entrenar redes de múltiples capas, pero faltaban datos y capacidad de cómputo. Todo cambió en octubre de 2012 con AlexNet, red convolucional creada por Alex Krizhevsky, Ilya Sutskever y Geoffrey Hinton. Al combinar la base fotográfica ImageNet con procesadores gráficos (GPU de Nvidia) y funciones como ReLU, AlexNet redujo el error visual casi a la mitad e inauguró la era del aprendizaje profundo (*deep learning*).
4. **La era Transformer (2017 en adelante):** En 2017, investigadores de Google publicaron *Attention Is All You Need*, presentando la arquitectura Transformer. Este diseño superó los cuellos de botella de las redes recurrentes y permitió procesar grandes volúmenes de texto en paralelo, impulsando los modelos lingüísticos modernos.

---

## 2. Cómo funciona por dentro

Antes del Transformer, las redes procesaban el texto palabra tras palabra; al llegar al final de un texto largo, olvidaban el inicio.

La arquitectura Transformer resolvió esto mediante la **autoatención escalada** (*Scaled Dot-Product Attention*). Funciona como un investigador en una biblioteca: ante una consulta concreta, no lee cada tomo de principio a fin, sino que compara su pregunta con las etiquetas del catálogo y extrae únicamente los párrafos relevantes.

Cada fragmento de texto (*token*) se proyecta en tres vectores:
- **Consulta (Q):** la información que la palabra busca contextualizar.
- **Clave (K):** la etiqueta de referencia de cada término del texto.
- **Valor (V):** el contenido semántico que aporta cada elemento.

La atención mide la afinidad entre consultas y claves traspuestas, divide entre la raíz cuadrada de la dimensión para evitar inestabilidad numérica, y aplica una función softmax para convertir el resultado en probabilidades ponderadas:

```
Atención(Q, K, V) = softmax((Q × Kᵀ) ÷ √d_k) × V
```

En código Python básico, esta operación se expresa de forma compacta:

```python
import torch
import math

def auto_atencion(q, k, v, mascara=None):
    d_k = q.size(-1)
    puntuacion = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)
    if mascara is not None:
        puntuacion = puntuacion.masked_fill(mascara == 0, -1e9)
    pesos = torch.softmax(puntuacion, dim=-1)
    return torch.matmul(pesos, v)
```

Para avanzar hacia la AGI, la investigación expande este principio en tres direcciones:
- **Modelos de mundo (*World Models*):** Formulados por David Ha y Jürgen Schmidhuber (2018), permiten al agente simular el entorno en un espacio matemático interno antes de tomar acciones en el mundo real.
- **Razonamiento deliberativo:** Modelos que generan cadenas de pensamiento (*Chain-of-Thought*) y validan demostraciones con asistentes lógicos formales como Lean (demostrado en 2024 por AlphaGeometry y AlphaProof).
- **Inteligencia encarnada (*Embodied AI*):** Modelos de Visión-Lenguaje-Acción (VLA) que traducen vídeo y órdenes verbales directamente en fuerzas motrices para robots físicos.

---

## 3. Dónde se usa hoy en la vida real

- **Medicina y biología:** AlphaFold (DeepMind) predijo en 2020 la estructura tridimensional de más de 200 millones de proteínas, hito reconocido con el Premio Nobel de Química de 2024 a Demis Hassabis y John Jumper.
- **Ingeniería de software:** Asistentes de programación auditan repositorios enteros, detectan fallos de seguridad y generan código funcional a partir de especificaciones humanas.
- **Conducción autónoma:** Vehículos modernos procesan vídeo en directo de múltiples cámaras mediante redes neuronales integradas de extremo a extremo que controlan aceleración y dirección.
- **Robótica adaptativa:** Brazos mecánicos y robots humanoides aprenden tareas de ensamblaje o manipulación doméstica mediante demostraciones visuales directas.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Enfoque | Qué hace bien | Dónde falla | Riesgo principal |
| :--- | :--- | :--- | :--- |
| **Simbólico (Reglas lógicas)** | Explicabilidad matemática total; deduce sin necesidad de grandes corpus. | Muy frágil ante el ruido del mundo real; inviable a gran escala. | Bloqueo operativo absoluto ante ambigüedades. |
| **Aprendizaje profundo (Transformers)** | Gran versatilidad en lenguaje, imagen y sonido; generalización estadística. | Produce errores convincentes (alucinaciones); opacidad de caja negra. | Desinformación masiva y alto consumo energético en centros de datos. |
| **IA Neuro-Simbólica** | Combina razonamiento riguroso con flexibilidad asociativa; aprende con pocos datos. | Complejidad técnica para conectar lógica discreta con redes diferenciables. | Alto coste de diseño y sesgo hacia axiomas predefinidos. |
| **Modelos de mundo y robótica** | Comprensión espacial y física; planificación preventiva dentro de simulaciones. | Brecha entre simulación y realidad (*sim-to-real gap*); deriva predictiva acumulada. | Fallos motrices con daño físico directo sobre personas o instalaciones. |

Para responder a estos desafíos, la Unión Europea aprobó en 2024 el Reglamento de Inteligencia Artificial (EU AI Act), la primera ley integral del mundo que prohíbe usos lesivos y establece obligaciones de transparencia para modelos de gran escala.

---

## 5. Temas relacionados

- **Redes neuronales artificiales y retropropagación:** Fundamentos del descenso de gradiente para ajustar pesos en arquitecturas profundas.
- **Modelos de lenguaje de gran tamaño (LLM):** Redes basadas en Transformers para procesar y generar lenguaje natural.
- **Alineación mediante retroalimentación humana (RLHF):** Ajuste fino para guiar las respuestas de los modelos con criterios de veracidad y seguridad.
- **Robótica e inteligencia encarnada:** Conexión de percepción sensorial, control dinámico y toma de decisiones en hardware físico móvil.
