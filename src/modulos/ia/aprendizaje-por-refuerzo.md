# Aprendizaje por Refuerzo

El aprendizaje por refuerzo es la rama de la inteligencia artificial donde una máquina aprende a tomar decisiones interactuando directamente con su entorno. A diferencia del aprendizaje supervisado, donde una persona entrega miles de ejemplos resueltos, aquí el programa aprende mediante ensayo y error: ejecuta acciones, recibe recompensas cuando acierta o penalizaciones cuando falla, y ajusta su conducta para acumular el mayor beneficio a lo largo del tiempo.

> **En pocas palabras:** Enseña a un sistema informático a decidir bien premiando sus aciertos y castigando sus errores, igual que se educa a un cachorro con caricias y galletas.

---

## 1. De dónde viene y cómo se entiende fácil

Imagina a un niño aprendiendo a montar en bicicleta. Nadie adquiere esa destreza memorizando un manual sobre el centro de masas. El niño sube, se balancea, apoya el pie para no caerse (señal negativa), corrige el manillar, pedalea con más fuerza y avanza diez metros seguidos (señal positiva). Tras muchos intentos, su cerebro consolida los movimientos correctos de forma automática.

El aprendizaje por refuerzo (*Reinforcement Learning* o RL) nace del cruce de dos corrientes:

* **La psicología animal:** A finales del siglo XIX, Edward Thorndike enunció la Ley del Efecto al comprobar que las conductas placenteras tienden a repetirse y las molestas se extinguen. En los años 30, B. F. Skinner formalizó este fenómeno como condicionamiento operante.
* **El control matemático:** En los años 50, Richard Bellman desarrolló en RAND la programación dinámica, fijando cómo optimizar decisiones escalonadas en el tiempo.

En los años 80, Richard Sutton y Andrew Barto unieron ambas disciplinas en la Universidad de Massachusetts Amherst con los métodos de diferencias temporales, que permiten a una máquina calcular el valor de sus acciones sobre la marcha sin esperar al final.

### El dilema entre explorar y explotar

Cualquier sistema de refuerzo afronta una disyuntiva constante:
* **Explotación:** Elegir la mejor alternativa conocida para asegurar un buen resultado inmediato.
* **Exploración:** Probar opciones nuevas para descubrir si esconden un premio mayor, asumiendo el riesgo de fallar.

Es como decidir dónde cenar: puedes volver a tu restaurante favorito de siempre (explotación) o probar un local nuevo (exploración). La técnica habitual es épsilon-voraz (*epsilon-greedy*): el algoritmo elige lo mejor que conoce el 90 % de las veces y se reserva un 10 % aleatorio para explorar.

---

## 2. Cómo funciona por dentro

La mecánica opera como un diálogo constante entre el **agente** (el programa que decide) y el **entorno** (el mundo donde actúa):

1. El agente observa el **estado** actual del entorno.
2. Consulta su **política** (su guía interna de decisión) y ejecuta una **acción**.
3. El entorno responde con un nuevo estado y una **recompensa** numérica.

Para evitar que el agente busque solo ganancias inmediatas, se aplica un factor de descuento temporal (la letra griega gamma, γ, entre 0 y 1). Un valor cercano a 1 premia la visión a largo plazo; un valor cercano a 0 prioriza el beneficio inmediato.

Este proceso se modela como un **Proceso de Decisión de Markov** (MDP). Su premisa es la propiedad de Markov: para elegir la mejor jugada basta con la foto del estado presente; la historia previa no altera las opciones futuras.

### La regla de Bellman

El cálculo central se resume de forma limpia:

```text
Q(estado, acción) = Recompensa + γ × Valor_máximo(nuevo_estado)
```

En palabras sencillas: el valor de una acción equivale a la recompensa inmediata obtenida más el mejor valor futuro que se podrá conseguir desde la nueva situación alcanzada.

### De tablas a redes neuronales (DQN)

En 1989, Chris Watkins propuso **Q-Learning**, que guardaba estos valores en tablas. Servía en problemas pequeños, pero colapsaba ante tareas complejas.

En 2013 y 2015, DeepMind resolvió este límite con **DQN** (*Deep Q-Network*), sustituyendo la tabla por una red neuronal profunda. El sistema aprendió a jugar a videojuegos de Atari 2600 analizando directamente los píxeles de la pantalla, superando el nivel humano sin conocer de antemano las reglas.

