# Embeddings y Espacios Vectoriales Semánticos: Geometría de Alta Dimensión, Similitud y Búsqueda con HNSW

Un **embedding** (o incrustación vectorial) es una función $f: \mathcal{X} \to \mathbb{R}^d$ que mapea entidades discretas o multimodales —como palabras, fragmentos de texto, imágenes o nodos de un grafo— hacia vectores densos y continuos en un espacio de dimensión intermedia o alta ($d \in [128, 4096]$). La premisa central del espacio vectorial semántico es que la proximidad métrica y las relaciones de orientación angular reflejan similitud conceptual, taxonómica o funcional. Al transformar símbolos aislados en coordenadas geométricas, el aprendizaje automático capacita a los modelos para operar algebraicamente sobre el significado, fundamentando sistemas modernos de recuperación de información, inferencia asociativa y arquitecturas de lenguaje neuronal.

---

## 1. Origen e Intuición Fundamental

Históricamente, el procesamiento de lenguaje natural representaba el léxico mediante esquemas *one-hot*, donde cada término constituía un vector disperso de dimensión igual a la totalidad del vocabulario ($|V| \sim 10^5 - 10^7$). Dicho diseño imponía una limitación estructural: cualesquiera dos palabras $w_i, w_j$ eran matemáticamente ortogonales ($\langle \mathbf{w}_i, \mathbf{w}_j \rangle = 0$), suprimiendo nociones de sinonimia o afinidad semántica.

La solución emergió de la **hipótesis distribucional** formulada en lingüística teórica (Firth, 1957): *"conocerás una palabra por las compañías que frecuenta"*. El significado no es un rasgo atómico, sino una función de las distribuciones contextuales compartidas.

### Geometría de Alta Dimensión y Codificación Semántica

Al proyectar conceptos hacia variedades densas en $\mathbb{R}^d$:
1. **Composicionalidad y Paralelismo Vectorial:** Desplazamientos lineales capturan relaciones semánticas y analogías:
   $$\vec{v}_{\text{reina}} \approx \vec{v}_{\text{rey}} - \vec{v}_{\text{hombre}} + \vec{v}_{\text{mujer}}$$
2. **Propiedades de la Alta Dimensión:** Por concentración de la medida, vectores generados al azar en $\mathbb{R}^d$ ($d \gg 100$) son cuasi-ortogonales con probabilidad cercana a 1. De este modo, una baja separación angular ($\theta \ll 90^\circ$) representa una señal semántica genuina y no una coincidencia estadística.
3. **De Vectores Estáticos a Contextuales:** La disciplina progresó desde proyecciones estáticas (Word2Vec, GloVe), donde un lema poseía un vector invariante, hacia representaciones profundas contextuales generadas por Transformers (BERT, RoBERTa, bi-encoders contemporáneos), donde el vector se computa dinámicamente según el entorno sintáctico.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

### 2.1 Métrica de Similitud del Coseno

La distancia euclidiana directa es sensible a variaciones en la norma o longitud de los vectores. Por ello, la métrica estándar para medir la concordancia semántica entre dos representaciones $\mathbf{u}, \mathbf{v} \in \mathbb{R}^d$ es la **similitud del coseno**, correspondiente al coseno del ángulo diedro que las separa:

$$\text{sim}_{\cos}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2} = \frac{\sum_{i=1}^d u_i v_i}{\sqrt{\sum_{i=1}^d u_i^2} \sqrt{\sum_{i=1}^d v_i^2}}$$

Si los vectores están normalizados bajo la norma euclidiana $L_2$ ($\|\mathbf{u}\|_2 = \|\mathbf{v}\|_2 = 1$), la similitud del coseno colapsa en el producto escalar estándar:

$$\text{sim}_{\cos}(\mathbf{u}, \mathbf{v}) = \langle \mathbf{u}, \mathbf{v} \rangle$$

La distancia euclidiana al cuadrado entre dos vectores normalizados se deduce directamente como:

$$\|\mathbf{u} - \mathbf{v}\|_2^2 = 2 - 2 \langle \mathbf{u}, \mathbf{v} \rangle$$

### 2.2 Optimización Contrastiva (Función InfoNCE)

Los codificadores densos se optimizan habitualmente mediante aprendizaje contrastivo siamés. Dada una consulta $\mathbf{q}$, un documento relevante $\mathbf{d}^+$ y $K$ negativos $\mathbf{d}^-_j$, la pérdida InfoNCE minimiza la distancia al positivo mientras maximiza la separación de los contrastes:

$$\mathcal{L}_{\text{InfoNCE}} = -\log \frac{\exp\left(\frac{\langle \mathbf{q}, \mathbf{d}^+ \rangle}{\tau}\right)}{\exp\left(\frac{\langle \mathbf{q}, \mathbf{d}^+ \rangle}{\tau}\right) + \sum_{j=1}^K \exp\left(\frac{\langle \mathbf{q}, \mathbf{d}^-_j \rangle}{\tau}\right)}$$

donde $\tau > 0$ es un hiperparámetro de temperatura que controla la selectividad de los gradientes sobre ejemplos difíciles (*hard negatives*).

### 2.3 Indexación Aproximada con HNSW

La búsqueda exacta de vecinos cercanos ($k$-NN) tiene costo temporal $\mathcal{O}(N \cdot d)$, inviable para colecciones masivas. El algoritmo **HNSW** (*Hierarchical Navigable Small World*) estructura los vectores en un grafo multicapa navegable:

1. **Jerarquía Escalonada:** Las capas superiores contienen pocos nodos con aristas extensas que permiten explorar regiones lejanas rápidamente.
2. **Descenso Guiado:** La búsqueda ejecuta un ruteo ávido (*greedy routing*) en la capa más alta hasta un mínimo local y desciende a la capa inferior como punto de inicio.
3. **Capa Base ($l_0$):** Contiene la totalidad de los datos interconectados con enlaces locales densos, afinando la búsqueda con una cola de prioridad acotada por el hiperparámetro $efSearch$.

```
Capa 2 (Saltos globales largos):     [A] --------------------> [B]
                                      ↓                         ↓
Capa 1 (Densidad media):             [A] --------> [C] ------> [B]
                                      ↓             ↓           ↓
Capa 0 (Vértices completos, $k$-NN): [A]-[D]-[E]--[C]-[F]-----[B]-[G]
```

### 2.4 Implementación en Python: Normalización y Búsqueda Vectorial

```python
import numpy as np

def busqueda_similitud_coseno(vector_consulta: np.ndarray, base_vectores: np.ndarray, top_k: int = 3):
    """Calcula similitud coseno vía producto punto en vectores normalizados."""
    # Normalización L2 unitaria
    q_norm = vector_consulta / np.linalg.norm(vector_consulta)
    docs_norm = base_vectores / np.linalg.norm(base_vectores, axis=1, keepdims=True)
    
    # Producto interno equivale a similitud coseno
    similitudes = np.dot(docs_norm, q_norm)
    mejores_indices = np.argsort(similitudes)[::-1][:top_k]
    
    return [(int(idx), float(similitudes[idx])) for idx in mejores_indices]

# Demostración sintética
if __name__ == "__main__":
    base = np.array([
        [0.82, 0.12, 0.48, 0.22],  # Doc 0: Redes neuronales y LLMs
        [0.79, 0.18, 0.52, 0.15],  # Doc 1: Algoritmos de deep learning
        [0.05, 0.94, 0.12, 0.85],  # Doc 2: Recetas de cocina italiana
    ])
    consulta = np.array([0.88, 0.10, 0.44, 0.18])  # "Modelos conexionistas"
    
    for idx, puntaje in busqueda_similitud_coseno(consulta, base, top_k=2):
        print(f"Documento #{idx} - Coseno: {puntaje:.4f}")
```

