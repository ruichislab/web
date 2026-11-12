# Aprendizaje por Refuerzo (Reinforcement Learning)

El **Aprendizaje por Refuerzo** (*Reinforcement Learning*, RL) es una rama fundamental del aprendizaje automático enfocada en la toma secuencial de decisiones óptimas en entornos dinámicos e inciertos. En este paradigma, un **agente** aprende a interactuar con un **entorno** ejecutando acciones y recibiendo observaciones de estado y recompensas escalares. A diferencia del aprendizaje supervisado —basado en datos explícitamente etiquetados— y del no supervisado —que busca estructuras ocultas—, el RL descubre políticas efectivas mediante prueba, error y evaluación de recompensas diferidas. Actualmente, es indispensable en robótica autónoma, control de sistemas complejos y el alineamiento de modelos de lenguaje a gran escala (*Large Language Models*, LLMs).

---

## 1. Origen e Intuición Fundamental

El aprendizaje por refuerzo integra dos vertientes: la psicología conductista del aprendizaje animal y la teoría de control óptimo.

Por un lado, la **Ley del Efecto** (Thorndike) y el condicionamiento operante (Skinner) demostraron que los comportamientos premiados tienden a repetirse y los castigados a extinguirse. Por otro lado, en la década de 1950, Richard Bellman formuló la **programación dinámica**, estableciendo las bases matemáticas para optimizar procesos estocásticos. En la década de 1980, Richard Sutton y Andrew Barto fusionaron ambas disciplinas mediante los métodos de diferencias temporales.

### Interacción Agente-Entorno

El flujo operativo se modela en instantes discretos $t = 0, 1, 2, \dots$:
1. El agente percibe el estado $S_t \in \mathcal{S}$.
2. Según su política $\pi$, ejecuta la acción $A_t \in \mathcal{A}$.
3. El entorno transiciona al estado $S_{t+1} \in \mathcal{S}$ y devuelve una recompensa $R_{t+1} \in \mathbb{R}$.

El objetivo del agente es maximizar el **retorno acumulado descontado** $G_t$:

$$G_t = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}$$

donde $\gamma \in [0, 1)$ es el factor de descuento temporal que pondera la relevancia entre beneficios inmediatos y futuros, asegurando convergencia en horizontes ilimitados.

### Exploración vs. Explotación

El dilema central del RL consiste en balancear dos fuerzas opuestas:
* **Explotación:** Elegir la mejor acción conocida según los datos históricos para maximizar la recompensa a corto plazo.
* **Exploración:** Probar acciones desconocidas para descubrir recompensas potencialmente más altas y evitar mínimos locales.

Entre los métodos habituales para gestionar este balance destacan la estrategia **$\epsilon$-greedy** (selección codiciosa con probabilidad $1-\epsilon$ y acción aleatoria uniforme con $\epsilon$), la exploración por **Softmax/Boltzmann** y los algoritmos de **Cota Superior de Confianza (UCB)**.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### Procesos de Decisión de Markov (MDP)

El RL se formaliza matemáticamente mediante un **Proceso de Decisión de Markov** $\langle \mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R}, \gamma \rangle$:
* $\mathcal{S}$: Conjunto de estados admisibles.
* $\mathcal{A}$: Espacio de acciones.
* $\mathcal{P}$: Probabilidad de transición $\mathcal{P}(s' \mid s, a) = P(S_{t+1}=s' \mid S_t=s, A_t=a)$, que satisface la **propiedad de Markov** (el estado presente resume toda la información previa relevante).
* $\mathcal{R}$: Función de recompensa esperada $\mathcal{R}(s, a) = \mathbb{E}[R_{t+1} \mid S_t=s, A_t=a]$.
* $\gamma$: Factor de descuento.

Una política $\pi(a \mid s)$ define el comportamiento del agente. Se derivan dos funciones de valor centrales:
* **Valor de estado:** $V^\pi(s) = \mathbb{E}_\pi [G_t \mid S_t = s]$
* **Valor de acción:** $Q^\pi(s, a) = \mathbb{E}_\pi [G_t \mid S_t = s, A_t = a]$

### Ecuaciones de Bellman

Las ecuaciones de optimalidad de Bellman descomponen recursivamente el valor óptimo:

$$V^*(s) = \max_{a} \left[ \mathcal{R}(s, a) + \gamma \sum_{s'} \mathcal{P}(s' \mid s, a) V^*(s') \right]$$

$$Q^*(s, a) = \mathcal{R}(s, a) + \gamma \sum_{s'} \mathcal{P}(s' \mid s, a) \max_{a'} Q^*(s', a')$$

### Q-Learning y DQN

Cuando se desconoce el modelo del entorno (*model-free*), **Q-Learning** (Watkins, 1989) actualiza la estimación de $Q$ de manera *off-policy*:

$$Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma \max_{a} Q(S_{t+1}, a) - Q(S_t, A_t) \right]$$

donde $\alpha$ es la tasa de aprendizaje. En espacios de alta dimensionalidad, **DQN** aproxima $Q(s, a; \theta)$ mediante redes neuronales profundas e introduce un búfer de repetición (*replay buffer*) y una red objetivo (*target network*) para estabilizar el gradiente.

```python
def paso_q_learning(q_tabla, s, a, r, s_sig, alpha, gamma):
    """Actualización temporal tabular de la función Q."""
    mejor_q_sig = max(q_tabla[s_sig].values())
    error_td = r + gamma * mejor_q_sig - q_tabla[s][a]
    q_tabla[s][a] += alpha * error_td
    return q_tabla
```

### Proximal Policy Optimization (PPO)

Los métodos de gradiente de política optimizan $\pi_\theta(a \mid s)$ directamente. Para evitar actualizaciones drásticas que colapsen la política, **PPO** (Schulman et al., 2017) implementa una función objetivo con recorte (*clipped objective*):

$$L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min \left( r_t(\theta)\hat{A}_t, \, \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon)\hat{A}_t \right) \right]$$

