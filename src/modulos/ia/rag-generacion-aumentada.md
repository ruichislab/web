# Generación Aumentada por Recuperación (RAG): Arquitectura, Búsqueda Híbrida y GraphRAG

La **Generación Aumentada por Recuperación** (*Retrieval-Augmented Generation* o **RAG**) es un paradigma arquitectónico que combina la fluidez generativa de los Modelos de Lenguaje Grande (LLMs) con sistemas deterministas de recuperación de información. En lugar de limitar la generación a los pesos sinápticos estáticos adquiridos en el preentrenamiento (memoria paramétrica), RAG dota al modelo de acceso en tiempo de inferencia a bases documentales externas (memoria no paramétrica). Este desacoplamiento entre razonamiento y almacenamiento fáctico reduce drásticamente las alucinaciones, habilita la trazabilidad mediante fuentes citables y permite actualizar el conocimiento institucional al instante sin los costos computacionales ni la latencia de reentrenar o ajustar (*fine-tuning*) una red neuronal.

---

## 1. Origen e Intuición Fundamental

Introducido formalmente por Lewis et al. (2020), RAG surgió para resolver dos deficiencias críticas de los LLMs: la obsolescencia temporal del conocimiento paramétrico y la generación estocástica de falsedades con alta convicción aparente (*alucinaciones*). 

La intuición subyacente se ilustra con la analogía de un examen académico:
* **LLM aislado (Memoria Paramétrica):** Rinde una prueba a "libro cerrado". Depende de recordar datos comprimidos en miles de millones de parámetros. Si el detalle es esquivo o reciente, el modelo tiende a rellenar los vacíos probabilísticos con patrones lingüísticos plausibles pero incorrectos.
* **Sistema RAG (Memoria No Paramétrica Aumentada):** Rinde el examen a "libro abierto". Ante una pregunta, primero consulta un catálogo de referencia, recupera los fragmentos exactos más relevantes y, tras examinarlos, redacta su respuesta sintetizando la evidencia documental.

Al condicionar la función de generación del LLM al contexto explícito proporcionado en la ventana de inferencia, las alucinaciones caen a mínimos operativos. Además, para incorporar descubrimientos recientes o revocar información obsoleta, basta con añadir o eliminar registros en la base de datos externa, eliminando la necesidad de costosos ciclos de entrenamiento.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

El flujo estándar de un sistema RAG avanzado de nivel de producción comprende cuatro fases fundamentales: particionamiento (*chunking*), recuperación híbrida (*sparse + dense*), reordenamiento (*reranking*) y modelado relacional global (*GraphRAG*).

```
[ Documentos ] ──► [ Chunking Semántico ] ──┬──► [ Índice BM25 (Léxico) ]
                                            └──► [ Índice Vectorial (Embeddings) ]
                                                            │
    [ Consulta ] ───────────────────────────────────────────┴──► [ Fusión RRF ]
                                                                      │
                                                                      ▼
  [ Respuesta ] ◄─── [ LLM Generador ] ◄─── [ Top Contexto ] ◄─── [ Cross-Encoder Reranker ]
```

### 2.1. Particionamiento Documental (Chunking)
Dado que los pasajes extensos diluyen la señal semántica en los vectores y desbordan el presupuesto de contexto, el documento se divide en unidades discretas:
* **Fijo con solapamiento:** Fragmentos de longitud $L$ con superposición $\Delta$ (e.g., 512 tokens con 10% de solapamiento) para preservar la continuidad en fronteras de corte.
* **Recursivo o sintáctico:** Segmenta respetando la jerarquía natural del documento (encabezados Markdown, párrafos, oraciones completas).
* **Jerárquico (Parent-Child):** Indexa fragmentos breves para maximizar la precisión de recuperación vectorial, pero entrega al LLM el bloque contenedor ("padre") más amplio para no cercenar el contexto analítico.

### 2.2. Búsqueda Híbrida: BM25 y Recuperación Densa
La coincidencia puramente vectorial a menudo falla frente a números de serie, términos jurídicos unívocos o identificadores alfanuméricos. La búsqueda híbrida fusiona dos dominios complementarios:

1. **Recuperación Léxica (BM25):** Evalúa la relevancia basada en la frecuencia de términos normalizada y la frecuencia inversa de documentos:
   $$\text{BM25}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
   donde $k_1$ regula la saturación de términos y $b$ penaliza la longitud del documento.

2. **Recuperación Densa (Embeddings):** Proyecta la consulta $q$ y los fragmentos $d$ en un espacio latente mediante codificadores bi-encoder, evaluando la cercanía semántica vía similitud coseno:
   $$S_{\text{densa}}(q, d) = \frac{E(q) \cdot E(d)}{\|E(q)\| \|E(d)\|}$$

