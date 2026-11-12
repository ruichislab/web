# Ética, Privacidad y Regulación en Inteligencia Artificial

La inteligencia artificial ha pasado del laboratorio a influir directamente en la sociedad: determina quién recibe un préstamo bancario, qué aspirantes superan un proceso de contratación o qué turnos se asignan en urgencias médicas. Cuando un modelo comete errores o hereda prejuicios del pasado, el impacto no es teórico: perjudica a personas reales. Diseñar sistemas fiables exige mucho más que maximizar su porcentaje de aciertos; requiere impedir la discriminación injusta, proteger los datos íntimos y definir normas legales claras cuando la tecnología falla.

> **En pocas palabras:** La ética y la regulación en inteligencia artificial garantizan que los algoritmos tomen decisiones justas sin discriminar a colectivos vulnerables, respeten el secreto de nuestros datos personales y respondan ante la ley cuando cometen errores perjudiciales.

---

## 1. De dónde viene y cómo se entiende fácil

Imagina un tribunal que revisa miles de sentencias del último siglo para enseñar a una computadora a fijar fianzas judiciales. Si durante ese siglo ciertos colectivos sufrieron arrestos desproporcionados por los mismos delitos, el sistema no aprenderá justicia, sino a replicar la discriminación histórica con apariencia de rigor matemático.

Durante décadas, la informática evaluó los modelos fijándose solo en el porcentaje global de aciertos (la precisión o *accuracy*). Si un sistema acertaba el 95 % de las veces, se daba por bueno. Sin embargo, en la década de 2010 se comprobó que los fallos no eran aleatorios, sino que castigaban sistemáticamente a minorías desfavorecidas. En 2016, una investigación periodística de ProPublica sobre el algoritmo penal COMPAS en Estados Unidos demostró que clasificaba erróneamente a los acusados negros como futuros reincidentes casi el doble de veces que a los blancos con antecedentes idénticos.

Ocultar variables sensibles (como raza o género) tampoco resuelve el problema. Las redes neuronales identifican con facilidad variables indirectas (*proxies*): a partir del código postal, las compras habituales o el tipo de empleo, el algoritmo reconstruye con fidelidad los atributos protegidos que se intentaban omitir.

Al mismo tiempo surgió una alerta crítica de privacidad. Centralizar millones de historiales clínicos en servidores corporativos facilitaba ataques de inferencia (*membership inference*), donde un intruso puede averiguar si una persona concreta padece una enfermedad analizando las respuestas del modelo. Para impedirlo, la investigadora Cynthia Dwork y sus colegas formularon en 2006 la **Privacidad Diferencial**, estableciendo garantías matemáticas demostrables de anonimato. Más tarde, en 2017, H. Brendan McMahan y su equipo en Google introdujeron el **Aprendizaje Federado**, demostrando que es posible entrenar redes neuronales sin extraer los datos crudos del dispositivo del usuario.

Las recomendaciones voluntarias se mostraron insuficientes para frenar abusos. Por ello, la Unión Europea aprobó en 2024 el **Reglamento Europeo de Inteligencia Artificial** (*EU AI Act*, Reglamento UE 2024/1689), el primer estándar normativo vinculante del mundo para auditar y sancionar el mal uso algorítmico.

---

## 2. Cómo funciona por dentro

El control técnico de la inteligencia artificial descansa sobre tres pilares: la auditoría de equidad, la inyección formal de ruido y el entrenamiento descentralizado.

### 1. Métricas de equidad algorítmica (*Fairness*)

Definir qué es un resultado justo depende del criterio adoptado:
- **Paridad demográfica (*Demographic Parity*):** Exige que el algoritmo seleccione la misma proporción de candidatos de cada grupo, con independencia de las diferencias de partida.
- **Igualdad de oportunidades (*Equal Opportunity*):** Formulada por Moritz Hardt, Eric Price y Nathan Srebro en 2016, exige que las personas cualificadas para un beneficio (Y = 1) tengan la misma probabilidad de ser aceptadas, sin importar su grupo de pertenencia (A = 0 o A = 1):

```text
P(Predicción = 1 | Grupo = 0, Real = 1) = P(Predicción = 1 | Grupo = 1, Real = 1)
```

En 2016, Jon Kleinberg, Sendhil Mullainathan y Manish Raghavan demostraron el **teorema de imposibilidad de la equidad**: salvo en escenarios ideales donde todos los grupos presentan idéntica tasa base o el modelo no comete ningún fallo, resulta matemáticamente imposible cumplir a la vez con todas las nociones formales de justicia. La elección de una métrica es siempre una decisión moral y legal.

### 2. Privacidad Diferencial (ε, δ-DP)

La Privacidad Diferencial funciona como un velo probabilístico: garantiza que la salida de un análisis estadístico sobre un grupo apenas varíe si los datos de una persona concreta se añaden o se eliminan de la muestra.

Un algoritmo M satisface (ε, δ)-Privacidad Diferencial si para cualesquiera dos bases de datos vecinas D y D' que difieren en un solo individuo, y para todo resultado posible S:

```text
P( M(D) ∈ S ) ≤ exp(ε) × P( M(D') ∈ S ) + δ
```

- **Épsilon (ε):** Presupuesto de privacidad. A menor valor, mayor anonimato (y más ruido añadido), pero menor exactitud en el resultado.
- **Delta (δ):** Margen de error residual de fuga de datos, fijado habitualmente en valores insignificantes.

