# Instrucciones para Generar Sprite Sheet de Iconos

## ⚠️ Nota sobre créditos de Nanana AI
Actualmente no hay créditos suficientes en la cuenta de Nanana AI. Usa una alternativa para generar el sprite sheet.

## 🎨 Opciones para generar el sprite sheet:

### Opción 1: Usar otro generador de IA
1. **DALL-E 3** (ChatGPT Plus/API)
2. **Midjourney**
3. **Leonardo.ai**
4. **Stable Diffusion**

### Opción 2: Crear iconos manualmente
- **Figma** (recomendado) - tiene templates de iconos
- **Canva**
- **Inkscape** (gratis)

---

## 📋 Prompt para generador de IA:

```
A clean icon sprite sheet on white background with 16 simple flat design icons in 4x4 grid layout. Each icon 128x128 pixels. Icons needed: water bottle, canned food, flashlight, batteries, first aid kit with red cross, emergency whistle, portable radio, documents/ID cards, medical face mask, blanket/sleeping bag, money bills, house keys, laptop computer, hair dryer, thick book, teddy bear plushie. Minimalist flat design style, colorful, clear spacing between icons, professional emergency kit theme.
```

---

## 📐 Especificaciones técnicas:

- **Dimensiones del sprite sheet:** 512x512 px (4x4 grid)
- **Dimensiones de cada icono:** 128x128 px
- **Formato final:** WebP (después de recortar)
- **Estilo:** Flat design, colores vibrantes
- **Fondo:** Blanco o transparente

---

## ✂️ Proceso de recorte:

1. Genera o descarga el sprite sheet completo
2. Abre en editor de imagen (Photoshop, GIMP, Photopea)
3. Usa herramienta de recorte o guías para dividir en grid 4x4
4. Exporta cada icono individualmente como:
   - `water.webp` → Fila 1, Col 1
   - `food.webp` → Fila 1, Col 2
   - `flashlight.webp` → Fila 1, Col 3
   - (continuar según orden en README.md)

5. Coloca todos los archivos .webp en:
   ```
   grd-bag-game/assets/icons/
   ```

---

## 📦 Checklist de archivos necesarios:

- [ ] water.webp
- [ ] food.webp
- [ ] flashlight.webp
- [ ] batteries.webp
- [ ] medkit.webp
- [ ] whistle.webp
- [ ] radio.webp
- [ ] documents.webp
- [ ] mask.webp
- [ ] blanket.webp
- [ ] money.webp
- [ ] keys.webp
- [ ] laptop.webp
- [ ] hairdryer.webp
- [ ] book.webp
- [ ] plushie.webp

---

## 🎯 El código ya está listo

El archivo `items.json` ya está actualizado para usar los archivos .webp. Solo necesitas:
1. Generar/obtener el sprite sheet
2. Recortar los iconos
3. Guardarlos como .webp en `assets/icons/`
4. ¡El juego funcionará automáticamente!

---

## 💡 Recursos gratis para iconos:

Si prefieres descargar iconos existentes:
- **Flaticon.com** - miles de iconos gratis en webp
- **Icons8.com** - iconos en varios estilos
- **Noun Project** - iconos minimalistas
- **Freepik** - packs de iconos

Búscalas como: "emergency kit icons", "disaster preparedness icons", "survival kit icons"
