# Embeddings y Espacios Vectoriales: El Mapa Matemático del Significado

Las computadoras no comprenden el significado de las palabras ni de las imágenes; para un procesador, todo se reduce a cadenas de ceros y unos. Si queremos que una máquina entienda que "médico" y "doctor" expresan la misma idea, o que buscar "reparar un grifo" se vincula con "fontanería", debemos traducir esos conceptos a coordenadas numéricas comparables. A esa representación se le denomina incrustación o *embedding*.

> **En pocas palabras:** Un embedding es una lista de números que resume el significado de un dato, situándolo en un mapa matemático donde los conceptos parecidos quedan juntos y los diferentes se distancian.

---

## 1. De dónde viene y cómo se entiende fácil

Antes de los embeddings modernos, la informática trataba las palabras como etiquetas aisladas mediante la codificación *one-hot*. Si un vocabulario tenía 50.000 palabras, cada término se guardaba en una lista de 50.000 casillas llena de ceros, con un único "1" en la posición de ese vocablo. Con esa técnica, la distancia matemática entre "perro" y "gato" era idéntica a la que había entre "perro" y "submarino": cero coincidencia computable.

Para resolver este límite, los investigadores recurrieron al principio del lingüista británico John Rupert Firth en 1957: *"Conocerás a una palabra por las compañías que frecuenta"*. En cualquier texto, términos como "perro", "cachorro" y "mascota" conviven junto a palabras similares ("ladrar", "pasear", "veterinario"). El contexto compartido define el significado.

Una analogía sencilla es un club de lectura. Si en vez de registrar a los socios por su nombre los evalúas con notas del 1 al 10 en tres temas —ciencia ficción, cocina e historia—, cada socio ocupa una posición física en una sala tridimensional. Dos amantes de la cocina y la historia conversarán cerca, mientras que un lector exclusivo de ciencia ficción se situará en el extremo opuesto. 

En inteligencia artificial ocurre lo mismo, pero en lugar de 3 ejes, el espacio suele tener entre 256 y 1.536 dimensiones abstractas.

En 2013, Tomáš Mikolov y su equipo en Google publicaron Word2Vec, demostrando que estos vectores resolvían analogías mediante álgebra básica:

vector("rey") - vector("hombre") + vector("mujer") ≈ vector("reina")

Con la llegada de la arquitectura Transformer en 2017 y modelos como BERT en 2018, los embeddings pasaron de ser estáticos a ser contextuales: la palabra "banco" recibe coordenadas distintas si acompaña a "dinero" o a "parque".

---

## 2. Cómo funciona por dentro

El sistema articula tres componentes: cálculo de cercanía, optimización del mapa y búsqueda acelerada.

### Similitud del coseno
Medir distancias en línea recta suele fallar en textos, pues un documento largo acumula valores mayores solo por su extensión. Por ello se emplea la **similitud del coseno**, que calcula el ángulo entre dos vectores desde el origen:

```
                  A · B                ∑ (A[i] × B[i])
similitud = ----------------- = -----------------------------
            ||A||₂ × ||B||₂     √(∑ (A[i])²) × √(∑ (B[i])²)
```

Si dos flechas apuntan en idéntica dirección, el ángulo es 0° y su coseno es 1 (afinidad total). Si son perpendiculares, el resultado es 0. Al normalizar los vectores a longitud unitaria, la similitud equivale al producto escalar directo.

### Entrenamiento contrastivo
Los modelos se entrenan enfrentando ejemplos positivos y negativos con funciones como InfoNCE (Aaron van den Oord, 2018). Ante una pregunta, el algoritmo ajusta sus parámetros para acercar la respuesta correcta y repeler pasajes no relacionados, estructurando el espacio semántico.

### Búsqueda rápida con HNSW
Comparar una consulta contra millones de vectores uno a uno colapsaría el servicio. Por ello se emplea **HNSW** (*Hierarchical Navigable Small World*, Malkov y Yashunin, 2016), una estructura multicapa inspirada en las redes de transporte:

```
Capa 2 (Autopistas veloces):   [A] ------------------------> [B]
                                │                             │
Capa 1 (Vías comarcales):      [A] ---------> [C] ----------> [B]
                                │              │              │
Capa 0 (Calles locales):       [A]──[D]──[E]──[C]──[F]───────[B]──[G]
```

