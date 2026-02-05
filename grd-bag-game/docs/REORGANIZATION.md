# Estructura Reorganizada - GRD Bag Game

## Antes ❌

```
grd-bag-game/
├── index.html
├── mi_prueba.py (obsoleto)
├── styles/ (carpeta vacía)
├── assets/
│   ├── audio/
│   ├── images/
│   └── icons/
├── css/
│   └── styles.css
├── data/
│   ├── items.json
│   └── scenarios.json
└── js/
    ├── core/
    ├── ui/
    └── interaction/
```

**Problemas:**
- Mezcla de código fuente, datos y assets
- Sin separación clara de producción vs. desarrollo
- Archivos obsoletos en la raíz
- Difícil de mantener y escalar

---

## Después ✅

```
grd-bag-game/
├── index.html                (en raíz)
├── README.md                 (nuevo)
├── .gitignore               (nuevo)
├── public/                  (assets estáticos)
│   ├── assets/
│   │   ├── audio/           (sonidos del juego)
│   │   ├── images/          (imágenes estáticas)
│   │   └── icons/           (iconos de items)
│   └── css/
│       └── styles.css
├── src/                     (código fuente)
│   ├── js/
│   │   ├── core/            (lógica del juego)
│   │   │   ├── main.js
│   │   │   └── state.js
│   │   ├── ui/              (interfaz y animaciones)
│   │   │   ├── ui.js
│   │   │   └── bagAnimation.js
│   │   └── interaction/     (manejo de eventos)
│   │       └── dragdrop.js
│   └── data/                (datos del juego)
│       ├── items.json
│       └── scenarios.json
└── docs/                    (para documentación futura)
```

**Ventajas:**
✅ **Separación clara** - Código (src/) vs Assets (public/)
✅ **Mantenible** - Estructura escalable y consistente
✅ **Limpiar** - Sin archivos obsoletos
✅ **Profesional** - README y .gitignore
✅ **Flexible** - Espacio para documentación (docs/)

---

## Cambios de Rutas

### HTML
```html
<!-- Antes -->
<link rel="stylesheet" href="css/styles.css">
<audio src="assets/audio/pop.wav"></audio>
<img src="assets/images/intro_hero.png">

<!-- Después -->
<link rel="stylesheet" href="public/css/styles.css">
<audio src="public/assets/audio/pop.wav"></audio>
<img src="public/assets/images/intro_hero.png">
```

### JavaScript
```javascript
// Antes
fetch('data/items.json')

// Después
fetch('src/data/items.json')
```

### CSS (Background Images)
```css
/* Antes */
url('../assets/images/bg_texture.png')

/* Después */
url('../../public/assets/images/bg_texture.png')
```

---

## Archivos Eliminados

- ✓ `mi_prueba.py` - Script de prueba obsoleto
- ✓ `styles/` - Carpeta vacía
- ✓ Carpetas antiguas: `assets/`, `css/`, `js/`, `data/`

**Los archivos fueron copiados a nuevas ubicaciones antes de eliminar**

---

## Archivos Agregados

- 📄 **README.md** - Documentación completa del proyecto
- 🙈 **.gitignore** - Exluye carpetas y archivos innecesarios
- 📁 **docs/** - Carpeta para documentación futura

---

## Próximos Pasos (Sugerencias)

1. **Agregar sonidos reales** - Reemplazar .wav placeholder en `public/assets/audio/`
2. **Documentación técnica** - Crear archivos en `docs/` para arquitectura y guías
3. **Tests** - Crear carpeta `tests/` para pruebas unitarias (si necesario)
4. **CI/CD** - Agregar `.github/workflows/` para automatización
5. **Build process** - Si crece, considerar bundler como Vite o Webpack

---

## Referencia de Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos HTML | lowercase | `index.html` |
| Archivos CSS | kebab-case | `styles.css` |
| Archivos JS | kebab-case | `drag-drop.js` |
| Métodos JS | camelCase | `handleClick()` |
| Clases CSS | kebab-case | `.item-card` |
| Variables CSS | kebab-case | `--primary-color` |
| Carpetas | lowercase | `public/`, `src/` |

---

## Verificación Rápida

```bash
# Ver estructura
tree grd-bag-game/

# Verificar que servidor funciona
python -m http.server 8000

# Abrir navegador
http://localhost:8000
```

✅ **¡Reorganización completa y funcional!**
