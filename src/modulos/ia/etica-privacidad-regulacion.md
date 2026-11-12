# Ética, Gobernanza y Privacidad en Inteligencia Artificial

La intersección entre ética, privacidad computacional y marcos regulatorios define el estándar contemporáneo para el diseño, entrenamiento y despliegue de sistemas de Inteligencia Artificial (IA). Lejos de concebirse como restricciones externas o accesorias, los principios de equidad estadística (*fairness*), privacidad formal (*differential privacy*), descentralización colaborativa (*federated learning*), trazabilidad de derechos de autor y cumplimiento normativo vinculante (como el Reglamento Europeo de IA o *EU AI Act*) constituyen propiedades intrínsecas de la ingeniería de software confiable. Su propósito es garantizar que los algoritmos de optimización matemática no perpetúen asimetrías históricas, no vulneren el secreto individual de las observaciones ni operen al margen del marco legal democrático internacional.

## 1. Origen e Intuición Fundamental

Durante las primeras fases de adopción del aprendizaje automático comercial, el rendimiento de los modelos se evaluó casi exclusivamente mediante métricas escalares agregadas como la precisión (*accuracy*), el error cuadrático medio ($MSE$) o el área bajo la curva ROC ($AUC$). Este paradigma tecnocéntrico asumía que la maximización del ajuste empírico equivalía a una toma de decisiones óptima.

Sin embargo, los datos de entrenamiento reflejan inexorablemente las dinámicas sociales, desigualdades estructurales y sesgos cognitivos presentes en su recolección:
1. **Sesgo histórico y de muestreo**: Los conjuntos de datos representan distribuciones pasadas donde ciertos colectivos estuvieron subrepresentados o sujetos a decisiones discriminatorias sistemáticas (por ejemplo, en concesión de créditos o evaluaciones penitenciarias).
2. **Correlaciones espurias y variables latentes**: Aunque se excluyan atributos protegidos directos (como género, etnia o código postal), redes neuronales profundas con millones de parámetros son capaces de reconstruir variables protegidas a través de combinaciones no lineales de características aparentemente inocuas.

En paralelo, la recopilación centralizada masiva requerida para entrenar arquitecturas profundas generó vulnerabilidades severas frente a ciberataques de reconstrucción de datos (*data extraction* y *membership inference*). En 2006, Cynthia Dwork formalizó la **Privacidad Diferencial**, estableciendo un límite matemático riguroso a la información filtrada por cualquier cómputo estadístico. Años después, en 2017, investigadores de Google introdujeron el **Aprendizaje Federado**, desacoplando el entrenamiento del modelo de la necesidad de transferir datos confidenciales a un servidor central.

Finalmente, el auge de los Modelos de Lenguaje de Gran Escala (LLM) y la IA generativa visibilizó la apropiación indebida de propiedad intelectual y obras con derechos de autor, catalizando la transición desde autorregulaciones éticas voluntarias hacia regulaciones vinculantes y punitivas de alcance supranacional.

## 2. Arquitectura, Mecánica o Formulación Matemática

El tratamiento formal de estos desafíos se fundamenta en marcos matemáticos específicos orientados a auditar sesgos, aislar la privacidad y entrenar modelos distribuidos.

### Métricas de Equidad Algorítmica (*Fairness Metrics*)

Sean $X \in \mathbb{R}^d$ el vector de características de entrada, $Y \in \{0, 1\}$ la etiqueta real, $\hat{Y} \in \{0, 1\}$ la predicción del modelo y $A \in \{0, 1\}$ un atributo protegido binario. Dos de los criterios formales más extendidos son:

1. **Paridad Demográfica (*Demographic Parity*)**: Exige que la tasa de selección sea idéntica e independiente del grupo demográfico:
   $$P(\hat{Y} = 1 \mid A = 0) = P(\hat{Y} = 1 \mid A = 1)$$
