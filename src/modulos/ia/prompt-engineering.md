# Ingeniería de Prompts y Razonamiento en Test-Time

La **ingeniería de prompts** y el **razonamiento en tiempo de inferencia** (*test-time compute* o *test-time reasoning*) constituyen el conjunto de fundamentos teóricos y metodológicos orientados a maximizar la capacidad de resolución de problemas en modelos de lenguaje autorregresivos (LLMs) sin modificar sus pesos sinápticos. Mientras que el preentrenamiento y la alineación post-entrenamiento (RLHF, DPO) definen la distribución de probabilidad estática del modelo, la estructuración contextual y la asignación deliberativa de cómputo durante la inferencia permiten guiar el muestreo estocástico, explorar espacios de estados combinatorios, imponer restricciones sintácticas deterministas y verificar la coherencia lógica de las trayectorias de solución.

---

## 1. Origen e Intuición Fundamental

Tradicionalmente, adaptar redes neuronales a tareas específicas requería reentrenamiento o ajuste fino (*fine-tuning*). Con la consolidación del **Aprendizaje en Contexto** (*In-Context Learning*, ICL), se evidenció que los modelos fundacionales operan como aproximadores bayesianos guiados por el contexto: una directiva o un conjunto mínimo de pares entrada-salida condiciona la distribución del transformador hacia el subespacio de la tarea sin calcular gradientes ($\nabla_\theta = 0$).

Sin embargo, los modelos autorregresivos estándar presentan una ceguera estructural: asignan una cantidad constante de operaciones de punto flotante ($O(1)$ FLOPs) por token, independientemente de la complejidad algorítmica del problema. En consultas que demandan planificación en múltiples pasos, exigir una respuesta directa (*zero-shot direct prompting*) obliga a condensar la computación de razonamiento en una única pasada hacia adelante (*forward pass*), elevando la tasa de alucinación y el error en cascada.

Para superar este cuello de botella, la investigación adoptó la analogía de la teoría de proceso dual (Sistema 1 intuitivo vs. Sistema 2 deliberativo):
1. **Espacios de memoria de trabajo (*Scratchpads*)**: Permitir al modelo verbalizar tokens intermedios de razonamiento antes de emitir la conclusión terminal.
2. **Leyes de escalado en test-time (*Test-Time Scaling Laws*)**: Demostración formal de que asignar mayor cómputo en inferencia (mediante muestreo estocástico múltiple, búsqueda guiada y verificación) produce mejoras exponenciales en precisión, análogas a escalar el volumen de parámetros del modelo.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### 2.1. Modelado Condicional y Aprendizaje en Contexto

Dada una arquitectura autorregresiva con parámetros $\theta$, la probabilidad conjunta de generar una secuencia terminal $Y = (y_1, \dots, y_T)$ condicionada por un contexto $X$ se factoriza como:

$$P(Y \mid X; \theta) = \prod_{t=1}^T P(y_t \mid X, y_{<t}; \theta)$$

- **Zero-Shot Prompting**: El contexto contiene exclusivamente la instrucción sistémica $\mathcal{I}$ y la consulta de prueba: $X = \mathcal{I} \circ x_{\text{test}}$.
- **Few-Shot Prompting**: Intercala $k$ demostraciones ejemplares previas a la inferencia:
  $$X = (x_1 \circ y_1) \circ \dots \circ (x_k \circ y_k) \circ x_{\text{test}}$$
  donde los mecanismos de autoatención (*self-attention*) proyectan representaciones de covarianza en tiempo de ejecución para parametrizar la tarea.

### 2.2. Cadena de Pensamiento (Chain-of-Thought) y Autoconsistencia

La técnica de **Cadena de Pensamiento** (*Chain-of-Thought*, CoT; Wei et al., 2022) introduce una variable latente observable $Z = (z_1, \dots, z_M)$ que desglosa el cómputo en pasos intermedios:

$$P(Y \mid X) = \sum_{Z} P(Z \mid X) P(Y \mid X, Z)$$

Cada token $z_m$ se reincorpora al búfer de claves y valores (KV cache), extendiendo la capacidad computacional efectiva disponible para generar los pasos subsecuentes.

Para mitigar trayectorias divergentes, la **Autoconsistencia** (*Self-Consistency*; Wang et al., 2022) muestrea $K$ cadenas independientes $Z^{(1)}, \dots, Z^{(K)}$ con temperatura $T > 0$ y selecciona la solución modal mediante votación mayoritaria:

$$Y^* = \arg\max_{y \in \mathcal{Y}} \sum_{k=1}^K \mathbb{I}\left(\text{extraer}(Z^{(k)}) = y\right)$$

### 2.3. Árbol de Pensamientos (Tree of Thoughts - ToT)

ToT (Yao et al., 2023) generaliza la inferencia lineal hacia la exploración sistemática de un espacio de estados en grafo o árbol. Cada nodo representa un estado de razonamiento parcial $s = (x, z_1, \dots, z_i)$.

```
        [ Estado Inicial X ]
          /        |        \
      [ s_1 ]   [ s_2 ]   [ s_3 ]  <- Generación (b ramas)
       V=0.85    V=0.20    V=0.70  <- Evaluación heurística V(s)
       /   \        x (poda)  \
   [s_1.1] [s_1.2]          [s_3.1]
    Éxito   Fallo            Éxito
```

La arquitectura opera integrando:
1. **Generador de candidatos**: Propone $b$ expansiones por nodo: $P(z_{i+1} \mid s)$.
2. **Función de valor**: Evalúa la viabilidad del nodo mediante autoevaluación o clasificadores: $V(s) \in [0, 1]$.
3. **Mecanismo de búsqueda**: Algoritmos BFS, DFS o Búsqueda Monte Carlo en Árboles (MCTS) con capacidad de retroceso (*backtracking*) y poda de ramas inviables.

