# Data - Estructura de Datos del Juego

## Archivos

### items.json
Catálogo completo de items disponibles en el juego. Cada item tiene:
- `id`: Identificador único
- `name`: Nombre mostrado al usuario
- `icon`: Ruta al ícono WebP
- `feedback`: Mensaje educativo sobre el item
- `scenarios`: (legacy) Mapeo antiguo de clasificación por escenario

### scenarios.json
Define los escenarios de emergencia y sus reglas. Cada escenario tiene:
- `id`: Identificador único del escenario
- `name`: Nombre descriptivo
- `icon`: Emoji representativo
- `description`: Contexto del escenario
- `briefingText`: Texto mostrado en pantalla de briefing
- `essentialItems`: Array de IDs de items **esenciales** (E) para este escenario - otorgan 10 pts
- `recommendedItems`: Array de IDs de items **recomendados** (R) - otorgan 5 pts
- `forbiddenItems`: Array de IDs de items **no apropiados** (N) - descuentan 5 pts

## Lógica de Escenarios

En cada ronda:
1. Se selecciona un escenario aleatorio (diferente al anterior si es posible)
2. Se filtran y muestran solo los items relevantes a ese escenario
3. El jugador debe seleccionar al menos 4 items esenciales para sobrevivir
4. Los items se clasifican dinámicamente según el escenario activo

## Ejemplo de Escenario

```json
{
  "id": "terremoto",
  "name": "Terremoto",
  "icon": "🌋",
  "description": "Movimiento sísmico fuerte. Prepárate para evacuar rápido.",
  "briefingText": "¡TERREMOTO! Empaca lo esencial",
  "essentialItems": ["water", "food", "flashlight", "batteries", "medkit", "whistle", "radio", "documents"],
  "recommendedItems": ["mask", "blanket", "money", "keys"],
  "forbiddenItems": ["laptop", "hairdryer", "novel", "plushie"]
}
```

## Agregar Nuevos Escenarios

1. Añade el escenario en `scenarios.json`
2. Asegúrate de que los IDs de items existan en `items.json`
3. Clasifica los items según:
   - **Esenciales**: Vitales para sobrevivir este tipo de emergencia
   - **Recomendados**: Útiles pero no críticos
   - **Prohibidos**: Inapropiados, peligrosos o que ocupan espacio valioso

## Consideraciones de Diseño

- Cada escenario debe tener entre 4-8 items esenciales
- Balance entre realismo y jugabilidad
- Los items prohibidos enseñan qué NO llevar en situaciones específicas
- La variedad entre escenarios mantiene el juego educativo y entretenido
