# Evaluación de Modelos y Benchmarks en Inteligencia Artificial

Saber si un sistema de inteligencia artificial realmente entiende una tarea o si solo está improvisando con soltura es uno de los mayores desafíos técnicos de la computación moderna. Medir el rendimiento de un modelo de lenguaje va mucho más allá de contar aciertos en un cuestionario escolar: implica poner a prueba su lógica en situaciones imprevistas, comprobar si su código compila sin fallos y verificar que no invente datos peligrosos cuando interactúa con personas reales.

> **En pocas palabras:** Evaluar una inteligencia artificial consiste en someterla a exámenes teóricos, retos prácticos de programación y duelos a ciegas para medir si de verdad razona y resuelve problemas o si simplemente memorizó respuestas de internet.

---

## 1. De dónde viene y cómo se entiende fácil

Imagina que necesitas contratar a un mecánico automotriz. Si únicamente le haces un examen escrito de diez preguntas de opción múltiple que cualquiera puede encontrar resueltas en Google, es muy probable que obtenga una puntuación perfecta tras memorizar las respuestas la noche anterior. Sin embargo, eso no garantiza que sepa reparar una caja de cambios rota en un taller real. Para comprobar su verdadera destreza, debes llevarlo frente a un motor averiado, darle herramientas y observar si identifica el fallo y hace funcionar el coche.

La evaluación de modelos de lenguaje recorrió un camino muy similar. En 2002, un equipo de investigadores de IBM liderado por Kishore Papineni presentó BLEU (*Bilingual Evaluation Understudy*) para calificar traducciones automáticas. Dos años después, en 2004, Chin-Yew Lin introdujo ROUGE (*Recall-Oriented Understudy for Gisting Evaluation*) para calificar resúmenes de texto. Ambas herramientas medían la coincidencia exacta de palabras entre el texto generado por la máquina y una respuesta de referencia escrita por una persona. Si el modelo empleaba un sinónimo válido que no figuraba en la plantilla, el sistema lo penalizaba como si fuera un error grave.

Cuando aparecieron los modelos masivos basados en la arquitectura Transformer (presentada en 2017 por Ashish Vaswani y su equipo en Google), las máquinas dejaron de limitarse a traducir frases sueltas. Empezaron a redactar contratos, diagnosticar código y argumentar ideas complejas. Para medir estas nuevas habilidades, la comunidad científica creó colecciones estandarizadas de pruebas llamadas *benchmarks*. En 2020, Dan Hendrycks y un equipo de investigadores de la Universidad de California en Berkeley lanzaron MMLU (*Massive Multitask Language Understanding*), una batería de miles de preguntas de opción múltiple repartidas en 57 materias académicas, desde filosofía moral hasta cálculo avanzado.

Muy pronto se hizo evidente un problema clásico anunciado en 1975 por el economista británico Charles Goodhart: cuando una métrica se convierte en la meta, deja de ser una buena métrica. Al entrenar a los modelos con miles de millones de páginas web, muchos textos de evaluación terminaron dentro del material de estudio (un fenómeno llamado contaminación de datos). Los modelos obtenían calificaciones sobresalientes no porque supieran razonar, sino porque ya habían leído el examen durante su entrenamiento. Esta limitación impulsó el desarrollo de pruebas interactivas donde la memoria ya no basta: escribir código que compile y pase pruebas unitarias o competir en duelos ciegos ante usuarios reales.

---

## 2. Cómo funciona por dentro

Para evaluar un modelo moderno de manera rigurosa se combinan cinco metodologías complementarias:

### A. Métricas intrínsecas: entropía cruzada y perplejidad
Durante el entrenamiento, el modelo predice la siguiente palabra en una secuencia de texto. La entropía cruzada mide el error promedio de esas predicciones estadísticas. Si tomamos el exponente natural de ese error, obtenemos la perplejidad (PPL):

```text
Entropía cruzada media: L = - (1 / N) × ∑ log(P(token_i | tokens_anteriores))
Perplejidad:           PPL = exp(L)
```

