# Fine-Tuning y LoRA: Cómo Adaptar Modelos de IA sin Gastar una Fortuna

Entrenar un modelo de inteligencia artificial desde cero cuesta millones de dólares y semanas de supercomputación. Por eso, en la práctica se recurre al ajuste fino (*fine-tuning*): se toma un modelo base que ya domina el lenguaje o las imágenes y se le enseña una tarea concreta. Sin embargo, cuando los modelos alcanzaron decenas de miles de millones de parámetros, ajustar todos sus pesos a la vez chocó contra un muro: consumía cantidades colosales de memoria gráfica (VRAM) que solo los gigantes tecnológicos podían costear.

Para democratizar este proceso nació la adaptación eficiente de parámetros (*Parameter-Efficient Fine-Tuning* o PEFT). Dentro de este enfoque destacan **LoRA** (*Low-Rank Adaptation*) y su variante comprimida **QLoRA**, técnicas que adaptan modelos punteros modificando menos del 1% de sus parámetros sin mermar su calidad.

> **En pocas palabras:** LoRA funciona como añadir notas adhesivas con instrucciones específicas a una enciclopedia ya impresa, logrando que el modelo aprenda nuevas tareas sin necesidad de reescribir ni reimprimir sus miles de millones de páginas originales.

---

## 1. De dónde viene y cómo se entiende fácil

Imagine que contrata a un traductor con veinte años de experiencia. Si necesita que redacte contratos bajo las leyes de un país concreto, no le enseña a hablar desde la infancia: le entrega una guía breve con la terminología jurídica local.

El método clásico, llamado ajuste completo (*Full Fine-Tuning* o FFT), intentaba reeducar a todo el modelo. Al actualizar cada parámetro durante el entrenamiento supervisado (*Supervised Fine-Tuning* o SFT) con el optimizador AdamW en precisión estándar de 16 bits (FP16 o BF16, 2 bytes por número), la memoria necesaria por parámetro se dispara:
- **Pesos originales del modelo:** 2 bytes.
- **Gradientes del error:** 2 bytes.
- **Momentos del optimizador AdamW (en 32 bits):** 8 bytes.
- **Copia maestra en 32 bits:** 4 bytes.

El total alcanza **16 bytes por parámetro**. Para un modelo de 70.000 millones de parámetros (70B), el ajuste completo supera los 1.100 gigabytes (GB) de VRAM solo para alojar los pesos y el optimizador, exigiendo clústeres de tarjetas Nvidia A100 o H100 inaccesibles para equipos independientes.

### La hipótesis que abrió el camino
En diciembre de 2020, Armen Aghajanyan y su equipo en Meta formularon la **hipótesis de la dimensión intrínseca**. Probaron que las adaptaciones que necesita un modelo preentrenado no requieren alterar todo su volumen de parámetros: las soluciones útiles se concentran en un subespacio geométrico diminuto.

Con esa base teórica, Edward Hu y su equipo en Microsoft Research presentaron **LoRA** en junio de 2021: congelar el modelo base intacto y capturar el aprendizaje nuevo mediante dos matrices auxiliares muy estrechas. En mayo de 2023, Tim Dettmers y colaboradores en la Universidad de Washington publicaron **QLoRA**, reduciendo el modelo base a 4 bits para permitir ajustar un modelo de 70B en una única estación de trabajo con 48 GB de VRAM.

---

## 2. Cómo funciona por dentro

### El truco del rango reducido
Las redes neuronales procesan información multiplicando datos por matrices de pesos. Si una matriz lineal original W₀ mide 4.096 × 4.096 números, contiene 16,7 millones de parámetros.

En vez de calcular una matriz de actualización completa ΔW (delta W) de 16,7 millones de números, LoRA descompone el cambio en el producto de dos matrices delgadas, B y A, mediante un valor pequeño llamado **rango** (r, comúnmente 8, 16 o 32):

```text
ΔW = B × A
```

Si elegimos r = 16:
- La matriz **A** tiene tamaño 16 × 4.096 (65.536 números).
- La matriz **B** tiene tamaño 4.096 × 16 (65.536 números).

Al multiplicarse, B × A reconstruye la dimensión original de 4.096 × 4.096, pero el entrenamiento solo calcula gradientes para 131.072 parámetros en lugar de 16,7 millones: un ahorro superior al 99% en esa capa.

### La fórmula del paso hacia adelante
Cuando entran datos (x) a la capa, el modelo suma la salida original congelada y la corrección de bajo rango:

```text
salida = x × W₀ + (α ÷ r) × (x × Aᵀ × Bᵀ)
```

Donde:
- **x:** vector de datos de entrada.
- **W₀:** pesos preentrenados congelados.
- **Aᵀ y Bᵀ:** matrices adaptadoras transpuestas que aprenden la tarea.
- **Factor de escala (α ÷ r):** la constante alfa (α) estabiliza el entrenamiento si cambiamos el valor del rango r.

Para no distorsionar el modelo al inicio, A se inicializa con números aleatorios pequeños y B se llena de **ceros**. Al comenzar, B × A es cero y el modelo arranca comportándose de forma idéntica al original.