---

## 3. Casos de Uso y Aplicaciones Reales

* **Generación Aumentada por Recuperación (RAG):** Las bases de datos vectoriales (como Milvus, Qdrant o pgvector) almacenan fragmentos documentales tokenizados e indexados con HNSW. Al recibir una pregunta, el motor halla los pasajes más afines semánticamente y los inyecta en la ventana del LLM para fundamentar la respuesta objetivamente.
* **Búsqueda Semántica Multimodal:** Con modelos alineados tipo CLIP o SigLIP, imágenes y textos residen en el mismo hiperespacio, habilitando consultas en lenguaje natural directo sobre repositorios gráficos o de vídeo.
* **Sistemas de Recomendación Industrial:** Arquitecturas de doble torre (*two-tower models*) calculan el embedding de intereses del usuario y contrastan en tiempo real contra millones de artículos en catálogo.
* **Detección de Fraude e Intrusiones:** Secuencias de transacciones bancarias o registros de red se proyectan en el espacio latente; aquellas instancias que exceden un radio umbral $\epsilon$ respecto a la distribución habitual activan alertas automáticas.

---

## 4. Ventajas, Limitaciones y Riesgos

### Comparativa de Métodos de Indexación Vectorial

| Estrategia de Índice | Principio de Búsqueda | Complejidad de Consulta | Recuperación (*Recall*) | Consumo de RAM |
| :--- | :--- | :--- | :--- | :--- |
| **Flat (Fuerza Bruta)** | Escaneo exhaustivo total | $\mathcal{O}(N \cdot d)$ | 100% (Exacto) | Mínimo |
| **IVF (Inverted File)** | Partición en celdas Voronoi | $\mathcal{O}(N_{\text{probe}} \cdot d)$ | Media-Alta | Bajo |
| **PQ (Product Quantization)** | Cuantización subvectorial | $\mathcal{O}(N \cdot \text{LUT})$ | Media | Muy bajo (comprimido) |
| **HNSW** | Grafos de mundos pequeños | $\mathcal{O}(\log N)$ | Muy alta (>95%) | Alto (grafo en memoria) |

### Limitaciones y Consideraciones Críticas

1. **Maldición de la Dimensionalidad:** A medida que $d$ crece, las distancias entre pares de puntos tienden a homogeneizarse si los datos carecen de una estructura sobre una subvariedad (*manifold*) de menor dimensión intrínseca.
2. **Efecto Cono y Anisotropía:** En ciertos modelos de lenguaje autoregresivos, los vectores no se dispersan uniformemente sobre la hiperesfera, sino que se concentran en un cono estrecho, distorsionando la fidelidad de la similitud del coseno.
3. **Huella de Memoria de HNSW:** Mantener las listas de adyacencia de grafos densos en memoria RAM impone costos de infraestructura elevados, impulsando el uso de variantes híbridas combinadas con cuantización escalar (SQ8).
4. **Persistencia de Sesgos Sociales:** Los embeddings absorben correlaciones estadísticas presentes en el corpus de entrenamiento, reflejando sesgos históricos o estereotipos demográficos en la proximidad vectorial de profesiones y atributos.

---

## 5. Conceptos Relacionados

* **Retrieval-Augmented Generation (RAG):** Metodología que vincula almacenes vectoriales externos con modelos generativos para enriquecer dinámicamente su conocimiento fáctico.
* **Modelos de Lenguaje Grande (LLMs) y Mecanismos de Atención:** Arquitecturas neuronales que derivan y transforman representaciones densas contextuales mediante atención ponderada.
* **Reducción de Dimensionalidad (t-SNE, UMAP, PCA):** Técnicas matemáticas de preservación topológica empleadas para proyectar variedades de alta dimensión a 2D o 3D con fines de visualización.
* **Aprendizaje Contrastivo:** Marco de entrenamiento supervisado y autosupervisado centrado en discriminar y agrupar representaciones afines en el espacio latente.
