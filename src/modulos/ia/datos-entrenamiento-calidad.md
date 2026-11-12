# Datos de Entrenamiento: Curación, Limpieza y Calidad en Inteligencia Artificial

Un automóvil de carreras con el motor más sofisticado del mundo se averiará a los pocos minutos si su depósito se llena con combustible mezclado con lodo y agua. En el aprendizaje automático sucede exactamente lo mismo: una red neuronal de miles de millones de parámetros entrenada con textos incoherentes, copias redundantes o datos con errores solo producirá respuestas absurdas, sesgadas y poco fiables.

La informática acuñó hace décadas el principio *garbage in, garbage out* (si entra basura, sale basura), anticipado ya en 1864 por Charles Babbage al advertir que ninguna máquina analítica puede arrojar respuestas acertadas a partir de premisas erróneas. Hoy, la curación, el filtrado y la procedencia de los datos marcan la diferencia entre un modelo torpe y un sistema preciso.

> **En pocas palabras:** Los datos de entrenamiento son el material del que aprende un modelo; si contienen errores, textos basura o repeticiones masivas, la inteligencia artificial reproducirá esos mismos fallos sin importar la potencia de sus algoritmos.

---

## 1. De dónde viene y cómo se entiende fácil

Pensemos en cómo aprende a leer un niño. Si en su casa solo encuentra folletos publicitarios rotos, carteles con erratas y cientos de copias del mismo volante comercial, su vocabulario será pobre y repetitivo. Para que desarrolle un lenguaje rico, sus educadores seleccionan libros bien redactados, cuentos variados y enciclopedias contrastadas.

En los inicios del aprendizaje automático moderno, los conjuntos de datos eran pequeños y se elaboraban a mano. En 1998, Yann LeCun y su equipo presentaron MNIST, una colección de 70.000 dígitos manuscritos procedentes de formularios censales y códigos postales. En 2009, Fei-Fei Li presentó ImageNet en la Universidad de Stanford: catorce millones de imágenes etiquetadas manualmente mediante microtareas de personas en todo el mundo. Ambos hitos demostraron que los saltos en inteligencia artificial dependían del orden y la calidad de los ejemplos disponibles.

Con la explosión del aprendizaje profundo a partir de 2017, la necesidad de datos creció exponencialmente. Los laboratorios recurrieron a volcados masivos de la web pública, como Common Crawl (fundado en 2007). Sin embargo, internet contiene toneladas de páginas automatizadas para publicidad, foros con lenguaje de odio y copias idénticas del mismo texto. Esta realidad impulsó el movimiento de *Data-Centric AI* (IA centrada en los datos), promovido por Andrew Ng hacia 2021: resulta más eficaz depurar a fondo los datos de entrenamiento que intentar compensar sus defectos modificando una y otra vez la arquitectura del modelo.

---

## 2. Cómo funciona por dentro

Transformar terabytes de páginas web en un conjunto de entrenamiento útil requiere varias etapas de depuración:

### Extracción y filtrado de calidad
El texto se extrae de páginas HTML o documentos PDF eliminando menús, avisos de cookies y pies de página (*boilerplate*). Luego se normalizan las codificaciones a UTF-8 para evitar caracteres corruptos (*mojibake*). A continuación, se aplican dos tipos de filtros:
1. **Reglas heurísticas:** Se descartan documentos con menos de 50 palabras, páginas con alta proporción de símbolos respecto a palabras reales o listas repetitivas pensadas para engañar a buscadores.
2. **Clasificadores estadísticos:** Modelos ligeros de texto como FastText (creado por Meta en 2016) se entrenan con fuentes de alta calidad (Wikipedia, libros editados) para calcular si un texto web arbitrario tiene un nivel de redacción similar.

### Deduplicación masiva
Internet contiene miles de copias del mismo aviso legal, boletín de prensa o plantilla comercial. Si una red lee el mismo texto miles de veces, memoriza esas oraciones palabra por palabra en lugar de generalizar conceptos, lo que eleva el sobreajuste y el coste de cómputo.

Para detectar duplicados a gran escala se utiliza el algoritmo MinHash junto con LSH (*Locality-Sensitive Hashing*), ideado por Andrei Broder en 1997. Cada documento se descompone en secuencias cortas y se calcula la similitud de Jaccard:

```
Similitud Jaccard(A, B) = |A ∩ B| ÷ |A ∪ B|
```

Donde `|A ∩ B|` representa las secuencias comunes entre ambos textos y `|A ∪ B|` el total de secuencias únicas sumadas. Si la coincidencia supera un umbral fijado (por ejemplo, 0,80), el documento redundante se elimina. En 2021, Katherine Lee demostró que deduplicar los datos de preentrenamiento reduce notablemente la memorización accidental sin perjudicar el rendimiento del sistema.

### Anonimización de privacidad
Para proteger la privacidad de los usuarios, se detectan y reemplazan números de teléfono, direcciones particulares, identificadores fiscales y correos electrónicos:

```python
import re
import hashlib

def filtrar_documento(texto: str, min_palabras: int = 50) -> dict | None:
    # 1. Normalizar espacios
    texto_limpio = re.sub(r"\s+", " ", texto).strip()
    palabras = texto_limpio.split()
    if len(palabras) < min_palabras:
        return None
    
    # 2. Anonimizar correos electrónicos
    texto_anonimo = re.sub(r"[\w\.-]+@[\w\.-]+\.\w+", "[CORREO]", texto_limpio)
    
    # 3. Huella SHA-256 para detectar duplicados idénticos
    huella = hashlib.sha256(texto_anonimo.lower().encode("utf-8")).hexdigest()
    return {"texto": texto_anonimo, "huella": huella, "conteo": len(palabras)}
```

### Datos sintéticos y colapso de modelos
Como el texto humano público de alta calidad es finito, los investigadores generan datos sintéticos: explicaciones paso a paso de problemas matemáticos o código generadas por modelos avanzados. En 2023, Microsoft demostró con su trabajo *Phi-1* que entrenar un modelo pequeño con ejercicios sintéticos de estilo libro de texto superaba a modelos mayores alimentados con datos web genéricos.

Sin embargo, los datos sintéticos conllevan un riesgo demostrado: el **colapso del modelo** (*Model Collapse*). En 2024, un estudio publicado en *Nature* por Ilia Shumailov y su equipo demostró que cuando varias generaciones de modelos se entrenan con textos producidos por modelos previos, las colas de la distribución estadística desaparecen. El sistema olvida los hechos infrecuentes y el lenguaje generado se vuelve repetitivo, uniforme y sin sentido.

---

## 3. Dónde se usa hoy en la vida real

- **Modelos abiertos de referencia:** Iniciativas como FineWeb (creado por Hugging Face en 2024 con 15 billones de tokens) procesan petabytes de la web para proporcionar a investigadores conjuntos de datos limpios, libres de textos duplicados y de baja calidad.
- **Conducción autónoma:** Empresas de vehículos autónomos filtran miles de horas de grabaciones en autopistas despejadas y seleccionan solo eventos infrecuentes (lluvia densa, cruce repentino de animales) para evitar que la red aprenda solo la rutina sencilla.
- **Medicina y salud:** Los registros hospitalarios se someten a estrictas limpiezas bajo el RGPD europeo y la ley HIPAA estadounidense, eliminando nombres de pacientes pero preservando patrones clínicos clave para el diagnóstico temprano.
- **Sistemas contra el fraude bancario:** Como el fraude representa menos del 0,1% de los movimientos, los bancos balancean sus datos mediante curación rigurosa para evitar que los algoritmos ignoren los casos raros.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Dimensión de curación | Ventaja comprobada | Límite práctico | Riesgo principal |
| :--- | :--- | :--- | :--- |
| **Filtrado heurístico** | Descarta rápido grandes volúmenes de texto basura | Reglas fijas que pueden eliminar lenguaje informal útil | Exclusión involuntaria de dialectos minoritarios |
| **Deduplicación MinHash** | Reduce la memorización forzada y ahorra cómputo | Requiere grandes estructuras de índices en memoria | Eliminación accidental de textos breves legítimos |
| **Datos sintéticos** | Genera ejemplos en tareas donde faltan datos reales | Carece de la variedad y matices del lenguaje vivo | Colapso del modelo por retroalimentación recursiva |
| **Anonimización** | Cumple con leyes de privacidad y evita filtraciones | Difícil de aplicar en menciones indirectas de personas | Fuga involuntaria de información personal memorizada |

### Riesgos operativos y legales
- **Agotamiento del contenido humano:** Estudios de Epoch AI sugieren que el inventario accesible de texto escrito por personas podría agotarse antes del final de esta década, haciendo indispensable una curación mucho más eficiente.
- **Propiedad intelectual y derechos de autor:** El uso sin autorización de obras protegidas para preentrenamiento enfrenta demandas judiciales internacionales, lo que obliga a las empresas a negociar licencias y respetar mecanismos de exclusión (*opt-out*).
- **Regulación estricta:** El Reglamento Europeo de Inteligencia Artificial (aprobado en 2024) impone obligaciones de trazabilidad y gobernanza de datos para modelos de uso general y sistemas de alto riesgo.

---

## 5. Temas relacionados

- **Alineamiento y Seguridad en IA:** Métodos como RLHF para orientar las respuestas del modelo hacia criterios de utilidad y veracidad tras el preentrenamiento.
- **Fine-Tuning y LoRA:** Ajuste de modelos generales a tareas específicas mediante lotes reducidos de datos de alta especialización.
- **Evaluación y Benchmarks:** Mediciones objetivas para cuantificar si la limpieza de datos se traduce en un rendimiento superior en pruebas de razonamiento.
- **Ética, Privacidad y Regulación:** Normativas globales sobre derechos de autor, protección de datos personales y transparencia algorítmica.
