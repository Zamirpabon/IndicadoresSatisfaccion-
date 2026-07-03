# Indicadores de Satisfacción · Asistente Mariana (Conalca)

Tablero web de indicadores de calidad del asistente de IA **Mariana** (chatbot
logístico de Conalca / Super SAC), construido a partir de la matriz de pruebas
de conversación.

## Qué muestra

Dos indicadores clave, con **filtro por fecha manual** (calendario):

- **Satisfacción (%)** — respuestas correctas ÷ respuestas evaluadas.
- **Respuesta < 1 minuto (%)** — respuestas dentro del minuto ÷ respuestas medidas.

Además: cobertura de evaluación, total de pruebas, fallas y pruebas sin evaluar,
más el detalle de las fallas detectadas.

## Cómo verlo

- **Local:** abre `index.html` en el navegador.
- **En línea:** publicado con GitHub Pages (ver Settings → Pages).

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura del tablero |
| `styles.css` | Diseño (tema claro/oscuro) |
| `script.js`  | Datos de las pruebas y lógica de las gráficas |

Sin librerías externas: HTML + CSS + JavaScript puro.
