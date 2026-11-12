# Embeddings y Espacios Vectoriales Semánticos: Geometría de Alta Dimensión, Similitud y Búsqueda con HNSW

Un **embedding** (o incrustación vectorial) es una función matemática $f: \mathcal{X} \to \mathbb{R}^d$ que proyecta entidades discretas o multimodales —como palabras, documentos, imágenes o grafos— hacia vectores densos y continuos en un espacio de dimensión intermedia o alta ($d \in [128, 4096]$). La premisa central del espacio vectorial semántico es que la proximidad métrica y la orientación angular codifican afinidades conceptuales y funcionales. Al transformar símbolos aislados en coordenadas continuas, los modelos de aprendizaje automático pueden computar significado mediante álgebra lineal, sustentando la recuperación de información moderna y los modelos neuronales de lenguaje.

---

## 1. Origen e Intuición Fundamental

Tradicionalmente, el procesamiento del lenguaje natural representaba el vocabulario mediante esquemas *one-hot*, donde cada término era un vector disperso de dimensión igual al tamaño del léxico ($|V| \sim 10^5 - 10^7$). Bajo esta estructura, dos palabras cualesquiera $w_i, w_j$ resultaban ortogonales ($\langle \mathbf{w}_i, \mathbf{w}_j \rangle = 0$), imposibilitando modelar grados de sinonimia o similitud.

La superación de este límite se fundamenta en la **hipótesis distribucional** de la lingüística teórica (Firth, 1957): *"conocerás una palabra por las compañías que frecuenta"*. El significado se captura a partir de las regularidades estadísticas del contexto lingüístico.

### Codificación Geométrica en Alta Dimensión

Al situar conceptos en variedades continuas dentro de $\mathbb{R}^d$:
1. **Composicionalidad Vectorial:** Operaciones lineales simples descubren analogías semánticas mediante desplazamientos en el espacio:
   $$\vec{v}_{\text{reina}} \approx \vec{v}_{\text{rey}} - \vec{v}_{\text{hombre}} + \vec{v}_{\text{mujer}}$$
2. **Propiedades de la Alta Dimensión:** Por concentración de la medida, vectores generados al azar en $\mathbb{R}^d$ ($d \gg 100$) son casi con certeza ortogonales. De este modo, una separación angular pequeña ($\theta \ll 90^\circ$) representa una señal semántica real y no una coincidencia estocástica.
3. **Evolución Representacional:** El campo transitó desde representaciones estáticas (Word2Vec, GloVe), donde cada término tiene un vector fijo, hacia incrustaciones contextuales dinámicas mediante Transformers (BERT, bi-encoders modernos), donde el vector se computa en función del contexto circundante.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### 2.1 Similitud del Coseno y Normalización

La distancia euclidiana directa es sensible a la magnitud del vector. Por ello, la métrica estándar para medir concordancia semántica entre dos vectores $\mathbf{u}, \mathbf{v} \in \mathbb{R}^d$ es la **similitud del coseno**:

$$\text{sim}_{\cos}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2} = \frac{\sum_{i=1}^d u_i v_i}{\sqrt{\sum_{i=1}^d u_i^2} \sqrt{\sum_{i=1}^d v_i^2}}$$

Cuando los vectores están normalizados bajo la norma euclidiana $L_2$ ($\|\mathbf{u}\|_2 = \|\mathbf{v}\|_2 = 1$), la similitud del coseno equivale directamente al producto escalar:

$$\text{sim}_{\cos}(\mathbf{u}, \mathbf{v}) = \langle \mathbf{u}, \mathbf{v} \rangle$$

La distancia euclidiana cuadrática entre vectores unitarios se relaciona analíticamente como:

$$\|\mathbf{u} - \mathbf{v}\|_2^2 = 2 - 2 \langle \mathbf{u}, \mathbf{v} \rangle$$

### 2.2 Optimización con Pérdida Contrastiva (InfoNCE)

Los modelos de incrustación densa se entrenan frecuentemente con encoders siameses y la función InfoNCE. Para una consulta $\mathbf{q}$, un documento relevante $\mathbf{d}^+$ y $K$ negativos $\mathbf{d}^-_j$, la pérdida minimiza la distancia al objetivo positivo:

$$\mathcal{L}_{\text{InfoNCE}} = -\log \frac{\exp\left(\frac{\langle \mathbf{q}, \mathbf{d}^+ \rangle}{\tau}\right)}{\exp\left(\frac{\langle \mathbf{q}, \mathbf{d}^+ \rangle}{\tau}\right) + \sum_{j=1}^K \exp\left(\frac{\langle \mathbf{q}, \mathbf{d}^-_j \rangle}{\tau}\right)}$$

donde $\tau > 0$ es un hiperparámetro de temperatura que modula la selectividad sobre los ejemplos negativos difíciles.

### 2.3 Búsqueda Vectorial con HNSW

La búsqueda exacta de vecinos más cercanos ($k$-NN) tiene costo $\mathcal{O}(N \cdot d)$, inviable para colecciones con millones de elementos. El algoritmo **HNSW** (*Hierarchical Navigable Small World*) organiza el espacio vectorial en una estructura multicapa de grafos geométricos:

