# Ética, Gobernanza y Privacidad en Inteligencia Artificial

La convergencia entre ética algorítmica, privacidad computacional y gobernanza regulatoria define el estándar contemporáneo para el ciclo de vida de la Inteligencia Artificial (IA). Lejos de concebirse como limitaciones accesorias, los principios de equidad estadística (*fairness*), privacidad formal (*differential privacy*), descentralización de datos (*federated learning*), trazabilidad de propiedad intelectual y cumplimiento legal vinculante (como el Reglamento Europeo de IA o *EU AI Act*) constituyen propiedades intrínsecas del diseño de sistemas fiables. Su propósito es garantizar que los modelos matemáticos no perpetúen sesgos históricos, no vulneren el secreto individual ni operen al margen del marco democrático internacional.

## 1. Origen e Intuición Fundamental

Durante las primeras fases de adopción del aprendizaje automático, el éxito de un modelo se juzgó exclusivamente mediante métricas escalares agregadas como la precisión (*accuracy*), el error cuadrático medio ($MSE$) o el $AUC$. Este enfoque asumía que optimizar el ajuste empírico producía automáticamente decisiones justas y seguras.

No obstante, los datos de entrenamiento reflejan las desigualdades estructurales y sesgos cognitivos presentes en su recolección:
1. **Sesgo histórico y de muestreo**: Los datos reflejan distribuciones del pasado donde determinados colectivos sufrieron exclusión o trato discriminatorio sistemático (p. ej., en concesión de créditos o evaluaciones penales).
2. **Correlaciones espurias y variables proxy**: Aunque se eliminen identificadores directos (género o etnia), las redes neuronales profundas correlacionan variables aparentemente neutrales (como el código postal o historial de consumo) reconstruyendo dichos atributos sensibles.

Simultáneamente, la concentración masiva de datos en servidores corporativos aumentó la vulnerabilidad frente a ataques de inferencia y extracción de información (*membership inference*). En 2006, Cynthia Dwork formalizó la **Privacidad Diferencial**, garantizando límites matemáticos demostrables a la información que una salida algorítmica puede revelar sobre un individuo. Posteriormente, en 2017, McMahan et al. (Google) introdujeron el **Aprendizaje Federado**, desacoplando el entrenamiento del modelo de la necesidad de centralizar los datos en bruto.

El auge de los Modelos de Lenguaje de Gran Escala (LLM) y la IA generativa intensificó las controversias sobre derechos de autor, catalizando la transición desde guías éticas voluntarias hacia regulaciones vinculantes y sancionadoras a nivel global.

## 2. Arquitectura, Mecánica o Formulación Matemática

El tratamiento formal de estos problemas se articula en tres dominios complementarios: auditoría de equidad, mecanismos de privacidad formal y protocolos de optimización distribuida.

### Métricas de Equidad Algorítmica (*Fairness Metrics*)

Sean $X \in \mathbb{R}^d$ el vector de características, $Y \in \{0, 1\}$ la etiqueta real, $\hat{Y} \in \{0, 1\}$ la predicción del modelo y $A \in \{0, 1\}$ un atributo protegido sensible.

1. **Paridad Demográfica (*Demographic Parity*)**: La tasa de selección debe ser independiente del grupo protegido:
   $$P(\hat{Y} = 1 \mid A = 0) = P(\hat{Y} = 1 \mid A = 1)$$
2. **Igualdad de Oportunidades (*Equal Opportunity*)**: La tasa de verdaderos positivos debe ser idéntica entre ambos colectivos:
   $$P(\hat{Y} = 1 \mid A = 0, Y = 1) = P(\hat{Y} = 1 \mid A = 1, Y = 1)$$

### Privacidad Diferencial ($\epsilon, \delta$-DP)

Un algoritmo estocástico $\mathcal{M}$ satisface $(\epsilon, \delta)$-Privacidad Diferencial si para cualesquiera dos bases de datos vecinas $D$ y $D'$ que difieren en un único registro ($\|D - D'\|_1 = 1$), y para todo conjunto de resultados $S \subseteq \text{Range}(\mathcal{M})$:

$$P(\mathcal{M}(D) \in S) \le e^{\epsilon} P(\mathcal{M}(D') \in S) + \delta$$

Donde $\epsilon > 0$ representa el presupuesto de privacidad (a menor valor, mayor confidencialidad) y $\delta \ge 0$ la tolerancia residual de fallo.

Para una función determinista $f(D) \in \mathbb{R}^k$ con sensibilidad $L_1$ definida como $\Delta f = \max_{D, D'} \|f(D) - f(D')\|_1$, el **Mecanismo de Laplace** perturba la salida sumando ruido calibrado:

$$\mathcal{M}_{Lap}(D) = f(D) + \text{Lap}\left(0, \frac{\Delta f}{\epsilon}\right)$$

```python
import numpy as np

def mecanismo_laplace(valor_real: float, sensibilidad: float, epsilon: float) -> float:
    """Añade ruido Laplaciano calibrado para garantizar epsilon-Privacidad Diferencial."""
    escala = sensibilidad / epsilon
    ruido = np.random.laplace(loc=0.0, scale=escala)
    return valor_real + ruido

# Ejemplo: Conteo agregado de diagnósticos confidenciales (sensibilidad = 1)
total_real = 250
conteo_privado = mecanismo_laplace(total_real, sensibilidad=1.0, epsilon=0.5)
```

### Aprendizaje Federado (*Federated Averaging - FedAvg*)

En lugar de transferir conjuntos de datos privados $D_k$ a un servidor central, $K$ nodos locales calculan gradientes en sus propios dispositivos. En cada ronda de comunicación $t$, el orquestador central difunde los pesos globales $w_t$; los clientes seleccionados actualizan localmente sus modelos $w_{t+1}^k$ minimizando su pérdida empírica, y el servidor consolida la agregación ponderada:

$$w_{t+1} = \sum_{k=1}^K \frac{n_k}{n} w_{t+1}^k \quad \text{con} \quad n = \sum_{k=1}^K n_k$$

### Propiedad Intelectual y Trazabilidad

Para responder a reclamaciones por derechos de autor en IA generativa se emplean:
- **Funciones de Influencia (*Influence Functions*)**: Calculadas a través de la matriz Hessiana inversa ($H^{-1}_{\theta}$), cuantifican la contribución exacta de un ejemplo de entrenamiento específico sobre las predicciones finales.
- **Marcado de Agua Estadístico (*Watermarking*)**: Modifica de forma imperceptible la distribución de *logits* en LLMs para favorecer una lista restringida de tokens, verificable mediante pruebas z-score.

## 3. Casos de Uso y Aplicaciones Reales

- **Consorcios Hospitalarios y Diagnóstico Colaborativo**: Redes sanitarias internacionales entrenan modelos de detección oncológica mediante Federated Learning combinado con Privacidad Diferencial (DP-FedAvg). Las historias clínicas nunca salen del hospital, asegurando el cumplimiento simultáneo de RGPD (Europa) y HIPAA (EE. UU.).
- **Scoring Crediticio y Finanzas Responsables**: Entidades bancarias aplican penalizaciones de equidad algorítmica para evitar el descarte sistemático de colectivos desfavorecidos, auditando las decisiones mediante SHAP (*Shapley Additive Explanations*).
- **Procesos de Selección en RRHH**: Filtros automáticos de talento integran entrenamiento adversarial para eliminar correlaciones entre cualificaciones técnicas y variables demográficas.
- **Implementación del EU AI Act**: El marco europeo instaura un estándar mundial basado en cuatro niveles de riesgo:
  1. *Inaceptable* (prohibido): Puntuación social ciudadana, biometría en tiempo real en espacios públicos.
  2. *Alto Riesgo* (salud, infraestructuras, empleo, justicia): Exige gobernanza estricta de datos, trazabilidad técnica, explicabilidad y supervisión humana (*human-in-the-loop*).
  3. *Modelos Fundacionales / GPAI*: Obliga a revelar resúmenes de datos con derechos de autor y evaluar riesgos sistémicos para arquitecturas con cómputo superior a $10^{25}$ FLOPs.

## 4. Ventajas, Limitaciones y Riesgos

| Enfoque / Mecanismo | Principales Ventajas | Limitaciones Técnicas | Riesgos Críticos |
| :--- | :--- | :--- | :--- |
| **Privacidad Diferencial (DP)** | Garantías matemáticas inviolables ante cualquier atacante arbitrario. | Deterioro de la exactitud predictiva (*trade-off* privacidad-utilidad); ajuste delicado de $\epsilon$. | Riesgo residual por fuga de metadatos o parametrización deficiente de $\epsilon$. |
| **Aprendizaje Federado (FL)** | Privacidad local de datos crudos; reducción sustancial del tráfico de red. | Cuello de botella en ancho de banda; divergencia por datos no-IID (heterogéneos). | Ataques de envenenamiento de modelo (*model poisoning*) e inversión de gradientes. |
| **Métricas de Equidad (Fairness)** | Mitigación formal de discriminación y cumplimiento de estándares éticos. | Teoremas de incompatibilidad: no es factible satisfacer todas las métricas a la vez. | Reducción de la precisión global o aparición de discriminación inversa. |
| **EU AI Act y Marcos Legales** | Certeza jurídica armonizada y defensa efectiva de derechos fundamentales. | Alto coste de conformidad para startups; riesgo de desfase ante la innovación. | Deslocalización de desarrollos (*regulatory arbitrage*) hacia jurisdicciones laxas. |

### El Dilema Privacidad-Equidad-Rendimiento

Cualquier intervención técnica introduce compromisos estructurales. Inyectar ruido para salvaguardar la privacidad diferencial puede degradar desproporcionadamente la precisión en subgrupos minoritarios con pocas muestras, amplificando indirectamente el sesgo si no se aplican algoritmos de compensación específicos.

## 5. Conceptos Relacionados

- **Machine Learning**: Fundamentos del entrenamiento estadístico sobre el cual operan las restricciones de sesgo y privacidad.
- **Deep Learning**: Redes neuronales de alta complejidad paramétrica cuya condición de caja negra exige auditorías regulatorias rigurosas.
- **Explicabilidad e Interpretabilidad (XAI)**: Metodologías (LIME, SHAP) requeridas legalmente para desentrañar el razonamiento interno de los modelos de alto riesgo.
- **Ciberseguridad en IA**: Estudio de ataques de extracción, inversión y manipulación adversarial que complementa la defensa de la privacidad diferencial.