Para proteger recuentos confidenciales, el **Mecanismo de Laplace** suma ruido estadístico proporcional a la sensibilidad del cálculo (el cambio máximo que un único individuo puede provocar en el total):

```python
import numpy as np

def contar_con_privacidad(conteo_real: int, epsilon: float = 0.5) -> float:
    """Añade ruido de Laplace para garantizar privacidad diferencial."""
    sensibilidad = 1.0  # Un único individuo modifica el recuento como máximo en 1
    escala = sensibilidad / epsilon
    ruido = np.random.laplace(loc=0.0, scale=escala)
    return conteo_real + ruido

# Ejemplo: 350 personas con una condición médica confidencial
recuento_protegido = contar_con_privacidad(conteo_real=350, epsilon=0.5)
```

### 3. Aprendizaje Federado (*FedAvg*)

En lugar de subir historiales o mensajes a un servidor central, el modelo viaja a los teléfonos u ordenadores locales. Cada equipo entrena la red con sus propios datos y devuelve únicamente las modificaciones de los pesos numéricos. El servidor central agrega estas mejoras mediante el algoritmo *FedAvg*:

```text
w_{t+1} = ∑ [ (n_k ÷ n) × w_{t+1}^k ]
```

Donde `w_{t+1}` representa el modelo global actualizado, `w_{t+1}^k` los pesos calculados por el participante `k`, y `n_k ÷ n` la proporción de datos aportada por ese nodo frente al total.

---

## 3. Dónde se usa hoy en la vida real

1. **Teclados inteligentes y dispositivos móviles:** Los sistemas de predicción de texto de Google (Android) y Apple (iOS) aprenden palabras nuevas mediante aprendizaje federado y privacidad diferencial local. Los mensajes personales nunca abandonan el teléfono.
2. **Medicina colaborativa internacional:** Hospitales de distintos países entrenan modelos conjuntos para detectar enfermedades raras en imágenes médicas sin transferir historiales de pacientes, cumpliendo en paralelo el RGPD europeo y la ley HIPAA estadounidense.
3. **Estadísticas oficiales de población:** La Oficina del Censo de Estados Unidos aplicó privacidad diferencial en el censo de 2020 para publicar informes detallados sin riesgo de que atacantes deduzcan ingresos o etnias de familias cruzando tablas públicas.
4. **Niveles de riesgo del EU AI Act:** El marco europeo estructura los sistemas en cuatro categorías:
   - *Inaceptable (prohibido):* Puntuación social ciudadana (*social scoring*) y vigilancia biométrica masiva en tiempo real en espacios públicos.
   - *Alto riesgo (empleo, banca, sanidad, justicia):* Exige auditorías de sesgo en los datos, documentación técnica y supervisión humana obligatoria.
   - *Transparencia específica:* Obligación de avisar al usuario si interactúa con un chatbot o consume imágenes generadas por IA (*deepfakes*).
   - *Modelos fundacionales (GPAI):* Sistemas con un gasto computacional acumulado superior a 10²⁵ FLOPs deben evaluar riesgos sistémicos y declarar obras protegidas por derechos de autor.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Mecanismo / Enfoque | Principales Ventajas | Limitaciones Técnicas | Riesgos Críticos |
| :--- | :--- | :--- | :--- |
| **Privacidad Diferencial** | Respaldo matemático demostrable frente a cualquier atacante informático. | Reduce la precisión si se exige un épsilon muy estricto (*trade-off* utilidad-privacidad). | El ruido puede borrar patrones en colectivos minoritarios con pocos registros. |
| **Aprendizaje Federado** | Los datos originales no salen del dispositivo o servidor del usuario. | Elevado consumo de batería y saturación de la red por rondas de sincronización. | Vulnerable a envenenamiento del modelo (*model poisoning*) e inversión de gradientes. |
| **Métricas de Equidad** | Detectan y mitigan sesgos históricos en contrataciones y créditos. | Los teoremas de imposibilidad impiden satisfacer todas las métricas al unísono. | Riesgo de discriminación inversa si el ajuste no se calibra con criterio sociológico. |
| **Regulación (EU AI Act)** | Proporciona certidumbre legal y defiende los derechos fundamentales. | Alto coste de cumplimiento para pequeñas empresas y riesgo de frenar la innovación. | Arbitraje regulatorio: traslado de centros de desarrollo a países sin leyes vinculantes. |

### El conflicto oculto entre privacidad y equidad

Añadir ruido estadístico para blindar la privacidad diferencial puede perjudicar sin querer a las minorías. Si una base médica tiene un 98 % de datos de un grupo y solo un 2 % de otro, el ruido afectará poco al grupo mayoritario, pero puede destruir la señal del grupo minoritario, multiplicando sus errores de diagnóstico. Por ello, ambas dimensiones deben auditarse de forma coordinada.

---

## 5. Temas relacionados

- **Machine Learning:** Fundamentos del entrenamiento estadístico sobre el que se imponen los límites de privacidad y justicia.
- **Deep Learning:** Redes neuronales de alta complejidad cuyo carácter opaco exige auditorías de sesgo periódicas.
- **Explicabilidad e Interpretabilidad (XAI):** Métodos como SHAP o LIME que permiten justificar ante los reguladores por qué un algoritmo tomó una decisión concreta.
- **Alineamiento y Seguridad de la IA:** Técnicas destinadas a asegurar que los modelos avanzados respeten los valores humanos y las normas éticas fijadas por la sociedad.