1. **Capas Superiores:** Pocos nodos con aristas de largo alcance métrico para exploración global rápida (*coarse routing*).
2. **Descenso Guiado:** La búsqueda avanza de forma ávida hacia el mínimo local relativo y transfiere el punto de entrada a la capa inferior.
3. **Capa Base ($l_0$):** Contiene todos los vectores indexados con conexiones locales densas, acotada por una cola de prioridad de tamaño $efSearch$.

```
Capa 2 (Saltos de largo alcance):    [A] --------------------> [B]
                                      ↓                         ↓
Capa 1 (Densidad intermedia):        [A] --------> [C] ------> [B]
                                      ↓             ↓           ↓
Capa 0 (Vértices completos, k-NN):   [A]-[D]-[E]--[C]-[F]-----[B]-[G]
```

### 2.4 Implementación en Python: Normalización y Búsqueda

```python
import numpy as np

def buscar_similitud_coseno(consulta: np.ndarray, corpus: np.ndarray, k: int = 2):
    """Calcula los k elementos más similares mediante producto escalar unitario."""
    # Normalización L2 unitaria
    q_norm = consulta / np.linalg.norm(consulta)
    c_norm = corpus / np.linalg.norm(corpus, axis=1, keepdims=True)
    
    # Producto escalar sobre vectores unitarios
    similitudes = np.dot(c_norm, q_norm)
    indices = np.argsort(similitudes)[::-1][:k]
    
    return [(int(i), float(similitudes[i])) for i in indices]

# Demostración conceptual
if __name__ == "__main__":
    docs = np.array([
        [0.82, 0.12, 0.48, 0.22],  # Doc 0: Inteligencia Artificial y LLMs
        [0.79, 0.18, 0.52, 0.15],  # Doc 1: Aprendizaje Automático
        [0.05, 0.94, 0.12, 0.85],  # Doc 2: Gastronomía Italiana
    ])
    query = np.array([0.88, 0.10, 0.44, 0.18])  # "Modelos neuronales"
    
    for doc_id, puntaje in buscar_similitud_coseno(query, docs, k=2):
        print(f"Documento {doc_id} -> Similitud Coseno: {puntaje:.4f}")
```

---

## 3. Casos de Uso y Aplicaciones Reales

* **Generación Aumentada por Recuperación (RAG):** Motores vectoriales (como Milvus, Qdrant o pgvector) indexan fragmentos documentales con HNSW. Al recibir una consulta, recuperan los pasajes más afines semánticamente y los incorporan en el contexto del LLM para fundamentar sus respuestas en fuentes factuales.
* **Búsqueda Semántica Multimodal:** Modelos como CLIP proyectan imágenes y descripciones de texto en un espacio común, permitiendo recuperar imágenes mediante lenguaje natural libre.
* **Sistemas de Recomendación:** Modelos de dos torres (*two-tower architectures*) mapean perfiles de usuario y catálogo a embeddings compartidos, permitiendo recomendaciones ultrarrápidas en tiempo real.
* **Detección de Anomalías:** Registros de red o transacciones se codifican en vectores continuos; desviaciones de distancia respecto al centroide de comportamiento habitual disparan alertas preventivas de seguridad.

---

## 4. Ventajas, Limitaciones y Riesgos

### Comparativa de Métodos de Indexación Vectorial

| Método | Principio Operativo | Latencia de Consulta | Recall ($k$-NN) | Consumo de RAM | Escalabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Flat (Exacto)** | Comparación exhaustiva $\mathcal{O}(N \cdot d)$ | Alta | 100% | Mínimo | Baja ($N > 10^5$) |
| **IVF** | Partición en celdas Voronoi | Media | Media-Alta | Bajo | Alta ($N \sim 10^7$) |
| **PQ** | Cuantización subvectorial | Baja | Media | Muy bajo | Masiva ($N > 10^8$) |
| **HNSW** | Grafos multicapa navegables | Ultrabaja ($\mathcal{O}(\log N)$) | Muy alta (>95%) | Alto (grafo en memoria) | Alta ($N \sim 10^7$) |

### Limitaciones Principales

1. **Maldición de la Dimensionalidad:** A dimensionalidades elevadas, el ratio de distancias relativas entre puntos tiende a estrecharse, exigiendo que los datos descansen en subvariedades de menor dimensión intrínseca.
2. **Anisotropía y Efecto Cono:** Algunos modelos de lenguaje agrupan sus representaciones en un cono hipergeométrico estrecho, lo que incrementa artificialmente la similitud del coseno basal.
3. **Huella de Memoria de HNSW:** Almacenar aristas de grafos en RAM impone costos de infraestructura considerables para corpus masivos, mitigados con técnicas híbridas como HNSW-PQ.
4. **Reproducción de Sesgos:** Las incrustaciones pueden heredar y amplificar asociaciones estereotípicas presentes en los datos de preentrenamiento.

---

## 5. Conceptos Relacionados

* **Retrieval-Augmented Generation (RAG):** Arquitectura que integra bases vectoriales densas con generadores neuronales para reducir alucinaciones factuales.
* **Modelos de Lenguaje Grande (LLMs) y Mecanismos de Atención:** Redes neuronales profundas que producen embeddings contextuales dinámicos.
* **Reducción de Dimensionalidad (t-SNE, UMAP, PCA):** Métodos analíticos para proyectar espacios vectoriales complejos hacia 2D o 3D para su inspección visual.
* **Aprendizaje Contrastivo:** Enfoque metodológico para entrenar codificadores representacionales discriminando pares afines frente a contrastes.
