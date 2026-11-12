# Machine Learning: Cómo Aprenden las Máquinas a Partir de Ejemplos

Durante décadas, programar una computadora equivalía a redactar un recetario: un especialista escribía instrucciones minuciosas paso a paso. La limitación surge ante tareas complejas de la vida diaria, como leer una radiografía o detectar transacciones bancarias fraudulentas: no existen reglas fijas que anticipen cada escenario posible.

El aprendizaje automático o *Machine Learning* invierte esa lógica. En lugar de redactar reglas a mano, alimentamos al sistema con abundantes datos previos. Mediante optimización matemática y cálculo estadístico, el algoritmo identifica los patrones subyacentes y genera un modelo capaz de resolver con acierto situaciones nunca antes vistas.

> **En pocas palabras:** El Machine Learning es la rama de la inteligencia artificial donde las computadoras analizan ejemplos pasados para descubrir patrones por su cuenta y tomar decisiones acertadas sobre datos nuevos.

---

## 1. De dónde viene y cómo se entiende fácil

Pensemos en cómo aprende una persona a reconocer un perro. Nadie le entrega un manual con medidas de hocicos u orejas. Durante la infancia observó perros en parques y fotografías, y cuando confundió un gato la corrigieron. Tras acumular ejemplos, su cerebro consolidó un patrón visual. Al ver una raza desconocida, sabe al instante que es un perro. El Machine Learning opera igual: sustituye la intuición biológica por cálculos matemáticos con matrices, probabilidades y funciones de error.

El término nació en 1959 con el informático Arthur Samuel en IBM. Samuel programó un sistema para jugar a las damas en una computadora IBM 704. En vez de codificar cada jugada, permitió que la máquina disputara miles de partidas contra sí misma, aprendiendo qué posiciones aumentaban las probabilidades de ganar hasta batir a jugadores experimentados.

En 1997, Tom Mitchell formalizó la definición estándar del campo: un programa aprende de la experiencia (E) respecto a una tarea (T) evaluada por una medida de rendimiento (P), si su rendimiento en T mejora con la experiencia E. En un filtro de correo no deseado (*spam*), la tarea es clasificar mensajes entrantes, el rendimiento es el porcentaje de aciertos, y la experiencia son los correos analizados previamente.

### Aprender frente a memorizar

El fin del aprendizaje automático no es memorizar los datos de entrenamiento, sino generalizar ante casos desconocidos:

- **Subajuste (alto sesgo):** El modelo es excesivamente simple y no capta la estructura real de los datos. Si estimamos el precio de una vivienda solo por el color de la puerta, fallará en cualquier prueba.
- **Sobreajuste (alta varianza):** El modelo memoriza el ruido y particularidades accidentales de los datos conocidos. Equivale al estudiante que memoriza de carrerilla las preguntas de un simulacro: obtiene nota perfecta en el ensayo, pero suspende el examen real en cuanto cambian los ejercicios.

---

## 2. Cómo funciona por dentro

El aprendizaje automático se organiza en tres familias principales:

### Aprendizaje supervisado
Es el método más habitual en producción. Cada dato de entrada cuenta con una etiqueta conocida:
1. **Regresión:** La respuesta es continua, como estimar la temperatura de mañana o el precio de un inmueble.
2. **Clasificación:** La respuesta es una categoría discreta, como distinguir transacciones bancarias legítimas de fraudulentas.

En una relación lineal, el modelo calcula una suma ponderada de las variables de entrada multiplicadas por pesos numéricos más un término de ajuste:

```
predicción = (peso₁ × dato₁) + (peso₂ × dato₂) + ajuste_base
```

Para clasificar entre dos opciones (regresión logística), esa combinación lineal pasa por una función sigmoide que comprime el resultado en una probabilidad entre 0 y 1:

```
probabilidad = 1 ÷ (1 + e^(-z))
```

En datos tabulares (bases de datos y hojas de cálculo), dominan los ensambles de árboles de decisión. Modelos como XGBoost, creado por Tianqi Chen y Carlos Guestrin en 2016, combinan árboles en secuencia donde cada nuevo árbol corrige los errores residuales del anterior.