### Fusión sin penalización de velocidad
Al terminar el entrenamiento, los pesos adaptadores se suman directamente a la matriz base:

```text
W_final = W₀ + (α ÷ r) × (B × A)
```

Esta **fusión de pesos** (*weight merging*) genera un archivo de modelo estándar. En producción, responde a la misma velocidad del modelo original, con cero latencia añadida.

### Qué añade QLoRA
QLoRA reduce aún más el consumo mediante tres innovaciones:
1. **Tipo de datos NormalFloat4 (NF4):** comprime los pesos base a 4 bits adaptándose a su distribución normal en campana, perdiendo mucha menos precisión que la cuantización uniforme.
2. **Doble cuantización:** comprime las constantes de escala del primer paso, ahorrando 0,37 bits por parámetro.
3. **Paginación de memoria:** traslada picos de memoria del optimizador a la RAM del sistema vía CUDA para evitar errores de memoria agotada (*Out of Memory*).

```python
import torch
import torch.nn as nn

class CapaLoRA(nn.Module):
    """Capa lineal con adaptación de bajo rango (LoRA)."""
    def __init__(self, entrada: int, salida: int, r: int = 16, alfa: float = 32.0):
        super().__init__()
        self.escala = alfa / r
        self.lineal = nn.Linear(entrada, salida, bias=False)
        self.lineal.weight.requires_grad = False  # Congela la capa base
        
        self.lora_A = nn.Parameter(torch.randn(r, entrada) * 0.01)
        self.lora_B = nn.Parameter(torch.zeros(salida, r))
        self.fusionado = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.fusionado:
            return self.lineal(x)
        return self.lineal(x) + ((x @ self.lora_A.t()) @ self.lora_B.t()) * self.escala

    def fusionar(self):
        """Suma el adaptador a la base para inferencia rápida."""
        if not self.fusionado:
            self.lineal.weight.data += (self.lora_B @ self.lora_A) * self.escala
            self.fusionado = True
```

---

## 3. Dónde se usa hoy en la vida real

- **Modelos de conversación e instrucciones:** transforma modelos abiertos como LLaMA, Mistral o Qwen en asistentes específicos mediante conjuntos de datos de preguntas y respuestas.
- **Especialización técnica vertical:** entrena modelos en medicina (informes diagnósticos) o derecho (análisis contractual) sin borrar su fluidez lingüística general.
- **Servicio compartido eficiente (*multi-tenant*):** herramientas como vLLM y LoRAX mantienen un solo modelo base grande en VRAM y conmutan adaptadores ligeros (50 a 100 MB) según el usuario, recortando costes operativos en más del 80%.
- **Generación de imágenes y estilos artísticos:** en generadores como Stable Diffusion o Flux, los creadores comparten adaptadores LoRA muy compactos para plasmar personajes o estilos visuales concretos.

---

## 4. Qué hace bien, qué falla y qué riesgos tiene

| Criterio | Ajuste Completo (FFT) | LoRA | QLoRA |
| :--- | :--- | :--- | :--- |
| **Parámetros entrenados** | 100% | 0,05% al 1% | 0,05% al 1% |
| **Precisión del modelo base** | 16 bits (FP16/BF16) | 16 bits (FP16/BF16) | 4 bits (NF4) |
| **VRAM requerida (modelo 70B)** | > 1.100 GB | 160 a 200 GB | 48 a 55 GB |
| **Velocidad al responder** | Nativa | Nativa (tras fusionar) | Nativa (tras fusionar) |
| **Riesgo de olvido catastrófico** | Alto | Mínimo (base fija) | Mínimo (base fija) |
| **Tamaño del archivo resultante** | ~140 GB | 50 a 200 MB | 50 a 200 MB |

### Limitaciones y riesgos prácticos
- **Aprender destrezas frente a memorizar datos:** LoRA destaca ajustando estilo, formato y razonamiento. Si se pretende memorizar miles de documentos nuevos no presentes en el preentrenamiento, conviene complementarlo con Generación Aumentada por Recuperación (RAG).
- **Sobrecarga de tiempo en QLoRA:** descomprimir pesos de 4 a 16 bits en cada iteración hace que el entrenamiento en QLoRA tome entre un 20% y un 35% más de tiempo que con LoRA estándar en 16 bits.
- **Interferencias al fusionar adaptadores:** combinar varios adaptadores LoRA mediante promedios ponderados puede generar conflictos si modificaron los mismos circuitos neuronales para tareas incompatibles.

---

## 5. Temas relacionados

- **Modelos de Lenguaje Masivos (LLMs) y Transformers:** la arquitectura modular sobre la que se conectan los adaptadores LoRA.
- **Generación Aumentada por Recuperación (RAG):** método complementario que aporta datos externos actualizados sin modificar los parámetros del modelo.
- **Cuantización para Inferencia (AWQ, GPTQ, GGUF):** técnicas para comprimir modelos terminados y ejecutarlos en equipos de consumo.
- **Alineamiento con Preferencias Humanas (DPO y RLHF):** métodos de optimización de respuestas comúnmente aplicados mediante adaptadores LoRA.
