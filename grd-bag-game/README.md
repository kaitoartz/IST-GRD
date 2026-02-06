# GRD Bag Game - Tu Bolso de Emergencia

Juego educativo estilo WarioWare para aprender a preparar un kit de emergencia según el tipo de desastre.

## 🎮 Características

- **4 Escenarios**: Terremoto, Incendio Forestal, Inundación, Apagón
- **Dinámica Educativa**: Aprende a clasificar items esenciales vs. prescindibles
- **Modo Desafío**: 3 vidas, tiempo decreciente
- **Modo Calma**: Práctica infinita, sin presión
- **Animaciones Fluidas**: Transiciones y efectos visuales atractivos
- **Responsivo**: Optimizado para pantallas verticales y dispositivos móviles

## 📁 Estructura del Proyecto

```
grd-bag-game/
├── index.html                  # Punto de entrada
├── README.md                   # Este archivo
├── .gitignore                  # Archivos a ignorar
├── public/                     # Archivos estáticos
│   ├── assets/
│   │   ├── audio/             # Sonidos del juego
│   │   ├── images/            # Imágenes (hero, mochila, fondos)
│   │   └── icons/             # Íconos de items
│   └── css/
│       └── styles.css         # Estilos principales
├── src/                        # Código fuente
│   ├── js/
│   │   ├── core/              # Lógica principal
│   │   │   ├── main.js        # Inicialización y loop del juego
│   │   │   └── state.js       # Gestión del estado global
│   │   ├── ui/                # UI y animaciones
│   │   │   ├── ui.js          # Renderizado de pantallas
│   │   │   └── bagAnimation.js # Animaciones de mochila
│   │   └── interaction/       # Manejo de eventos
│   │       └── dragdrop.js    # Drag & drop y click handlers
│   └── data/
│       ├── items.json         # Catálogo de 16 items
│       └── scenarios.json     # 4 escenarios con reglas
└── docs/                       # Documentación

```

## 🚀 Inicio Rápido

### Requisitos
- Python 3.8+
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalación

1. **Clonar/Descargar el proyecto**
```bash
cd grd-bag-game
```

2. **Iniciar servidor local**
```bash
python -m http.server 8000
```

3. **Abrir en navegador**
```
http://localhost:8000
```

## 📊 Datos del Juego

### Items (16 total)
- **Esenciales**: Agua, Comida, Linterna, Radio, Botiquín
- **Recomendados**: Pilas, Silbato, Manta, Documentos
- **Prohibidos**: Laptop, Secador, Libro, Peluche

### Escenarios (4 tipos)
Cada escenario tiene su propia lista de items esenciales, recomendados y prohibidos.

Ver [src/data/README.md](src/data/README.md) para detalles completos.

## 🎨 Características de Diseño

### Accesibilidad
- ✅ Skip link para contenido principal
- ✅ Estados focus visibles en todos los botones
- ✅ Iconos con aria-label
- ✅ Semántica HTML correcta

### Responsividad
- ✅ Mobile-first
- ✅ Adaptado para pantallas verticales
- ✅ Touch-friendly (touch-action: manipulation)
- ✅ Zoom de usuario no bloqueado

### Performance
- ✅ Imágenes con width/height explícito (previene CLS)
- ✅ Audio preload lazy
- ✅ Animaciones solo en transform/opacity
- ✅ Respeta prefers-reduced-motion

## 🔊 Audio

Archivos placeholder silenciosos incluidos. Para agregar sonidos reales:
1. Reemplazar archivos .wav en `public/assets/audio/`
2. Ver [public/assets/audio/README.md](public/assets/audio/README.md) para especificaciones

## 📱 Modos de Juego

### Modo Calma 🧘
- Sin límite de tiempo
- Sin límite de vidas
- Música tranquila (cuando se implemente)
- Ideal para practicar

### Modo Desafío ⚡
- 3 vidas
- Tiempo decreciente (15s → 5s por nivel)
- Niveles progresivos
- Sistema de puntuación con Top 5

## 🛠️ Desarrollo

### Stack Tecnológico
- **HTML5** - Semántica y accesibilidad
- **CSS3** - Grid, Flexbox, Animaciones
- **JavaScript ES6** - Módulos, Async/await
- **Librerías**:
  - Sortable.js - Drag & drop
  - Anime.js - Animaciones
  - Canvas Confetti - Celebraciones

### Archivos Clave

**[src/js/core/state.js](src/js/core/state.js)**
- Estado global inmutable
- Funciones de lógica del juego
- Sistema de puntuación

**[src/js/core/main.js](src/js/core/main.js)**
- Loop del juego (Briefing → Acción → Debrief)
- Gestión de fases
- Event listeners principales

**[src/js/ui/ui.js](src/js/ui/ui.js)**
- Renderizado de pantallas
- Sistema de sonidos
- Feedback visual (toasts)

**[src/js/ui/bagAnimation.js](src/js/ui/bagAnimation.js)**
- Animaciones de items volando a la mochila
- Efectos visuales dinámicos

**[public/css/styles.css](public/css/styles.css)**
- Diseño responsivo
- Temas visuales por escenario
- Animaciones y transiciones

### Extender el Juego

#### Agregar nuevo escenario
1. Añadir objeto en `src/data/scenarios.json`
2. Definir `essentialItems`, `recommendedItems`, `forbiddenItems`
3. (Opcional) Agregar estilo en CSS bajo `body.sc-[nombre]`

#### Agregar nuevo item
1. Crear ícono .webp en `public/assets/icons/`
2. Añadir entrada en `src/data/items.json`
3. Actualizar escenarios que lo incluyan

#### Cambiar colores/tema
Editar variables CSS en `public/css/styles.css`:
```css
:root {
  --primary: #4338CA;
  --success: #16A34A;
  --danger: #DC2626;
  /* ... */
}
```

## 📈 Puntuación

- **Item Esencial (E)**: +15 pts
- **Item Recomendado (R)**: +5 pts
- **Item Prohibido (N)**: -10 pts
- **Ronda Pasada**: +100 pts
- **Ronda Perfecta (8/8 vitales)**: +200 pts bonus

## 🧪 Testing

Ver estado del proyecto con:
```bash
python -m http.server 8000 --cgi
```

Abre DevTools (F12) para:
- Consola: Ver logs de carga de datos
- Network: Verificar request de items.json y scenarios.json
- Performance: Analizar animaciones

## 📝 Licencia

Proyecto educativo - IST EDUCA

## 🤝 Contribuciones

Mejoras bienvenidas. Por favor:
1. Mantener estructura de carpetas
2. Seguir convenciones de nombres (kebab-case para archivos, camelCase para JS)
3. Documentar cambios significativos
4. Probar en móvil

## ✉️ Contacto

Para reportar bugs o sugerencias, contactar al equipo de IST EDUCA.
