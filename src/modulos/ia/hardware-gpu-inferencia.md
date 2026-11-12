# Hardware de IA e inferencia eficiente: cómo ejecutar modelos a escala

Entrenar un modelo de lenguaje masivo como ChatGPT o Claude exige semanas de cálculo para aprender patrones a partir de billones de palabras. Pero cuando ese entrenamiento concluye, comienza el reto operativo: la inferencia. La inferencia es el proceso en el que el modelo ya entrenado atiende la consulta de un usuario y calcula la respuesta palabra a palabra (token por token). Al procesar millones de consultas simultáneas, el consumo eléctrico y la saturación de los servidores se disparan. La inferencia eficiente reúne las técnicas de microarquitectura y software que permiten a estos modelos responder en milisegundos con menor memoria y consumo energético.

> **En pocas palabras:** La inferencia eficiente combina procesadores especializados y compresión matemática para que los modelos de inteligencia artificial respondan rápido sin colapsar los centros de datos ni disparar la factura eléctrica.

## 1. De dónde viene y cómo se entiende fácil

El cuello de botella de la inferencia se comprende con una analogía en una cocina:

Imagina un cocinero hiperrápido picando ingredientes en su mesa de trabajo. Si tiene los alimentos a mano, prepara platos al instante. Pero si para cada rodaja debe cruzar una nave de cincuenta metros, abrir una cámara frigorífica, coger una pieza y volver, su velocidad real ya no depende de lo rápido que mueva el cuchillo, sino del tiempo perdido yendo a la despensa.

En computación, este fenómeno se describe con el **Modelo Roofline** (Williams, Waterman y Patterson, UC Berkeley 2009). Todo procesador tiene dos techos físicos:

1. **Límite de cómputo (*compute-bound*):** Los núcleos calculan a máxima capacidad con datos ya cargados en sus registros. Su techo lo marca la cantidad de operaciones por segundo (FLOP/s).
2. **Límite de memoria (*memory-bound*):** Los núcleos pasan casi todo el tiempo desocupados esperando a que los datos viajen desde la memoria principal a través del bus de comunicación.

La inferencia de modelos de lenguaje opera en dos etapas:

- **Fase de lectura (*prefill*):** Procesa la pregunta del usuario en paralelo. Al recibir todas las palabras juntas, satura la capacidad matemática del procesador (*compute-bound*).
- **Fase de generación (*decode*):** Genera la respuesta palabra tras palabra de forma secuencial. Para calcular un solo token nuevo, el chip debe transferir desde la memoria decenas de gigabytes de parámetros, realizar una operación matemática mínima y repetir el ciclo para la siguiente palabra. Aquí el sistema está asfixiado por el ancho de banda (*memory-bound*).

## 2. Cómo funciona por dentro

La inferencia eficiente optimiza cuatro áreas: diseño de aceleradores, compresión numérica, gestión de memoria y generación especulativa.

### Aceleradores: Tensor Cores y matrices sistólicas

Las GPU integran miles de núcleos en paralelo. Desde la arquitectura Volta (2017), NVIDIA incluye **Tensor Cores**: circuitos diseñados para ejecutar operaciones matriciales FMA (*Fused Multiply-Add*) en un solo ciclo:

```text
D = (A × B) + C
```

Las entradas A y B se leen en precisión reducida (FP16 o FP8), mientras que el acumulador C mantiene 32 bits (FP32) para evitar errores de redondeo.

Por su parte, las TPU de Google (2017) adoptan una **matriz sistólica** (Kung y Leiserson, 1978). Los datos fluyen rítmicamente entre celdas contiguas —como el pulso cardíaco—, multiplicándose por los parámetros fijos en la malla. Esto evita lecturas y escrituras continuas en memoria y ahorra gran cantidad de energía.

### Cuantización: FP8, AWQ e INT4

Cada parámetro de una red neuronal suele guardarse en coma flotante de 16 bits (dos bytes). Un modelo de 70.000 millones de parámetros (70B) requiere unos 140 gigabytes de memoria gráfica (VRAM) solo para cargarse. La cuantización proyecta estos valores continuos a enteros discretos:

```text
x_cuantizado = clip(redondeo(x ÷ Escala) + Punto_Cero, min_entero, max_entero)
x_reconstruido = Escala × (x_cuantizado - Punto_Cero)
```

- **FP8 (8 bits):** Estándar en GPUs modernas (NVIDIA H100 y Blackwell). Su formato E4M3 ofrece inferencia precisa, reduciendo el tráfico de datos a la mitad frente a FP16.
- **AWQ (*Activation-aware Weight Quantization*, MIT 2023):** Demostró que apenas el 1 % de los canales de activación concentra la información crítica. AWQ protege ese 1 % y comprime el 99 % restante a enteros de 4 bits (INT4), reduciendo el tamaño a una cuarta parte con mínima pérdida semántica.
- **Formato GGUF:** Creado por Georgi Gerganov en *llama.cpp* (2023), permite repartir capas del modelo entre la VRAM de la GPU y la RAM del sistema en ordenadores personales.