### 2.4. Salidas Estructuradas (Structured Outputs) y Decodificación Guiada

Las aplicaciones formales demandan conformidad sintáctica absoluta. La **decodificación restringida** (*Constrained Decoding*) construye una máquina de estados finitos (FSM) a partir de una gramática libre de contexto $\mathcal{G}$ (ej. JSON Schema). En cada paso $t$, se define el conjunto admisible de tokens $\mathcal{V}_{\text{valid}}(y_{<t}, \mathcal{G}) \subseteq \mathcal{V}$, aplicando una máscara booleana a los logits $u_t$ antes del operador Softmax:

$$P(y_t = v \mid y_{<t}, X) = \frac{\exp(u_{t, v}) \cdot \mathbb{I}(v \in \mathcal{V}_{\text{valid}})}{\sum_{v' \in \mathcal{V}_{\text{valid}}} \exp(u_{t, v'})}$$

Esto garantiza $100\%$ de validez gramatical en tiempo real sin requerir reintentos.

### 2.5. Modelos de Recompensa de Procesos (PRMs) y Verificación

La verificación en inferencia desliga la generación de la evaluación. A diferencia de los modelos supervisados por resultado (*Outcome Reward Models*, ORMs) que califican solo la respuesta final, los **Modelos de Recompensa de Procesos** (*Process Reward Models*, PRMs) asignan un puntaje a cada paso intermedio $z_m$. 

En estrategias de búsqueda *Best-of-N*, la trayectoria óptima $\hat{Y}$ se selecciona ponderando la probabilidad conjunta de validez paso a paso:

$$\hat{Y} = \arg\max_{Y^{(j)}} \prod_{m=1}^{M_j} P_{\text{PRM}}(\text{paso } z_m^{(j)} \text{ es correcto})$$

---

## 3. Casos de Uso y Aplicaciones Reales

- **Demostración de Teoremas y Olimpiadas Matemáticas**: Empleo de CoT deliberativo y PRMs para resolver problemas formales (GSM8K, MATH, AIME), donde un único desvío algebraico invalida la demostración completa.
- **Ingeniería de Software Autónoma (SWE)**: Bucles cerrados de desarrollo donde el modelo genera código, ejecuta pruebas unitarias en sandboxes aislados e implementa auto-corrección guiada por trazas de error de compilación.
- **Interoperabilidad de APIs y Pipelines ETL**: Extracción determinista de entidades no estructuradas mediante esquemas Pydantic rígidos para ingestión directa en bases de datos relacionales sin anomalías de serialización.
- **Agentes Autónomos con Razonamiento y Acción (ReAct)**: Planificación recursiva que intercala razonamiento simbólico con ejecución determinista de herramientas (motores SQL, búsquedas web, cálculo numérico).

---

## 4. Ventajas, Limitaciones y Riesgos

### Comparativa de Metodologías de Inferencia

| Enfoque | Coste Computacional | Interpretabilidad | Garantía Sintáctica | Resistencia a Cascada de Error | Madurez Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Direct Prompting** | Base ($1\times$) | Nula (caja negra) | Nula (probabilística) | Baja | Trivial |
| **Chain-of-Thought (CoT)** | Bajo ($2\times - 4\times$) | Alta (pasos legibles) | Nula | Media-Baja (deriva latente) | Alta |
| **Self-Consistency (CoT-SC)** | Medio-Alto ($K \times \text{CoT}$) | Alta (consenso estocástico)| Nula | Media-Alta (filtra ruido) | Alta |
| **Tree of Thoughts (ToT)** | Crítico ($b^d$ expansiones) | Muy Alta (árbol auditable) | Nula | Alta (poda y retroceso) | Media |
| **Structured Outputs** | Despreciable ($\approx 1\times$) | Media (formato rígido) | **100% Determinista** | No aplica (diseño sintáctico) | Producción |
| **Verificación Paso a Paso (PRM)** | Muy Alto ($N \times \text{CoT} + \text{PRM}$) | Máxima (score granular) | Nula | **Muy Alta** (aislamiento local) | Vanguardia |

### Limitaciones y Riesgos Principales

1. **Racionalización No Confiable (*Unfaithful Reasoning*)**: La cadena de tokens generada no necesariamente refleja el proceso computacional interno del modelo; el sistema puede construir justificaciones plausibles post-hoc para conclusiones derivadas erróneamente.
2. **Latencia y Cuello de Botella Económico**: La computación ampliada durante la inferencia incrementa la latencia por consulta y el consumo de memoria en la KV cache, desafiando arquitecturas síncronas de producción.
3. **Superficie de Ataque Adversarial**: Los esquemas basados exclusivamente en instrucciones textuales son susceptibles a inyecciones de prompt indirectas (*Prompt Injections*). Las salidas estructuradas evitan fallos de formato, pero no neutralizan ataques de manipulación semántica en los valores generados.

---

## 5. Conceptos Relacionados

- **Modelos de Razonamiento y Test-Time Scaling**: Familias de modelos entrenados con RL a gran escala para optimizar tokens de pensamiento latente durante la inferencia.
- **Modelos de Recompensa de Procesos (PRMs)**: Redes evaluadoras que supervisan la corrección lógica paso a paso en razonamiento estructurado.
- **Decodificación Restringida por Gramáticas (CFG Decoding)**: Motores de enmascaramiento léxico a nivel de logits que imponen el cumplimiento de esquemas formales.
- **Arquitectura ReAct y Sistemas Agénticos**: Metodologías que entrelazan trazas de razonamiento con llamadas a herramientas operacionales en bucle cerrado.