La perplejidad representa cuántas palabras alternativas igualmente probables baraja el modelo en promedio ante cada paso. Una perplejidad de 8 significa que el modelo duda entre unas 8 opciones viables; cuanto menor sea el número, mayor es su certeza estadística. Conviene aclarar que no se puede comparar directamente la perplejidad de dos modelos que usen vocabularios o tokenizadores distintos, pues quien divide el texto en fragmentos más pequeños obtiene una ventaja matemática artificial.

### B. Pruebas de ejecución y la métrica pass@k
En tareas de programación, mirar si el texto parece correcto no sirve: el código debe ejecutarse y superar pruebas reales. En julio de 2021, Mark Chen y el equipo de OpenAI presentaron el conjunto de datos HumanEval junto con la métrica pass@k. Para medir si un modelo programa bien sin depender de un golpe de suerte, se le pide generar varias soluciones independientes (n) para un mismo problema y se calcula la probabilidad estadística de que al menos una solución correcta aparezca al elegir una muestra de tamaño k:

```text
pass@k = 1 - [ C(n - c, k) ÷ C(n, k) ]
```

Donde n representa las soluciones generadas, c es cuántas pasaron todas las pruebas unitarias y C(a, b) representa el coeficiente binomial o combinatorio.

```python
from math import comb

def pass_at_k(n: int, c: int, k: int) -> float:
    """Calcula la probabilidad insesgada de que al menos una solución sea válida."""
    if n - c < k:
        return 1.0
    return 1.0 - (comb(n - c, k) / comb(n, k))

# Ejemplo: 20 programas generados, 4 superaron las pruebas unitarias
# Evaluamos la probabilidad de éxito tomando solo 1 intento (pass@1)
print(f"pass@1: {pass_at_k(n=20, c=4, k=1):.2%}")  # Resultado: 20.00%
```

### C. Entornos agénticos: SWE-bench y GPQA
Para evitar que los modelos aprueben por pura memorización, en 2023 surgieron dos pruebas de referencia:
- **GPQA (*Graduate-Level Google-Proof Q&A*):** Diseñado por David Rein y colaboradores con preguntas escritas por especialistas con doctorado en biología, física y química. Su dificultad es tan alta que personas con acceso libre a internet tardan más de media hora en responder una sola pregunta si no son expertas en la materia.
- **SWE-bench (*Software Engineering Benchmark*):** Creado por Carlos E. Jimenez y su equipo en Princeton en octubre de 2023. Pone al modelo frente a incidencias reales de repositorios populares de código abierto en GitHub (como Django o SymPy). El agente de inteligencia artificial debe leer miles de líneas del proyecto, editar los archivos adecuados y lograr que las pruebas de regresión pasen con éxito dentro de un contenedor aislado.

### D. Votación a ciegas y el modelo Bradley-Terry (Chatbot Arena)
En mayo de 2023, la organización LMSYS (integrada por investigadores de UC Berkeley, UCSD y CMU) lanzó Chatbot Arena. Dos modelos desconocidos responden en paralelo la misma consulta de un usuario humano, quien vota cuál respuesta fue superior sin saber quién la escribió. A partir de cientos de miles de duelos, se infiere una puntuación de habilidad mediante el modelo de Bradley-Terry (desarrollado en 1952), que sirve de base para el sistema de puntuación Elo ideado por Arpad Elo en 1960 para el ajedrez:

```text
Probabilidad de que el Modelo A supere al Modelo B:
P(A > B) = 1 ÷ (1 + 10^((Elo_B - Elo_A) ÷ 400))
```

Una diferencia favorable de 200 puntos Elo equivale a una probabilidad de victoria de aproximadamente 76% para el modelo mejor clasificado.

### E. Árbitros automatizados (LLM-as-a-Judge)
Para no depender exclusivamente de anotadores humanos lentos y costosos, en 2023 Lianmin Zheng y sus colegas propusieron utilizar un modelo avanzado como juez de otros modelos. Aunque agiliza las evaluaciones a gran escala, este enfoque introduce sesgos sistemáticos documentados: tiende a preferir respuestas excesivamente largas y estructuradas con adornos visuales (sesgo de verbosidad), favorece la primera respuesta que lee (sesgo de posición) y califica con mayor benevolencia a modelos de su propia familia técnica.