### PagedAttention y decodificación especulativa

Para no recalcular palabras previas, el modelo guarda sus estados intermedios en una memoria llamada **KV-Cache** (*Key-Value Cache*). Reservar espacio contiguo por adelantado desperdiciaba entre el 60 % y el 80 % de la VRAM por fragmentación. En 2023, investigadores de UC Berkeley crearon **PagedAttention** (núcleo de vLLM), que fragmenta la KV-Cache en pequeños bloques virtuales no contiguos asignados bajo demanda, reduciendo el desperdicio a menos del 4 % y triplicando los usuarios simultáneos.

Por otro lado, la **decodificación especulativa** desacopla la generación usando un modelo borrador pequeño y veloz que propone una ráfaga de K tokens candidatos. El modelo principal los valida en paralelo en una sola pasada con probabilidad:

```text
Probabilidad de aceptación = min(1, P_principal(token) ÷ P_borrador(token))
```

Si el modelo principal rechaza un token, lo sustituye por una muestra corregida y descarta los siguientes, conservando con exactitud la calidad matemática original y acelerando la generación de 1,5 a 2,5 veces.

## 3. Dónde se usa hoy en la vida real

- **Servidores en la nube:** Motores como vLLM, TensorRT-LLM y TGI despachan millones de consultas por hora en clusters de GPUs H100 y B200 para plataformas como ChatGPT o Claude.
- **Inferencia local en ordenadores:** Ollama, LM Studio y *llama.cpp* ejecutan modelos cuantizados en GGUF sobre chips Apple Silicon (M1 a M4) y tarjetas domésticas con total privacidad sin enviar datos a la red.
- **Asistentes de audio en directo:** Servicios donde la respuesta debe tardar menos de 50 milisegundos combinan AWQ a 4 bits con decodificación especulativa para mantener diálogos fluidos.

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Dimensión | Beneficio principal | Limitación técnica | Impacto en calidad |
| :--- | :--- | :--- | :--- |
| **Tensor Cores / Matriz sistólica** | Aceleración masiva de cálculo con bajo consumo. | Rendimiento subóptimo con un usuario en generación secuencial. | Exacto; cálculo numérico sin distorsión. |
| **Cuantización FP8 / INT4 (AWQ)** | Reduce el uso de VRAM en 50 % a 75 % y alivia el bus. | Exige calibración previa y núcleos de software optimizados. | Casi imperceptible en 8 y 4 bits; riesgo bajo 3 bits. |
| **Formato GGUF** | Reparte el modelo entre GPU y RAM del sistema. | La velocidad cae si gran parte corre en la RAM de la CPU. | Idéntico a la compresión elegida. |
| **PagedAttention** | Reduce el desperdicio en KV-Cache a menos del 4 %. | Sobrecarga menor de traducción de direcciones virtuales. | Cero pérdida matemática en respuestas. |
| **Decodificación especulativa** | Acelera la velocidad entre 1,5 y 2,5 veces sin alterar la salida. | Obliga a mantener dos modelos en memoria simultáneamente. | Distribución idéntica a la del modelo principal. |

### Riesgos y limitaciones técnicas

- **Efecto acantilado (*cliff effect*):** Cuantizar por debajo de 4 bits suele provocar caídas repentinas en razonamiento formal, cálculo y código, aunque la gramática aparente fluidez.
- **Muro de la memoria (*memory wall*):** La potencia de cómputo ha crecido mucho más rápido que el ancho de banda de las memorias HBM, manteniendo la generación secuencial atada a las transferencias de datos.
- **Concentración de suministro:** Las memorias HBM3e y los empaquetados avanzados (como CoWoS de TSMC) están concentrados en muy pocos fabricantes, encareciendo la infraestructura global.

## 5. Temas relacionados

- **FlashAttention (v1, v2 y v3):** Algoritmo de Tri Dao (2022-2024) que calcula la atención por bloques en la memoria SRAM del chip, evitando transferencias lentas a la memoria principal.
- **Grouped-Query Attention (GQA):** Arquitectura usada en modelos como Llama 3 donde varias cabezas de atención comparten claves y valores, reduciendo la KV-Cache hasta en 8 veces.
- **Continuous Batching (Orca):** Técnica de planificación (2022) que inserta nuevas secuencias en el procesador apenas otra termina, evitando tiempos muertos en el hardware.
- **Paralelismo tensorial y de canalización (*Pipeline*):** Métodos de particionado para repartir un modelo masivo entre múltiples GPUs conectadas por NVLink cuando este excede la capacidad de un chip.