2. **Igualdad de Oportunidades (*Equal Opportunity*)**: Garantiza que la tasa de verdaderos positivos sea equivalente entre grupos con respecto a la clase favorable:
   $$P(\hat{Y} = 1 \mid A = 0, Y = 1) = P(\hat{Y} = 1 \mid A = 1, Y = 1)$$

### Privacidad Diferencial ($\epsilon, \delta$-DP)

Un algoritmo aleatorio $\mathcal{M}$ proporciona $(\epsilon, \delta)$-Privacidad Diferencial si para cualesquiera dos conjuntos de datos vecinos $D$ y $D'$ que difieran en un único individuo ($\|D - D'\|_1 = 1$), y para cualquier subconjunto de salidas $S \subseteq \text{Range}(\mathcal{M})$:

$$P(\mathcal{M}(D) \in S) \le e^{\epsilon} P(\mathcal{M}(D') \in S) + \delta$$

Donde $\epsilon > 0$ es el presupuesto de privacidad (a menor $\epsilon$, mayor garantía de anonimato) y $\delta \ge 0$ representa la probabilidad de fallo catastrófico en la cota de privacidad.

Para una consulta determinista $f(D) \in \mathbb{R}^k$ con sensibilidad $L_1$ definida como $\Delta_1 f = \max_{D, D'} \|f(D) - f(D')\|_1$, el **Mecanismo de Laplace** introduce perturbación aditiva:

$$\mathcal{M}_{Lap}(D) = f(D) + \text{Lap}\left(0, \frac{\Delta_1 f}{\epsilon}\right)$$

```python
import numpy as np

def mecanismo_laplace(valor_real: float, sensibilidad: float, epsilon: float) -> float:
    """Añade ruido Laplaciano calibrado para garantizar epsilon-Privacidad Diferencial."""
    escala = sensibilidad / epsilon
    ruido = np.random.laplace(loc=0.0, scale=escala)
    return valor_real + ruido

# Ejemplo: Conteo de pacientes con patología rara (sensibilidad = 1)
conteo_real = 142
epsilon_presupuesto = 0.5
conteo_privado = mecanismo_laplace(conteo_real, sensibilidad=1.0, epsilon=epsilon_presupuesto)
```

### Aprendizaje Federado (*Federated Averaging - FedAvg*)

En lugar de almacenar $\bigcup_{k=1}^K D_k$ en un clúster central, $K$ dispositivos locales computan gradientes o actualizaciones de pesos sobre sus particiones privadas. En cada ronda de comunicación $t$, el servidor central distribuye el modelo global $w_t$; cada cliente seleccionado calcula localmente $w_{t+1}^k$ minimizando su función de pérdida empírica $F_k(w)$, y el servidor ejecuta la agregación ponderada por volumen muestral:

$$w_{t+1} = \sum_{k=1}^K \frac{n_k}{n} w_{t+1}^k \quad \text{donde} \quad n = \sum_{k=1}^K n_k$$

### Trazabilidad y Propiedad Intelectual

La protección de derechos de autor en modelos fundacionales recurre a dos mecanismos técnicos prioritarios:
- **Funciones de Influencia (*Influence Functions*)**: Basadas en la matriz Hessiana inversa del modelo $H^{-1}$, aproximan el impacto que un documento o imagen de entrenamiento específica $z$ tuvo sobre los parámetros finales $\theta$.
- **Marcas de Agua Estadísticas (*Watermarking*)**: En modelos de lenguaje, manipulan de forma pseudoaleatoria los *logits* durante la inferencia para inducir una lista verde (*green-list*) de tokens detectables estadísticamente mediante pruebas de hipótesis z-score.

## 3. Casos de Uso y Aplicaciones Reales

- **Consorcios Hospitalarios y Biomedicina**: Redes hospitalarias internacionales colaboran en el entrenamiento de detectores de patologías oncológicas mediante Aprendizaje Federado acoplado con Privacidad Diferencial (DP-FedAvg). Las historias clínicas nunca abandonan los cortafuegos locales, cumpliendo simultáneamente normativas como HIPAA (EE. UU.) y RGPD (Europa).
- **Finanzas y Puntuación Crediticia (*Credit Scoring*)**: Entidades bancarias aplican restricciones de optimización con paridad demográfica en modelos XGBoost y redes neuronales para evitar denegaciones discriminatorias a colectivos vulnerables, auditando la importancia de variables mediante Shapley Additive Explanations (SHAP).
- **Recursos Humanos y Selección Automatizada**: Plataformas de cribado de currículos implementan algoritmos de regularización adversarial para desacoplar las representaciones latentes de los candidatos de atributos protegidos como edad y género.
- **Implementación del EU AI Act**: El marco regulatorio europeo impone clasificaciones vinculantes por nivel de riesgo:
  1. *Riesgo Inaceptable* (prohibición taxativa): Puntuación social (*social scoring*), biometría predictiva masiva en espacios públicos.
  2. *Alto Riesgo* (salud, educación, empleo, justicia): Obligación estricta de auditorías de calidad de datos, documentación técnica, trazabilidad algorítmica y supervisión humana activa.
  3. *Riesgo Específico y GPAI* (modelos fundacionales como GPT o Claude): Respeto de derechos de autor bajo la Directiva Europea, resúmenes transparentes de datos de entrenamiento y evaluación de riesgos sistémicos para arquitecturas con cómputo superior a $10^{25}$ FLOPs.

## 4. Ventajas, Limitaciones y Riesgos

| Mecanismo / Enfoque | Principales Ventajas | Limitaciones Técnicas | Riesgos Críticos |
| :--- | :--- | :--- | :--- |
| **Privacidad Diferencial (DP)** | Garantías matemáticas demostrables; independencia de supuestos sobre atacantes. | Deterioro de la precisión (*trade-off* utilidad/privacidad); selección compleja de $\epsilon$. | Falsa sensación de seguridad si $\epsilon$ es laxo o hay filtración en metadatos. |
| **Aprendizaje Federado (FL)** | Los datos crudos permanecen descentralizados; menor latencia y coste de transferencia. | Sobrecarga de comunicación en red; heterogeneidad estadística de datos (no-IID). | Ataques de inversión de gradiente y envenenamiento del modelo global (*data poisoning*). |
| **Métricas de Equidad (Fairness)** | Detección formal y mitigación de sesgos históricos en inferencia. | Imposibilidad matemática de satisfacer múltiples definiciones de equidad a la vez. | Riesgo de discriminación inversa o pérdida de utilidad predictiva global. |
| **EU AI Act y Gobernanza Legal** | Marco vinculante unificado; protección de derechos fundamentales y consumidores. | Carga burocrática elevada para pymes; desfase ante la velocidad de innovación. | Fragmentación regulatoria internacional (*efecto Bruselas* vs. desregulación). |

### El Trade-off Fundamental: Privacidad, Equidad y Utilidad

Existe un compromiso matemático insoslayable entre privacidad, equidad y rendimiento predictivo. La imposición de ruido diferencial o restricciones de paridad estadística reduce la información utilizable por la función objetivo, lo que puede degradar la exactitud en subgrupos minoritarios vulnerables si los datos no son tratados con calibración estocástica especializada.

## 5. Conceptos Relacionados

- **Machine Learning**: Paradigma general de ajuste de modelos paramétricos mediante funciones de pérdida y descenso de gradiente.
- **Deep Learning**: Redes neuronales profundas que exacerban la necesidad de auditoría ética debido a su naturaleza de caja negra y enorme ingesta de datos.
- **Explicabilidad e Interpretabilidad (XAI)**: Técnicas de post-procesamiento (SHAP, LIME, Integrated Gradients) imprescindibles para certificar decisiones ante reguladores.
- **Ciberseguridad y Ataques Adversarios**: Vectores de amenaza que comprometen la integridad de modelos federados y la confidencialidad de los datos de entrenamiento.
