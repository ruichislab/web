# Aprendizaje por Refuerzo (Reinforcement Learning)

El **Aprendizaje por Refuerzo** (*Reinforcement Learning*, RL) es un paradigma del aprendizaje automático centrado en la toma secuencial de decisiones óptimas en entornos dinámicos e inciertos. En este marco, una entidad autónoma o **agente** interactúa con un **entorno** ejecutando acciones y recibiendo retroalimentación mediante estados y recompensas numéricas escalares. A diferencia del aprendizaje supervisado —que depende de colecciones de datos etiquetados— y del no supervisado —enfocado en el descubrimiento de patrones latentes—, el aprendizaje por refuerzo descubre políticas óptimas de conducta mediante la exploración orientada a metas y la evaluación temporal de sus consecuencias. En la actualidad, el RL fundamenta avances clave en robótica autónoma, control de sistemas complejos y el alineamiento cualitativo y de seguridad en modelos de lenguaje a gran escala (*Large Language Models*, LLMs).

---

## 1. Origen e Intuición Fundamental

Las bases conceptuales del aprendizaje por refuerzo surgen de la convergencia entre la psicología conductista del aprendizaje animal y la teoría matemática del control óptimo.

Por un lado, la formulación conductista proviene de la **Ley del Efecto** enunciada por Edward Thorndike y ampliada por B. F. Skinner en el condicionamiento operante: los comportamientos asociados a consecuencias favorables tienden a repetirse, mientras que los desfavorables se extinguen. Por otro lado, en la década de 1950, Richard Bellman desarrolló las ecuaciones de la **programación dinámica**, estableciendo la teoría matemática de optimización en procesos estocásticos. En los años 1980, Richard Sutton y Andrew Barto integraron ambas vertientes creando los métodos de diferencias temporales (*Temporal-Difference Learning*).

### La Interacción Agente-Entorno

El flujo operativo se modela como un ciclo discreto en instantes de tiempo $t = 0, 1, 2, \dots$:
1. El agente observa el estado actual del entorno $S_t \in \mathcal{S}$.
2. Conforme a su política interna $\pi$, escoge y ejecuta una acción $A_t \in \mathcal{A}$.
3. El entorno transiciona a un nuevo estado $S_{t+1} \in \mathcal{S}$ y emite una recompensa escalar $R_{t+1} \in \mathbb{R}$.

La meta del agente es maximizar el **retorno acumulado descontado** $G_t$:

$$G_t = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}$$

donde $\gamma \in [0, 1)$ representa el factor de descuento temporal. Este término garantiza la convergencia analítica en horizontes infinitos y balancea la importancia entre gratificaciones inmediatas y beneficios a largo plazo.

### El Dilema entre Exploración y Explotación

El núcleo distintivo del RL es el equilibrio entre **exploración** y **explotación**:
* **Explotación:** Elegir la acción con el mayor retorno estimado según el conocimiento actual para maximizar la recompensa a corto plazo.
* **Exploración:** Probar acciones desconocidas para recabar información sobre el espacio de estados y descubrir recompensas potencialmente más altas.

La explotación pura conduce a óptimos locales subóptimos, mientras que la exploración excesiva degrada el rendimiento. Para resolver este compromiso se utilizan estrategias como:
* **$\epsilon$-greedy:** El agente elige la mejor acción conocida con probabilidad $1 - \epsilon$, y una acción aleatoria uniforme con probabilidad $\epsilon$.
* **Exploración Boltzmann:** Selecciona acciones probabilísticamente según su valor normalizado mediante una función softmax con temperatura $T$.
* **Cota Superior de Confianza (UCB):** Prioriza acciones sumando a su valor esperado una cota de incertidumbre inversamente proporcional a la frecuencia de su selección previa.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### Procesos de Decisión de Markov (MDP)

El fundamento matemático del RL es el **Proceso de Decisión de Markov** (MDP), formalizado mediante la tupla $\langle \mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R}, \gamma \rangle$:
* $\mathcal{S}$: Conjunto de estados.
* $\mathcal{A}$: Espacio de acciones.
* $\mathcal{P}$: Función de transición de probabilidad $\mathcal{P}(s' \mid s, a) = P(S_{t+1} = s' \mid S_t = s, A_t = a)$. Respeta la **propiedad de Markov**: el futuro depende exclusivamente del estado y acción presentes, sin memoria de la trayectoria previa.
* $\mathcal{R}$: Función de recompensa esperada $\mathcal{R}(s, a) = \mathbb{E}[R_{t+1} \mid S_t = s, A_t = a]$.
* $\gamma \in [0, 1)$: Factor de descuento temporal.

