# Guía de Ingeniería de Prompts y Razonamiento en Inferencia

La ingeniería de prompts y el razonamiento en inferencia agrupan las técnicas que permiten obtener el máximo rendimiento de un modelo de lenguaje sin reentrenarlo ni modificar sus pesos internos. En lugar de alterar la red neuronal, estas metodologías estructuran cómo se presenta la información y le otorgan tiempo y espacio para calcular antes de dar una respuesta definitiva.

> **En pocas palabras:** La ingeniería de prompts diseña instrucciones claras y pasos intermedios de trabajo para que la inteligencia artificial resuelva problemas complejos sin necesidad de reprogramarla.

---

## 1. De dónde viene y cómo se entiende fácil

Imagina a un estudiante hábil pero sometido a un examen oral exigente. Si le pides que calcule mentalmente y en un segundo el producto de 73 × 48, es muy probable que se equivoque por las prisas. En cambio, si le entregas un lápiz y un papel para desglosar la cuenta en partes (70 × 40, 70 × 8, etc.), hallará el resultado correcto sin dificultad.

Los modelos de lenguaje operan bajo una restricción parecida: por defecto dedican una cantidad fija de operaciones matemáticas a cada palabra que generan. Pedirles una conclusión directa a un problema enrevesado los obliga a comprimir todo el razonamiento en una única pasada, lo que dispara las equivocaciones. Darles margen para redactar un borrador previo convierte el texto generado en una memoria de trabajo.

Hasta 2020, adaptar una red a una tarea exigía ajuste fino (*fine-tuning*), un proceso costoso que recalibra millones de conexiones numéricas. Ese panorama cambió cuando el equipo de Tom Brown en OpenAI presentó GPT-3 y popularizó el aprendizaje en contexto (*In-Context Learning*): bastaba incluir un par de ejemplos en el texto de entrada para que el modelo captara la pauta de inmediato sin actualizar un solo gradiente.

En 2022, un equipo de Google encabezado por Jason Wei introdujo la cadena de pensamiento (*Chain-of-Thought* o CoT). Demostraron que pedirle al modelo que explique sus deducciones antes de emitir la respuesta final disparaba su precisión matemática y analítica. Poco después, en mayo de 2022, Takeshi Kojima comprobó que la simple indicación "pensemos paso a paso" bastaba para activar este comportamiento sin ejemplos previos. Finalmente, en 2024, con el auge del escalado en inferencia (*test-time compute*), la investigación comprobó formalmente que invertir más cómputo en dejar pensar al modelo durante la respuesta ofrece mejoras tan drásticas como construir redes mucho más gigantescas.

---

## 2. Cómo funciona por dentro

Un modelo autorregresivo genera texto prediciendo la siguiente palabra o fragmento (*token*) a partir de la probabilidad condicionada por el texto previo:

```
P(palabra_actual | contexto_recibido, palabras_ya_generadas)
```

Las distintas técnicas de prompting y razonamiento deliberado actúan sobre este flujo probabilístico:

### Cadena de pensamiento y memoria temporal
Cuando el usuario solicita solo el resultado (*Zero-Shot*), el modelo debe saltar directamente de la pregunta a la respuesta. Si se le pide redactar los pasos intermedios (CoT), cada fragmento de razonamiento generado se almacena en la memoria temporal rápida llamada caché de claves y valores (*KV cache*). Esa memoria funciona como un cuaderno de notas: el modelo relee sus propias deducciones para calcular la siguiente frase, reduciendo fallos en cadena.

```
P(Respuesta | Entrada) = ∑ [ P(Pasos_intermedios | Entrada) × P(Respuesta | Entrada, Pasos_intermedios) ]
```

### Autoconsistencia y exploración en árbol
Para evitar que un error puntual en un paso descarrile todo el proceso, Xuezhi Wang y su equipo en Google crearon en marzo de 2022 la **Autoconsistencia** (*Self-Consistency*). El sistema genera varias soluciones independientes (por ejemplo, 5 o 10 caminos distintos con cierta creatividad en el muestreo) y elige la respuesta más repetida por votación mayoritaria.

Para tareas más complejas, como la planificación de rutas o problemas combinatorios, Shunyu Yao y sus colaboradores presentaron en mayo de 2023 el **Árbol de Pensamientos** (*Tree of Thoughts* o ToT). Este método ramifica varias ideas tentativas, evalúa cada una con una puntuación de 0 a 1 y permite retroceder (*backtracking*) si una rama conduce a un callejón sin salida:

```
           [ Pregunta Inicial ]
             /        |        \
        [ Idea A ] [ Idea B ] [ Idea C ]
         Nota: 0.9  Nota: 0.2  Nota: 0.7
         /    \       x (descarte)
    [ Paso A1 ] [ Paso A2 ]
```

### Salidas estructuradas y verificación paso a paso
En aplicaciones con bases de datos o APIs, las respuestas no pueden contener texto libre impredecible. La decodificación guiada (*constrained decoding*) aplica una máscara sobre el vocabulario en cada paso: solo permite emitir caracteres que cumplan una gramática formal (como un esquema JSON), garantizando una estructura 100% válida.

Por otro lado, los **Modelos de Recompensa de Procesos** (*Process Reward Models* o PRM, documentados por Hunter Lightman en OpenAI en mayo de 2023) van más allá de evaluar la respuesta final: un clasificador secundario califica individualmente cada línea de la deducción. Si detecta un paso falso, detiene esa rama de inmediato y explora una alternativa válida.

---

## 3. Dónde se usa hoy en la vida real

- **Generación y depuración autónoma de código:** Asistentes de desarrollo que no solo escriben código, sino que ejecutan pruebas unitarias en entornos protegidos, leen los errores de compilación y corrigen los fallos de forma autónoma.
- **Agentes orientados a la acción (ReAct):** Sistemas corporativos que entrelazan deducciones lógicas con consultas a bases de datos SQL, inventarios y herramientas de búsqueda web en tiempo real.
- **Extracción de datos sin fallos sintácticos:** Procesamiento automatizado de facturas, historiales clínicos o contratos legales para convertirlos en registros JSON validados que alimentan sistemas bancarios y hospitalarios.
- **Resolución de problemas matemáticos y científicos:** Competiciones académicas y verificación formal de teoremas donde cualquier salto erróneo invalida la solución entera.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

### Comparativa de métodos

| Técnica | Coste de cómputo | Transparencia | Rigor lógico | Caso de uso ideal |
| :--- | :--- | :--- | :--- | :--- |
| **Directa (*Zero-Shot*)** | Mínimo (1×) | Nula (caja negra) | Bajo en lógica compleja | Resúmenes y traducción rápida |
| **Cadena de Pensamiento (*CoT*)** | Moderado (2× a 4×) | Alta (pasos legibles) | Medio-alto en deducciones | Problemas de varios pasos |
| **Autoconsistencia** | Alto (5× a 10×) | Alta (consenso modal) | Alto en respuestas cerradas | Matemáticas y tests cerrados |
| **Árbol de Pensamientos (*ToT*)** | Muy alto (exploración múltiple) | Muy alta (árbol auditable) | Muy alto con rectificación | Planificación y juegos lógicos |
| **Salidas Estructuradas** | Mínimo (1×) | Media (formato estricto) | Sintaxis garantizada al 100% | Conexión con APIs y SQL |
| **Verificación por Pasos (*PRM*)** | Crítico (evaluación continua) | Máxima (nota por línea) | Óptimo para pruebas formales | Demostraciones y código crítico |

### Puntos débiles y precauciones

1. **Racionalización engañosa (*unfaithful reasoning*):** El modelo puede llegar a una conclusión equivocada por un sesgo interno y luego inventar pasos intermedios aparentemente impecables para justificarla. La explicación no siempre refleja el cálculo real de la red.
2. **Latencia y sobrecoste económico:** Multiplicar las ramas de pensamiento y verificar cada paso incrementa el tiempo de espera de milisegundos a decenas de segundos, multiplicando el consumo de servidores.
3. **Inyecciones de prompt (*Prompt Injection*):** Si se incorporan datos externos no confiables (correos o páginas web), instrucciones ocultas pueden alterar el comportamiento del sistema. Las salidas estructuradas aseguran el formato, pero no impiden engaños en el significado.

---

## 5. Temas relacionados

- **Escalado en inferencia (*Test-Time Scaling*):** Modelos que usan aprendizaje por refuerzo para dedicar más tokens de razonamiento a resolver problemas difíciles.
- **Arquitectura ReAct (*Reasoning + Acting*):** Fusión de cadenas de pensamiento con llamadas a herramientas externas.
- **Modelos de Recompensa (ORM y PRM):** Redes evaluadoras que califican la veracidad de respuestas completas o de pasos individuales.
- **Ajuste Fino (*Fine-Tuning*) vs. Aprendizaje en Contexto:** Comparación entre reentrenar conexiones neuronales o guiar la red mediante el texto de entrada.
