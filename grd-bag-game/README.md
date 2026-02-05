# GRD Bag Game

Un juego web educativo para aprender a preparar un bolso de emergencia.

## Descripción

Este proyecto es una aplicación web estática que enseña a los usuarios a identificar y seleccionar los elementos esenciales para un kit de emergencia (mochila de 72 horas). El juego utiliza una mecánica de "arrastrar y soltar" y cuenta con diferentes modos de dificultad.

## Estructura del Proyecto

*   `index.html`: Punto de entrada de la aplicación.
*   `css/styles.css`: Estilos de la aplicación (diseño responsivo, paleta de alto contraste).
*   `js/`: Lógica del juego.
    *   `main.js`: Bucle principal y control de fases (Intro, Briefing, Acción, Debrief).
    *   `state.js`: Gestión del estado (puntuación, vidas, inventario del bolso).
    *   `ui.js`: Manipulación del DOM y actualizaciones visuales.
    *   `dragdrop.js`: Implementación de drag-and-drop usando SortableJS.
*   `data/items.json`: Datos de los objetos (nombre, categoría, puntos, iconos).
*   `assets/`: Recursos estáticos (imágenes, iconos, audio).

## Cómo Ejecutar

Al ser un sitio estático, puedes ejecutarlo con cualquier servidor HTTP simple.

### Python

Desde la raíz del repositorio:

```bash
python3 -m http.server 8080
```

Luego abre tu navegador en `http://localhost:8080/grd-bag-game/`.

## Tecnologías

*   HTML5 / CSS3
*   Vanilla JavaScript (ES6 Modules)
*   [SortableJS](https://sortablejs.github.io/Sortable/) (Drag & Drop)
*   [Canvas Confetti](https://www.kirilv.com/canvas-confetti/) (Efectos visuales)