Una **política** $\pi(a \mid s) = P(A_t = a \mid S_t = s)$ determina la distribución de acciones dado un estado. A partir de ella se derivan dos funciones de valor:
1. **Función de valor de estado:** $V^\pi(s) = \mathbb{E}_\pi [G_t \mid S_t = s]$
2. **Función de valor de acción:** $Q^\pi(s, a) = \mathbb{E}_\pi [G_t \mid S_t = s, A_t = a]$

### Ecuaciones de Bellman

Las ecuaciones de Bellman descomponen el valor recursivamente en la recompensa inmediata y el valor del estado siguiente. Para la política óptima $\pi^*$:

$$V^*(s) = \max_{a \in \mathcal{A}} \left[ \mathcal{R}(s, a) + \gamma \sum_{s' \in \mathcal{S}} \mathcal{P}(s' \mid s, a) V^*(s') \right]$$

$$Q^*(s, a) = \mathcal{R}(s, a) + \gamma \sum_{s' \in \mathcal{S}} \mathcal{P}(s' \mid s, a) \max_{a' \in \mathcal{A}} Q^*(s', a')$$

### Q-Learning y Deep Q-Networks (DQN)

En contextos donde las transiciones y recompensas son desconocidas (*model-free*), **Q-Learning** estima $Q^*$ de forma *off-policy* mediante la regla:

$$Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma \max_{a} Q(S_{t+1}, a) - Q(S_t, A_t) \right]$$

donde $\alpha \in (0, 1]$ es la tasa de aprendizaje. Para espacios continuos o de alta dimensión perceptual, **DQN** aproxima $Q(s, a; \theta)$ con una red neuronal profunda, empleando un búfer de repetición de experiencias (*replay buffer*) y una red objetivo (*target network*) para estabilizar la optimización.

```python
def paso_q_learning(q_tabla, s, a, r, s_sig, alpha, gamma):
    """Actualización temporal tabular de la función de valor Q."""
    mejor_q_sig = max(q_tabla[s_sig].values())
    error_td = r + gamma * mejor_q_sig - q_tabla[s][a]
    q_tabla[s][a] += alpha * error_td
    return q_tabla
```

### Proximal Policy Optimization (PPO)

Los métodos de gradiente de política optimizan directamente los parámetros de $\pi_\theta(a \mid s)$. Para evitar actualizaciones excesivamente grandes que degraden el rendimiento de forma irreversible, **PPO** introduce una función objetivo recortada (*clipped surrogate objective*):

$$L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min \left( r_t(\theta)\hat{A}_t, \, \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon)\hat{A}_t \right) \right]$$

donde $r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{old}}(a_t \mid s_t)}$ es el ratio de probabilidades, $\hat{A}_t$ es la función de ventaja estimada ($\hat{A} = Q - V$) y $\epsilon$ es el límite de recorte (generalmente $0.2$). El recorte inhibe cambios abruptos en la distribución de la política.

### Alineamiento de LLMs: RLHF y DPO

En modelos de lenguaje autorregresivos, el espacio de estados corresponde a secuencias de tokens contextuales y las acciones corresponden a los tokens generados.

#### 1. RLHF (Reinforcement Learning from Human Feedback)
El protocolo estándar de RLHF se estructura en tres etapas:
1. **Supervised Fine-Tuning (SFT):** Ajuste del modelo base con pares de instrucción-respuesta supervisados de alta calidad.
2. **Entrenamiento del Reward Model (RM):** A partir de pares de respuestas evaluadas por humanos ($y_w \succ y_l$, donde $y_w$ es la respuesta preferida y $y_l$ la rechazada), se entrena un modelo de recompensa $r_\psi(x, y)$ bajo el marco probabilístico de Bradley-Terry:
   $$\mathcal{L}_{RM}(\psi) = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( r_\psi(x, y_w) - r_\psi(x, y_l) \right) \right]$$
3. **Optimización con PPO:** El LLM $\pi_\theta$ se optimiza mediante PPO para maximizar la recompensa del RM, aplicando una penalización de divergencia Kullback-Leibler (KL) frente al modelo de referencia inicial $\pi_{ref}$ para prevenir la degradación de fluidez y el *reward hacking*:
   $$\max_\theta \mathbb{E}_{x, y \sim \pi_\theta} \left[ r_\psi(x, y) \right] - \beta \, \mathbb{D}_{KL}(\pi_\theta(y \mid x) \parallel \pi_{ref}(y \mid x))$$

#### 2. DPO (Direct Preference Optimization)
Para superar la complejidad operativa de RLHF —que requiere mantener simultáneamente en memoria el modelo de política, el de referencia, el de recompensa y el crítico de valor—, Rafailov et al. (2023) dedujeron analíticamente que la recompensa óptima restringida por KL satisface:

$$r^*(x, y) = \beta \log \frac{\pi^*(y \mid x)}{\pi_{ref}(y \mid x)} + \beta \log Z(x)$$

Al sustituir esta expresión en la verosimilitud de Bradley-Terry, la función de partición $\log Z(x)$ se cancela, permitiendo optimizar directamente la política mediante una pérdida supervisada:

$$\mathcal{L}_{DPO}(\theta; \pi_{ref}) = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{ref}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{ref}(y_l \mid x)} \right) \right]$$

DPO descarta la necesidad de entrenar un Reward Model explícito y prescinde del muestreo interactivo con PPO, logrando un entrenamiento estable y computacionalmente eficiente.

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Alineamiento de LLMs Generativos:** Plataformas avanzadas (como ChatGPT, Claude y Llama) aplican RLHF o DPO para alinear sus respuestas con criterios humanos de utilidad, veracidad y neutralidad, inhibiendo la generación de contenidos dañinos.
2. **Sistemas de Juego y Estrategia Compleja:** Algoritmos como AlphaGo y AlphaZero superaron a campeones mundiales en Go y ajedrez mediante aprendizaje por refuerzo y búsqueda en árbol de Monte Carlo (MCTS), mientras que AlphaStar y OpenAI Five dominaron videojuegos de estrategia en tiempo real.
3. **Robótica y Control Físico Autónomo:** En entornos simulados (*Sim-to-Real*), PPO y algoritmos actor-crítico permiten a robots cuadrúpedos y manipuladores industriales aprender locomoción y prensión diestra frente a perturbaciones del entorno.
4. **Optimización Energética y de Infraestructura:** Implementaciones de agentes de RL en centros de datos de gran escala regulan dinámicamente sistemas de refrigeración, logrando reducciones superiores al 30% en consumo eléctrico continuo.

---

## 4. Ventajas, Limitaciones y Riesgos

El aprendizaje por refuerzo permite aprender comportamientos adaptativos sin etiquetas explícitas paso a paso, aunque presenta desafíos operativos y computacionales considerables.

| Algoritmo / Enfoque | Principio Central | Ventajas Clave | Limitaciones | Riesgo Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Q-Learning / DQN** | Estimación de valor TD *off-policy*. | Simpleza conceptual; aprovecha el buffer de repetición. | Ineficiente en espacios continuos de acción. | Divergencia con aproximadores de redes profundas. |
| **PPO** | Gradiente de política con restricción por ratio recortado. | Robusto y estable; estándar de facto en control continuo. | Ineficiencia de muestreo; alta sensibilidad a hiperparámetros. | Estancamiento en mínimos locales si $\epsilon$ es inadecuado. |
| **RLHF (con PPO)** | Guía por modelo de recompensa derivado de juicios humanos. | Capaz de modelar preferencias humanas complejas. | Alto coste de memoria (4 modelos simultáneos en GPU). | **Reward Hacking:** el modelo explota sesgos del RM sin resolver la tarea. |
| **DPO** | Optimización de preferencias directa en forma cerrada. | Elimina el Reward Model y el bucle PPO; gran estabilidad. | Susceptible a datos ruidosos o fuera de distribución (*OOD*). | Posible pérdida de diversidad léxica por sobreajuste (*mode collapse*). |

### Desafíos Transversales

* **Ineficiencia Muestral (*Sample Inefficiency*):** Requiere millones de transacciones de entrenamiento para converger, lo que restringe el entrenamiento directo en entornos físicos reales sin simulación.
* **Piratería de Recompensas (*Reward Hacking*):** El agente maximiza la función formal de recompensa mediante comportamientos no deseados que explotan vacíos en su diseño (consecuencia directa de la Ley de Goodhart).
* **Impuesto de Alineamiento (*Alignment Tax*):** Un alineamiento excesivamente restrictivo con RLHF o DPO puede reducir la creatividad o la capacidad deductiva general del modelo base original.

---

## 5. Conceptos Relacionados

* **Modelos de Lenguaje de Gran Escala (LLMs):** Modelos autorregresivos sobre los que operan RLHF y DPO para ajustar distribuciones de probabilidad de salida a preferencias humanas.
* **Redes Neuronales Profundas (Deep Learning):** Arquitecturas clave empleadas como aproximadores de funciones continuas para políticas y valores en espacios complejos.
* **Ajuste Fino Supervisado (Supervised Fine-Tuning - SFT):** Etapa previa indispensable en los flujos modernos de alineamiento de modelos generativos.
* **Seguridad y Alineamiento en IA (AI Safety):** Subcampo enfocado en asegurar que los sistemas autónomos persigan objetivos consistentes con la ética y la intención humana.