La búsqueda inicia en la capa superior con saltos amplios y desciende hacia capas más densas hasta hallar los vecinos más cercanos en milisegundos.

```python
import numpy as np

def buscar(consulta, documentos, top_k=2):
    q = consulta / np.linalg.norm(consulta)
    docs = documentos / np.linalg.norm(documentos, axis=1, keepdims=True)
    puntuaciones = np.dot(docs, q)
    mejores = np.argsort(puntuaciones)[::-1][:top_k]
    return [(idx, puntuaciones[idx]) for idx in mejores]

corpus = np.array([
    [0.85, 0.12, 0.44, 0.20],  # Doc 0: Redes neuronales
    [0.80, 0.15, 0.50, 0.18],  # Doc 1: Aprendizaje automático
    [0.05, 0.95, 0.10, 0.88],  # Doc 2: Recetas de cocina
])
query = np.array([0.88, 0.11, 0.45, 0.19])  # "Inteligencia artificial"

for doc_id, puntaje in buscar(query, corpus):
    print(f"Doc {doc_id} -> Afinidad: {puntaje:.4f}")
```

---

## 3. Dónde se usa hoy en la vida real

* **Generación Aumentada por Recuperación (RAG):** Los asistentes corporativos convierten manuales y políticas en embeddings para recuperar el fragmento idóneo antes de contestar, reduciendo alucinaciones.
* **Comercio electrónico:** Al buscar "zapatillas impermeables", el sistema localiza calzado de montaña aunque la ficha comercial no use esas palabras exactas.
* **Sistemas de recomendación:** Spotify o Netflix sitúan usuarios y contenidos en el mismo mapa para sugerir canciones o películas según su cercanía vectorial.
* **Búsqueda multimodal:** Con modelos como CLIP (OpenAI, 2021), fotos y textos conviven en un espacio compartido, permitiendo buscar imágenes mediante lenguaje natural.
* **Prevención de fraudes:** Operaciones inusuales con tarjeta generan vectores apartados del patrón habitual del cliente, activando alertas preventivas.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Método | Principio operativo | Velocidad | Precisión (*Recall*) | Memoria RAM | Escala recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Exacto (Flat)** | Compara la consulta con todos los vectores | Lenta | 100% | Mínima | Menos de 100.000 |
| **IVF** | Agrupa en celdas y revisa solo las más próximas | Rápida | Media-Alta (85%-95%) | Bajo | De 100.000 a 10 millones |
| **HNSW** | Grafos jerárquicos de largo y corto alcance | Ultrarrápida | Muy alta (95%-99%) | Alto (grafo en RAM) | De 1 a 50 millones |
| **PQ** | Comprime vectores dividiéndolos en subvectores | Ultrarrápida | Moderada (75%-90%) | Muy bajo (ahorro 90%) | Cientos de millones |

### Limitaciones y riesgos principales

* **Efecto cono (anisotropía):** En varios modelos, los vectores se concentran en un cono estrecho, arrojando similitudes altas entre frases inconexas.
* **Maldición de la dimensión:** En espacios de cientos de dimensiones, las distancias entre puntos tienden a uniformarse, exigiendo calibraciones finas.
* **Costes de infraestructura:** Mantener grafos HNSW en memoria RAM encarece los servidores a medida que el catálogo crece a decenas de millones.
* **Propagación de sesgos:** Al alimentarse de la web, los embeddings pueden heredar y amplificar prejuicios sociales y laborales.

---

## 5. Temas relacionados

* **Generación Aumentada por Recuperación (RAG):** Enlace de bases vectoriales con modelos de lenguaje para asegurar respuestas verídicas.
* **Modelos de Lenguaje Grande (LLMs) y Atención:** Redes profundas que extraen embeddings dinámicos según el contexto.
* **Reducción de Dimensionalidad (t-SNE, UMAP, PCA):** Métodos matemáticos para proyectar vectores a planos 2D o 3D y visualizarlos.
* **Bases de Datos Vectoriales:** Motores especializados (Milvus, Qdrant, Chroma, pgvector) para indexar y consultar embeddings a escala.