donde $r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{old}}(a_t \mid s_t)}$ es el ratio de probabilidades, $\hat{A}_t$ es la ventaja estimada y $\epsilon \approx 0.2$. El recorte impide desviaciones excesivas entre iteraciones consecutivas.

### Alineamiento de LLMs: RLHF y DPO

En modelos de lenguaje generativos, el prompt representa el estado y los tokens generados corresponden a las acciones.

#### 1. RLHF (Reinforcement Learning from Human Feedback)
Consta de tres fases:
1. **Supervised Fine-Tuning (SFT):** Afinamiento del modelo base con respuestas instruccionales de alta calidad.
2. **Reward Model (RM):** Se recogen comparaciones humanas ($y_w \succ y_l$, elegida vs. rechazada) y se entrena un modelo de recompensa $r_\psi(x, y)$ bajo el marco de Bradley-Terry:
   $$\mathcal{L}_{RM}(\psi) = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( r_\psi(x, y_w) - r_\psi(x, y_l) \right) \right]$$
3. **PPO con Penalización KL:** Se optimiza el LLM maximizando la recompensa escalar del RM sujeto a una penalización por divergencia Kullback-Leibler frente a la política de referencia $\pi_{ref}$ para prevenir alucinaciones y *reward hacking*:
   $$\max_\theta \mathbb{E}_{x, y \sim \pi_\theta} [r_\psi(x, y)] - \beta \, \mathbb{D}_{KL}(\pi_\theta \parallel \pi_{ref})$$

#### 2. DPO (Direct Preference Optimization)
Rafailov et al. (2023) demostraron que la recompensa implícita se deriva analíticamente de la política óptima: $r^*(x, y) = \beta \log \frac{\pi^*(y \mid x)}{\pi_{ref}(y \mid x)} + \beta \log Z(x)$. Sustituyendo esto en la función de verosimilitud de preferencias, el término de normalización se cancela, derivando una función de pérdida supervisada directa:

$$\mathcal{L}_{DPO}(\theta; \pi_{ref}) = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{ref}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{ref}(y_l \mid x)} \right) \right]$$

DPO prescinde del entrenamiento del Reward Model y del costoso bucle de muestreo autorregresivo de PPO, aportando estabilidad matemática y eficiencia computacional superior.

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Alineamiento de LLMs:** Fundamento de modelos como ChatGPT, Claude y Llama para asegurar veracidad, seguimiento estricto de instrucciones y mitigación de toxicidad.
2. **Juegos Estratégicos:** Dominio sobrehumano en Go y ajedrez (AlphaZero) y videojuegos dinámicos por equipos (OpenAI Five, AlphaStar).
3. **Robótica Avanzada:** Aprendizaje de locomoción ágil en robots bípedos y cuadrúpedos, así como manipulación diestra mediante simulación con transferencia a hardware real (*Sim-to-Real*).
4. **Optimización Energética:** Regulación autónoma en tiempo real de centros de datos, reduciendo hasta un 40% del consumo energético de enfriamiento industrial.

---

## 4. Ventajas, Limitaciones y Riesgos

| Enfoque | Principio Mecánico | Ventajas | Limitaciones | Riesgo Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Q-Learning / DQN** | Diferencias temporales *off-policy*. | Teóricamente transparente; reutiliza datos previos del buffer. | Inviable en acciones continuas de gran escala. | Inestabilidad al combinar aproximadores no lineales (*Deadly Triad*). |
| **PPO** | Gradiente de política con ratio recortado. | Elevada estabilidad empírica; estándar de control continuo. | Ineficiente en muestras; requiere descartar trayectorias viejas. | Convergencia a políticas locales subóptimas. |
| **RLHF (PPO)** | Guía mediante Reward Model y penalización KL. | Incorpora juicios cualitativos humanos complejos. | Requiere mantener 4 redes simultáneas en GPU. | **Reward Hacking:** el modelo aprende a engañar al RM con verborrea. |
| **DPO** | Optimización de preferencias en forma cerrada. | Elimina el Reward Model y el bucle PPO; cómputo ligero. | Sensible a datos ruidosos o fuera de distribución (*OOD*). | Reducción de la diversidad lingüística (*mode collapse*). |

### Limitaciones Transversales

* **Ineficiencia Muestral (*Sample Inefficiency*):** Exige millones de interacciones de prueba y error, forzando el uso de simuladores sintéticos.
* **Ley de Goodhart y Reward Hacking:** Cuando la métrica de recompensa se fija como objetivo absoluto, el agente suele explotar resquicios que producen recompensas numéricas altas con conductas disfuncionales.
* **Impuesto de Alineamiento (*Alignment Tax*):** Un alineamiento excesivo para maximizar seguridad puede menoscabar ligeramente las capacidades analíticas generales del modelo base.

---

## 5. Conceptos Relacionados

* **Modelos de Lenguaje de Gran Escala (LLMs):** Modelos generativos donde RLHF y DPO guían la distribución de probabilidades de salida según preferencias humanas.
* **Redes Neuronales Profundas (Deep Learning):** Arquitecturas no lineales empleadas para aproximar funciones de valor y políticas de alta dimensionalidad.
* **Ajuste Fino Supervisado (Supervised Fine-Tuning - SFT):** Fase obligatoria previa al RL para dotar al modelo de capacidades instruccionales base.
* **Seguridad y Alineamiento en IA (AI Safety):** Disciplina enfocada en garantizar que los sistemas de IA actúen en consonancia con la intención y valores humanos.
