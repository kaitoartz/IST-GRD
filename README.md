# IST - Juego del Bolso de Emergencia (GRD)

Este es un juego educativo interactivo diseñado para enseñar a las personas a preparar su **Bolso de Emergencia** (72 horas) de manera eficiente.

## 🚀 Características
- **Mecánica Drag-and-Drop:** Interacción fluida para empacar suministros.
- **Feedback Educativo:** Cada ítem incluye información sobre su importancia en emergencias.
- **Modos de Juego:** 
  - *Modo Calma:* Para aprender sin presión.
  - *Modo Desafío:* Pon a prueba tu velocidad con vidas y niveles.
- **Sistema de Récords:** Tabla de mejores puntajes local.
- **Responsive Design:** Optimizado para móviles y escritorio (incluyendo iPhone SE).

## 🛠️ Tecnologías
- **Vanilla JavaScript:** Módulos ES6 nativos.
- **CSS3:** Sistema de diseño basado en *Refactoring UI* (8pt grid, slate colors).
- **Anime.js:** Animaciones de movimiento y partículas.
- **SortableJS:** Gestión de arrastre y soltado.
- **Canvas-Confetti:** Celebraciones visuales.

## 📁 Estructura del Proyecto
- `js/core/`: Lógica de estado y bucle principal.
- `js/ui/`: Gestión de pantallas, animaciones de la mochila y feedback.
- `js/interaction/`: Manejo de eventos de usuario (drag & drop, clicks).
- `data/`: Catálogo de ítems en formato JSON.
- `assets/`: Recursos visuales y auditivos.

## 📦 Instalación y Uso
Para ejecutar el proyecto localmente:
1. Clona el repositorio.
2. Abre `index.html` usando un servidor local (ej: Live Server de VS Code o `python -m http.server`).

---
Desarrollado para la **Gestión de Riesgos de Desastres (GRD)** de IST.