---

## 3. Dónde se usa hoy en la vida real

- **Control de calidad continuo en despliegues corporativos:** Empresas que integran modelos de lenguaje en servicios bancarios o plataformas médicas ejecutan bancos de pruebas automatizados antes de actualizar sus sistemas, verificando que una nueva versión no pierda precisión en tareas críticas ni cometa regresiones.
- **Enrutamiento inteligente de consultas (*Model Routing*):** Plataformas de servicios digitales usan las puntuaciones de benchmarks para dirigir cada mensaje del usuario al modelo adecuado: si la pregunta es un saludo cotidiano se envía a un modelo compacto y económico; si exige razonamiento matemático o edición de software, se deriva a un modelo de frontera más potente.
- **Auditorías de seguridad y resistencia a ataques (*Red Teaming*):** Equipos de ciberseguridad someten a los sistemas a baterías de ataques adversarios para medir su capacidad de rechazar solicitudes peligrosas, como la generación de código malicioso o la filtración de datos confidenciales.
- **Cumplimiento de regulaciones internacionales:** Con la entrada en vigor de normativas como la Ley de Inteligencia Artificial de la Unión Europea (aprobada en 2024), las compañías que desarrollan modelos de propósito general con alto impacto están obligadas a documentar evaluaciones estandarizadas de capacidades, ciberseguridad y riesgos sistémicos.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Metodología de evaluación | Qué mide con precisión | Dónde tropieza | Riesgo principal |
| :--- | :--- | :--- | :--- |
| **Perplejidad interna** | Certeza estadística y compresión del lenguaje en entrenamiento. | No evalúa seguimiento de instrucciones ni lógica factual. | Comparación engañosa entre modelos con tokenizadores distintos. |
| **Exámenes estáticos (MMLU, GPQA)** | Amplitud de conocimiento temático y conceptos formales. | Susceptibles a respuestas por descarte o adivinanza fortuita. | **Contaminación de datos:** memorización de las preguntas durante el preentrenamiento. |
| **Pruebas de código (HumanEval, SWE-bench)** | Funcionamiento real y verificación objetiva mediante tests unitarios. | Costosas de ejecutar y lentas en entornos aislados. | Sobreajuste a trucos sintácticos o fallos por dependencias externas. |
| **Duelos a ciegas (Chatbot Arena)** | Preferencia de usuarios reales en conversaciones libres. | Voto subjetivo; premia respuestas complacientes y extensas. | Manipulación coordinada de votos (*brigading*) y baja cobertura técnica profunda. |
| **Jueces automáticos (LLM-as-a-Judge)** | Análisis cualitativo rápido y escalable con justificación. | Afectado por sesgos de longitud, posición y autorreferencia. | Bucle cerrado de modelos premiando sus propios errores de razonamiento. |

---

## 5. Temas relacionados

- **Alineación por preferencias humanas (RLHF y DPO):** Métodos de entrenamiento diseñados para ajustar el comportamiento del modelo a partir de los juicios recopilados en evaluaciones comparativas.
- **Estrategias de decodificación:** Parámetros como temperatura y muestreo probabilístico que modifican directamente la creatividad o el determinismo en los exámenes.
- **Contaminación de datos y fuga de conjuntos de prueba:** Técnicas de auditoría y filtrado para evitar que el material de evaluación se filtre en el corpus de preentrenamiento.
- **Razonamiento guiado (*Chain-of-Thought*):** Estrategia que pide al modelo desglosar su razonamiento paso a paso, elevando sustancialmente su rendimiento en problemas complejos.
- **Evaluación de seguridad y pruebas adversarias:** Protocolos diseñados para medir la vulnerabilidad de un sistema ante intentos deliberados de engaño o manipulación.