3. **Reciprocal Rank Fusion (RRF):** Intercala las listas de candidatos sin requerir la normalización de escalas heterogéneas:
   $$\text{RRF\_Score}(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
   donde $r_m(d)$ es el rango ordinal del documento $d$ en el método $m$, y $k \approx 60$.

### 2.3. Reordenamiento Contextual (Reranking)
Los bi-encoders evalúan consulta y texto por separado. Para refinar el top-$K$ recuperado (ej. 50 pasajes), un **Cross-Encoder** procesa el par concatenado $[q; d]$ bajo capas de autoatención bidireccional completa:
$$S_{\text{rerank}}(q, d) = \text{Softmax}(\mathbf{W} \cdot \text{Transformer}([q; d]))$$
Esto captura dependencias semánticas finas, filtrando los 3 a 5 fragmentos decisivos para el prompt final.

### 2.4. GraphRAG: Recuperación Asistida por Grafos
El RAG vectorial ordinario fracasa en preguntas de síntesis global (e.g., *"¿Cuáles son las vulnerabilidades estructurales comunes citadas en las auditorías de 2024?"*). **GraphRAG** resuelve esto indexando el corpus como un grafo de conocimiento:
1. **Extracción:** Un LLM identifica entidades (nodos) y relaciones tipadas (aristas) en el texto.
2. **Detección Comunitaria:** Algoritmos como Leiden agrupan entidades densamente interconectadas en clústeres jerárquicos.
3. **Resúmenes Globales:** Se generan resúmenes estructurados por cada comunidad. En inferencia, el sistema puede sintetizar respuestas agregadas explorando los resúmenes de nivel superior (*Global Search*) o rastrear rutas de adyacencia directa (*Local Search*).

```python
def reciprocal_rank_fusion(dense_ranks: list[str], sparse_ranks: list[str], k: int = 60) -> list[tuple[str, float]]:
    """Fusiona rankings denso y disperso mediante RRF."""
    scores: dict[str, float] = {}
    for rank, doc_id in enumerate(dense_ranks):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    for rank, doc_id in enumerate(sparse_ranks):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    return sorted(scores.items(), key=lambda item: item[1], reverse=True)
```

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Soporte Técnico y Asistencia al Cliente:** Enlace directo de asistentes con repositorios vivos en Notion o Jira. Cuando se actualiza una política comercial, el modelo la adopta de inmediato sin reentrenamiento.
2. **Auditoría Legal y Cumplimiento Regulatorio:** Consulta sobre expedientes de miles de fojas, estatutos y jurisprudencia. RAG extrae los fundamentos normativos pertinentes y ofrece hipervínculos verificables al texto fuente.
3. **Medicina Basada en Evidencia:** Motores que indexan publicaciones clínicas de PubMed. El médico consulta interacciones farmacológicas obteniendo referencias primarias auditables, suprimiendo dosis ficticias.
4. **Inteligencia de Negocios Corporativa:** Implementación de GraphRAG sobre informes anuales y balances bursátiles para descubrir participaciones cruzadas y dependencias de suministro entre holdings multinacionales.

---

## 4. Ventajas, Limitaciones y Riesgos

### 4.1. Análisis Crítico
* **Ventajas:** Alta precisión fáctica, trazabilidad verificable mediante citas, aislamiento de datos sensibles mediante control de acceso por usuario (RBAC) y amortización económica frente al fine-tuning.
* **Limitaciones:** Latencia agregada (*Time-To-First-Token*) en llamadas a índices y rerankers; degradación de respuesta si la fase de recuperación inyecta fragmentos ruidosos (*lost in the middle*).
* **Riesgos:** Susceptibilidad a inyecciones indirectas de instrucciones (*indirect prompt injection*), donde atacantes incrustan directivas encubiertas en documentos indexados para sesgar la generación.

### 4.2. Tabla Comparativa de Enfoques

| Enfoque | Recuperación de Datos | Actualización de Hechos | Precisión en Palabras Clave | Síntesis Global del Corpus | Riesgo de Alucinación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RAG Vectorial Básico** | Vectores densos (kNN) | Instantánea (reindexación) | Moderada (sufre con siglas) | Muy baja (recupera fragmentos) | Moderado-Bajo |
| **RAG Híbrido + Rerank** | Denso + BM25 + Cross-Encoder | Instantánea (reindexación) | Excepcional | Moderada | Muy bajo |
| **GraphRAG** | Grafo + Resúmenes jerárquicos | Moderada (construye grafo) | Alta | Excepcional | Mínimo |
| **Fine-Tuning Puro** | Memoria paramétrica | Muy costosa (requiere reentrenar) | Baja-Moderada | Moderada | Alto |

---

## 5. Conceptos Relacionados

* **Bases de Datos Vectoriales e Índices HNSW:** Estructuras de grafos navegables en mundos pequeños para búsquedas de vecinos cercanos ultrarrápidas.
* **Modelos de Incrustación y Cross-Encoders:** Redes basadas en Transformers especializadas en mapeo latente y puntuación de relevancia cruzada.
* **Grafos de Conocimiento (Knowledge Graphs):** Representaciones en tripletas (sujeto-predicado-objeto) empleadas como base ontológica en GraphRAG.
* **Fine-Tuning con LoRA / QLoRA:** Técnicas complementarias orientadas a adaptar el tono y la estructura de salida del modelo, mientras RAG suministra los hechos.