### Modelos de lenguaje: RLHF y DPO

En un modelo conversacional, el texto escrito es el estado y cada palabra generada es una acción:

* **RLHF** (*Reinforcement Learning from Human Feedback*): Popularizado en 2022 con ChatGPT. Evaluadores humanos califican respuestas; con esos datos se entrena un modelo de recompensa automático. Luego, el algoritmo PPO (*Proximal Policy Optimization*, OpenAI, 2017) ajusta el modelo con pasos prudentes para que sea útil, seguro y coherente.
* **DPO** (*Direct Preference Optimization*): Presentado en 2023 por la Universidad de Stanford, demostró que el modelo puede optimizarse directamente con preferencias humanas, prescindiendo del modelo de recompensa intermedio y de PPO.

---

## 3. Dónde se usa hoy en la vida real

* **Alineamiento de modelos de lenguaje:** ChatGPT, Claude y Llama usan RLHF y DPO para seguir instrucciones, mitigar errores y rechazar peticiones dañinas.
* **Juegos estratégicos:** AlphaGo (DeepMind, 2016) derrotó al campeón mundial de Go Lee Sedol. AlphaZero (2017) dominó el ajedrez compitiendo contra sí mismo. En videojuegos, OpenAI Five (2019) venció en Dota 2 y AlphaStar (2019) en StarCraft II.
* **Robótica:** Robots bípedos y cuadrúpedos entrenan su marcha en simuladores virtuales. El control aprendido se transfiere con éxito a motores reales (*Sim-to-Real*).
* **Eficiencia energética:** En 2016, DeepMind aplicó este método al enfriamiento de centros de datos de Google, reduciendo un 40 % la energía en climatización.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Enfoque | Mecanismo | Fortaleza principal | Principal debilidad | Riesgo clave |
| :--- | :--- | :--- | :--- | :--- |
| **Q-Learning / DQN** | Estima el valor de cada acción con diferencias temporales. | Reutiliza experiencias pasadas guardadas en memoria. | Solo opera con pocas acciones discretas. | Inestabilidad si la red sobreestima el valor de jugadas. |
| **PPO** | Ajusta la estrategia con pasos prudentes y recortados. | Muy estable en robótica y control continuo. | Exige millones de intentos y desecha datos previos. | Puede estancarse en una estrategia mediocre. |
| **RLHF (con PPO)** | Guía el modelo con un evaluador automático de premios. | Modela matices humanos de estilo y veracidad. | Muy costoso: exige varias redes en memoria GPU. | Trampa de recompensa: respuestas largas y aduladoras pero vacías. |
| **DPO** | Entrena directamente sobre pares de textos preferidos. | Prescinde del evaluador intermedio; ahorra cómputo. | Sensible a datos con preferencias inconsistentes. | Puede empobrecer el vocabulario si se sobreajusta. |

### Limitaciones prácticas y riesgos

* **Demanda de ensayos (*Sample Inefficiency*):** Un vehículo autónomo no puede aprender en la calle real solo por refuerzo porque chocaría al inicio. Requiere millones de kilómetros en simuladores.
* **Trampa de recompensa (*Reward Hacking*):** Al perseguir una puntuación, el sistema puede hallar atajos absurdos. Si se premia a una aspiradora por recoger polvo, puede aprender a vaciar su depósito en la alfombra para volver a aspirar. Cumple la Ley de Goodhart: cuando un indicador se vuelve el objetivo, deja de ser un buen indicador.
* **Impuesto de alineamiento (*Alignment Tax*):** Limitar en exceso a un modelo para evitar fallos puede reducir su chispa creativa o su soltura en razonamiento abstracto.

---

## 5. Temas relacionados

* **Aprendizaje supervisado:** Enfoque donde el modelo aprende a partir de datos resueltos y etiquetados por personas.
* **Modelos de lenguaje de gran escala (LLMs):** Redes entrenadas con texto masivo que se afinan mediante refuerzo para dialogar con seguridad.
* **Aprendizaje por imitación:** Técnica donde el agente copia demostraciones de expertos antes de explorar por su cuenta.
* **Alineamiento y seguridad en IA:** Disciplina dedicada a que los sistemas inteligentes respeten los valores y la seguridad humana.
