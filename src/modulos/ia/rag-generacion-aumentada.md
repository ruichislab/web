# RAG: Generación Aumentada por Recuperación

Un modelo de lenguaje grande (LLM, por sus siglas en inglés) redacta con notable fluidez y razona sobre problemas complejos, pero su conocimiento fáctico queda congelado el día en que termina su entrenamiento. Si una persona le pregunta por las ventas del último trimestre de una empresa, una directiva médica aprobada ayer o un manual confidencial, el modelo no tiene forma de saberlo: en el mejor de los casos admitirá su ignorancia; en el peor, inventará una respuesta convincente pero falsa (lo que en inteligencia artificial se conoce como alucinación).

La Generación Aumentada por Recuperación (conocida universalmente por su sigla en inglés RAG, *Retrieval-Augmented Generation*) resuelve este problema uniendo dos piezas: un motor de búsqueda documental y un modelo generativo. En vez de exigirle al modelo que memorice toda la información en sus parámetros internos, el sistema busca los pasajes pertinentes en una base de datos externa y se los entrega como material de lectura antes de redactar la respuesta.

> **En pocas palabras:** RAG equivale a permitir que un estudiante consulte apuntes y libros actualizados durante un examen en lugar de obligarlo a responder todo de memoria.

---

## 1. De dónde viene y cómo se entiende fácil

El concepto de RAG fue presentado formalmente a finales de 2020 por Patrick Lewis y su equipo en Facebook AI Research (FAIR), junto con el University College London y la Universidad de Nueva York, en el artículo de investigación *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. Hasta ese momento, para incorporar información nueva a un modelo de lenguaje se recurría a dos caminos costosos: reentrenar la red desde cero o aplicarle un ajuste fino (*fine-tuning*). Ambos métodos exigían semanas de cómputo y corrían el riesgo de provocar *olvido catastrófico*, donde el modelo pierde destrezas previas al sobreescribir sus parámetros.

Para entender la diferencia intuitiva, imaginemos a dos médicos en una guardia de hospital:
- **El médico que confía solo en su memoria:** Se graduó hace tres años y atiende basándose únicamente en lo que recuerda de sus clases universitarias. Si aparece un fármaco nuevo o una directiva aprobada la semana pasada, intentará deducir una solución con lo que sabe, con el riesgo evidente de equivocarse o prescribir una dosis imprecisa.
- **El médico asistido por RAG:** Cuenta con la misma formación y capacidad de razonamiento, pero ante un caso clínico difícil abre al instante las guías actualizadas del hospital, revisa la ficha del paciente y, con la evidencia en mano, prescribe el tratamiento exacto.

RAG desacopla con claridad el razonamiento lingüístico (a cargo del LLM) del almacenamiento de los hechos (en una base de datos externa). Si una ley cambia, un producto se descontinúa o un empleado se incorpora al equipo, no hace falta reentrenar el modelo: basta con actualizar el archivo correspondiente en el almacén documental.

---

## 2. Cómo funciona por dentro

Un sistema RAG en producción procesa cada consulta mediante un canal de cuatro fases consecutivas:

```text
[ Documentos fuente ] ──► [ Segmentación (Chunking) ]
                                    │
          ┌─────────────────────────┴────────────────────────┐
          ▼                                                  ▼
   [ Índice BM25 (Léxico) ]                       [ Índice Vectorial (Embeddings) ]
          │                                                  │
          └─────────────────────────┬────────────────────────┘
                                    ▼
                       [ Fusión de Rangos (RRF) ]
                                    │
                                    ▼
                      [ Reordenador (Cross-Encoder) ]
                                    │ (Top 3-5 fragmentos)
                                    ▼
                         [ LLM Generador ] ──► [ Respuesta con citas ]
```

### Paso 1: Segmentación documental (Chunking)
Un manual extenso no puede enviarse entero al buscador ni a la ventana de contexto del modelo sin diluir los datos críticos. El texto se divide en bloques manejables (habitualmente de 200 a 500 palabras). Para asegurar que ninguna idea quede cortada a la mitad, se aplica un solapamiento del 10% al 20% entre bloques contiguos.

### Paso 2: Búsqueda híbrida (BM25 + Embeddings)
La búsqueda semántica tradicional transforma el texto en vectores numéricos (*embeddings*) para medir afinidad conceptual:

```text
Similitud coseno = (vector_A · vector_B) ÷ (||vector_A|| × ||vector_B||)
```

Esto permite relacionar "dolor de cabeza" con "cefalea", pero falla al buscar códigos de error, números de contrato o nombres propios poco comunes. Por ello, los sistemas modernos combinan vectores con el algoritmo léxico BM25, desarrollado por Stephen Robertson y Karen Spärck Jones en los años 90. BM25 premia la coincidencia exacta de términos clave ponderando la frecuencia de las palabras y la extensión del texto:

```text
Puntaje BM25 = ∑ [ IDF(palabra_i) × (frecuencia × (k1 + 1)) ÷ (frecuencia + k1 × (1 - b + b × (longitud_doc ÷ longitud_promedio))) ]
```

