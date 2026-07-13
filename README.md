# 🍽️ Menú Semanal — Familia

App para armar el menú semanal de la familia: **cenas** de lunes a viernes y **viandas del cole** para Fran (8), Luca (6) y Martu (2). El recetario viene precargado con los platos que ya usamos (Kansas chicken, milanesas napolitanas, tarta de jamón y queso, fideos con crema, etc.), sacados del chat "Menu Semanal Comidas".

> La versión 2 incorpora las mejores ideas de las apps líderes de planificación de comidas (Mealime, Planifood, KptnCook, Plan to Eat, AnyList, BigOven) — ver [PROPUESTA.md](PROPUESTA.md) para la investigación completa.

## Qué hace

- 🎲 **Genera el menú de la semana** con reglas de variedad: no repite proteína dos días seguidos, máximo dos veces la misma proteína por semana, pescado una vez, y evita los platos de la semana pasada.
- 🎡 **Ruleta animada por día**: giran los chicos y la suerte decide el plato — el "¿qué comemos?" se vuelve un juego.
- ❤️ **Votos de la familia**: cada uno marca sus platos favoritos y el generador los hace salir más seguido; el 🚫 veta un plato sin borrarlo del recetario.
- 🌞 **"¿Qué toca hoy?"**: tarjeta arriba de todo con la cena y la vianda del día.
- 🔥 **Racha de semanas planificadas** con confeti al completar la semana.
- 🥡 **Opciones rápidas** "Sobras / aprovechar" y "Salimos / pedimos" para los días que no se cocina.
- 🔁 **Re-sortea un día puntual** o cambiá cualquier plato a mano (incluye opción "Otro" para escribir libre).
- 🧺 **Viandas con observaciones** por día ("calentar la carne a la mañana", "queso rallado aparte") y variantes para Martu.
- 🥗 **Ajuste keto para Mike**: activando el toggle, cada cena muestra su versión keto (porciones, sin puré/papas, ensalada grande).
- 💬 **Exporta a WhatsApp** con el mismo formato de siempre (emojis, días en negrita) — copiar y pegar, o abrir WhatsApp directo.
- 🛒 **Lista de compras** armada a partir de los ingredientes de los platos elegidos, agrupada por carnicería, verdulería, lácteos y almacén — con ítems tildables y "copiar solo lo que falta".
- 📖 **Recetario editable**: agregá o sacá platos, con acompañamiento, variante para chicos, ajuste keto e ingredientes.
- 🖨️ **Imprimible** (queda tipo la grilla de papel) y todo se guarda solo en el dispositivo (localStorage), sin cuentas ni servidor.

## Cómo usarla

Es un único archivo, sin dependencias:

1. Abrí `index.html` en cualquier navegador (funciona en el celular), **o**
2. Activá GitHub Pages en este repo (*Settings → Pages → Deploy from branch*) y queda con URL fija para toda la familia.

## Flujo semanal sugerido

1. Domingo: tocar **🎲 Generar menú**, ajustar lo que no cierre.
2. **💬 Enviar por WhatsApp** al grupo para que lo vea Xime.
3. **🛒 Lista de compras** para el súper.
4. El lunes siguiente: **🗓️ Nueva semana** (archiva la actual para no repetir platos).
