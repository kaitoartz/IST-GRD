# Audio Assets - Placeholders

Este directorio contiene archivos de audio placeholder silenciosos para el juego.

## Archivos Actuales

### Sonidos de Juego
- **pop.wav** - Sonido al agregar un item a la mochila (placeholder silencioso)
- **error.wav** - Sonido de error (mochila llena, item duplicado) (placeholder silencioso)
- **success.wav** - Sonido de éxito al completar ronda (placeholder silencioso)
- **tick.wav** - Sonido de tick del timer (placeholder silencioso, opcional)

## Crear Nuevos Placeholders

Si necesitas regenerar los archivos placeholder, ejecuta:

```bash
python create_placeholders.py
```

## Reemplazar con Sonidos Reales

Para agregar sonidos reales al juego:

1. Crea o consigue archivos de audio en formato WAV o MP3
2. Reemplaza los archivos placeholder con tus sonidos
3. Mantén los mismos nombres de archivo
4. Formatos recomendados:
   - **WAV**: Sin compresión, mejor calidad, archivos más grandes
   - **MP3**: Comprimido, menor tamaño, buena calidad

### Especificaciones Recomendadas
- Formato: WAV (16-bit, 44.1kHz, Mono)
- Duración: 0.1-0.5 segundos para efectos rápidos
- Volumen: Normalizado para evitar clipping

### Sonidos Sugeridos por Tipo
- **pop**: Click suave, "plop" juguetón
- **error**: Buzzer suave, "boing" de rebote
- **success**: Campanita alegre, "ding" triunfante
- **tick**: Click de reloj, "tock" sutil

## Recursos de Sonidos Gratuitos

- [Freesound.org](https://freesound.org/) - Biblioteca de efectos de sonido CC
- [Zapsplat](https://www.zapsplat.com/) - Efectos gratuitos para proyectos
- [OpenGameArt](https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13) - Sonidos para juegos

## Notas Técnicas

Los archivos placeholder actuales son:
- Silencio de 0.1 segundos
- Mono, 16-bit, 44.1kHz
- Creados con Python wave module
- Compatibles con todos los navegadores modernos