Para fusionar ambas listas sin que las diferencias de escala distorsionen la selección, se utiliza la Fusión por Rangos Recíprocos (RRF, introducida por Cormack, Clarke y Büttcher en 2009):

```python
def fusion_rrf(ranking_denso: list[str], ranking_lexico: list[str], k: int = 60) -> list[tuple[str, float]]:
    """Combina listas densas y léxicas sumando el inverso de sus posiciones relativas."""
    puntajes: dict[str, float] = {}
    for pos, doc_id in enumerate(ranking_denso):
        puntajes[doc_id] = puntajes.get(doc_id, 0.0) + 1.0 / (k + pos + 1)
    for pos, doc_id in enumerate(ranking_lexico):
        puntajes[doc_id] = puntajes.get(doc_id, 0.0) + 1.0 / (k + pos + 1)
    return sorted(puntajes.items(), key=lambda elem: elem[1], reverse=True)
```

### Paso 3: Reordenamiento contextual (Reranking)
Los modelos bi-encoder generan vectores separados para la consulta y los documentos muy rápido, pero sacrifican sutilezas sintácticas. Un modelo clasificador cruzado (*Cross-Encoder*) toma los 30 o 50 mejores pasajes y evalúa la consulta y el fragmento juntos en una sola pasada de atención profunda, filtrando los 3 a 5 fragmentos más determinantes para el prompt final.

### Paso 4: De fragmentos aislados a redes con GraphRAG
Cuando la consulta exige sintetizar un archivo completo (por ejemplo: *"¿Cuáles son las vulnerabilidades recurrentes en las auditorías de los últimos tres años?"*), el RAG tradicional falla porque solo extrae fragmentos sueltos. En 2024, Microsoft Research presentó **GraphRAG**: extrae entidades y relaciones para construir un grafo de conocimiento, agrupa las entidades en comunidades temáticas mediante el algoritmo Leiden y genera resúmenes jerárquicos. De este modo, el sistema responde tanto preguntas puntuales de detalle como consultas de síntesis global.

---

## 3. Dónde se usa hoy en la vida real

- **Soporte técnico y atención al cliente:** Asistentes conectados a repositorios vivos en Notion o Jira. Si una política comercial cambia hoy, el sistema responde con la nueva directiva de inmediato sin reentrenar.
- **Auditoría jurídica y fiscal:** Despachos legales que analizan contratos, sentencias y códigos procesales. El sistema destaca la cláusula específica, compara antecedentes y cita el folio y párrafo original exacto.
- **Medicina basada en evidencia:** Plataformas clínicas que indexan publicaciones de PubMed y vademécums. El personal médico consulta interacciones farmacológicas y recibe recomendaciones respaldadas por bibliografía primaria auditable.
- **Ingeniería de software:** Asistentes de desarrollo que indexan repositorios privados y especificaciones de arquitectura para guiar al equipo con código y convenciones reales de su propia organización.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Criterio | RAG Híbrido + Reordenador | GraphRAG | Ajuste Fino (*Fine-Tuning*) | LLM Aislado |
| :--- | :--- | :--- | :--- | :--- |
| **Actualización de datos** | Instantánea (añadir o quitar archivos) | Rápida (recalcular grafo) | Muy costosa y lenta | Imposible sin entrenar |
| **Trazabilidad y citas** | Exactas (enlace al fragmento original) | Altas (citas a entidades y resúmenes) | Nula (caja negra paramétrica) | Nula (suele inventar fuentes) |
| **Precisión en términos exactos**| Sobresaliente (gracias a BM25) | Alta (nodos léxicos) | Regular | Baja |
| **Síntesis global del corpus** | Limitada (recupera fragmentos sueltos) | Sobresaliente (resúmenes jerárquicos) | Regular | Regular |
| **Riesgo de alucinación** | Muy bajo | Mínimo | Moderado a alto | Alto |

### Limitaciones y riesgos prácticos:
- **Pérdida en el medio (*Lost in the Middle*):** Si el recuperador introduce fragmentos irrelevantes o contradictorios, el modelo puede pasar por alto el dato clave si queda situado en el centro de un contexto extenso.
- **Latencia acumulada:** Consultar índices, calcular similitudes y reordenar candidatos añade milisegundos valiosos antes de emitir la primera palabra (*Time-to-First-Token*).
- **Inyección indirecta de instrucciones:** Si un atacante introduce texto malicioso en un documento indexado (como una directiva oculta para revelar secretos), el recuperador podría enviarlo al modelo y alterar su comportamiento.

---

## 5. Temas relacionados

- **Bases de datos vectoriales:** Motores optimizados para almacenar y consultar vectores mediante algoritmos de grafos navegables como HNSW.
- **Incrustaciones (*embeddings*) y Cross-Encoders:** Redes basadas en Transformers especializadas en mapeo semántico y puntuación de relevancia cruzada.
- **Grafos de conocimiento:** Estructuras formadas por nodos (conceptos) y aristas (relaciones), base operativa de GraphRAG.
- **Ajuste fino con LoRA / QLoRA:** Técnicas complementarias para adaptar el tono o formato de salida, mientras RAG suministra los hechos verificables.