### Aprendizaje no supervisado
Trabaja sobre datos sin etiquetar para descubrir patrones ocultos:
- **Agrupamiento (*clustering*):** Métodos como K-Means segmentan perfiles de clientes calculando distancias matemáticas entre sus atributos.
- **Reducción de dimensionalidad:** Algoritmos como PCA (Análisis de Componentes Principales, formulado por Karl Pearson en 1901) reducen cientos de variables correlacionadas a pocos ejes sin perder información clave.

### Aprendizaje auto-supervisado
Hace posible los grandes modelos de lenguaje modernos. El sistema toma datos sin clasificar, oculta fragmentos y aprende intentando predecir las partes faltantes a partir del contexto, prescindiendo del costoso etiquetado manual.

### Validación cruzada y evaluación
Para comprobar que el modelo generaliza bien, separamos rigurosamente los datos entre entrenamiento y prueba:

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 80% para entrenar y 20% para examinar sin contaminación
X_entrena, X_prueba, y_entrena, y_prueba = train_test_split(
    datos_x, etiquetas_y, test_size=0.20, random_state=42
)

modelo = RandomForestClassifier(n_estimators=100, random_state=42)
modelo.fit(X_entrena, y_entrena)

predicciones = modelo.predict(X_prueba)
print(f"Precisión: {accuracy_score(y_prueba, predicciones) * 100:.1f}%")
```

---

## 3. Dónde se usa hoy en la vida real

- **Detección de fraude financiero:** Pasarelas de pago evalúan cada compra en menos de 50 milisegundos. Algoritmos basados en árboles analizan importes, geolocalización y hábitos del usuario para bloquear operaciones sospechosas en tiempo real.
- **Motores de recomendación:** Plataformas digitales analizan patrones de consumo para sugerir productos o contenidos según afinidades compartidas entre millones de usuarios.
- **Medicina y diagnóstico asistido:** Algoritmos entrenados con tomografías asisten a especialistas detectando anomalías tempranas, mientras modelos moleculares predicen qué compuestos químicos tienen mayor potencial farmacológico.
- **Mantenimiento predictivo:** Sensores en turbinas y plantas industriales vigilan vibraciones y temperaturas para anticipar averías mecánicas antes de que detengan la producción.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Enfoque | Mayor fortaleza | Principal limitación | Riesgo crítico |
| :--- | :--- | :--- | :--- |
| **Supervisado** | Alta precisión con datos bien clasificados | Dependencia de costoso etiquetado humano | Reproduce sesgos históricos de los datos |
| **No supervisado** | Descubre patrones sin guía humana | Validación subjetiva de los grupos | Encuentra agrupaciones ficticias por ruido |
| **Auto-supervisado** | Escala sobre corpus masivos de datos crudos | Consumo computacional y energético extremo | Opacidad interna y dificultad de auditoría |

### Riesgos operativos y éticos

- **Deriva de datos (*concept drift*):** La realidad cambia constantemente. Un modelo de demanda comercial entrenado antes de 2020 perdió validez con la pandemia. Todo sistema en producción exige monitoreo continuo y reentrenamiento para no degradarse.
- **Sesgo algorítmico:** Los algoritmos no son neutros por naturaleza; reflejan los sesgos de sus datos de origen. Si un sistema de contratación aprende de decisiones pasadas discriminatorias, amplificará esa inequidad bajo una apariencia de objetividad técnica.
- **Opacidad de caja negra:** En modelos complejos es difícil rastrear el motivo exacto de una decisión individual. Normativas como la Ley de Inteligencia Artificial de la Unión Europea (aprobada en 2024) exigen explicabilidad, gobernanza de datos y supervisión humana en aplicaciones críticas.

---

## 5. Temas relacionados

- **Deep Learning (Aprendizaje Profundo):** Subcampo del Machine Learning basado en redes neuronales profundas para visión artificial y procesamiento de lenguaje.
- **Aprendizaje por Refuerzo:** Paradigma interactivo donde un agente aprende a tomar decisiones maximizando recompensas mediante ensayo y error en un entorno dinámico.
- **Descenso de Gradiente:** Algoritmo de optimización que actualiza iterativamente los pesos del modelo para minimizar su error.
- **Ingeniería de Características:** Proceso de seleccionar y transformar variables brutas para facilitar la extracción de patrones por parte del algoritmo.
