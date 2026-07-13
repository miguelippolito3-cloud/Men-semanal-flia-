# 🔍 Investigación y propuesta superadora — Menú Semanal Familia

Investigación basada en el artículo de [Xataka: 17 aplicaciones para organizar tus menús semanales](https://www.xataka.com/basics/aplicaciones-para-organizar-tus-menus-semanales-planificar-mejor-tus-comidas), listados actualizados ([ADSLZone 2025](https://www.adslzone.net/noticias/moviles/top-aplicaciones-planificar-comidas/), [FoodiePrep 2026](https://www.foodieprep.ai/blog/meal-planning-apps-in-2026-which-tools-actually-simplify-your-kitchen), [Eat This Much](https://blog.eatthismuch.com/best-meal-planning-apps/)) y las fichas y reseñas de las apps líderes en App Store y Google Play.

## Qué hacen bien las mejores apps

| App | La mejor idea | Cómo la adoptamos |
|---|---|---|
| **Planifood** | Aprende de tus gustos y arma menús variados y equilibrados | ❤️ Votos por miembro de la familia: los favoritos salen más seguido en el sorteo; 🚫 veta un plato sin borrarlo |
| **Rcetas / Eat This Much** | Menú al azar según preferencias ("me da pereza pensar") | 🎲 Generador con reglas de variedad (proteínas alternadas, pescado 1×, sin repetir la semana pasada) |
| **KptnCook** | Botón "Surprise", pocas opciones por vez, diversión | 🎡 Ruleta animada por día: giran los chicos y la suerte decide |
| **Plan to Eat / Cookidoo** | El plan genera la lista de compras automáticamente | 🛒 Lista de compras derivada de los platos elegidos, agrupada por góndola |
| **AnyList / Food Planner** | Listas compartidas, tildar en tiempo real en el súper | ✅ Ítems tildables que persisten; "Copiar lo que falta" manda solo lo pendiente |
| **Mealime** | Personalización por dieta (keto, porciones) | 👉 Toggle keto para Mike con el ajuste exacto por plato |
| **BigOven / Paprika** | Anotar sobras y "hoy no cocino" en el plan | 🥡 "Sobras / aprovechar" y 🍕 "Salimos / pedimos" como opciones rápidas |
| **Yummly / Diario Comida** | Ver de un vistazo qué toca hoy | Tarjeta "¿Qué toca hoy?" arriba de todo, con cena y vianda del día |
| **Plan to Eat** | Arrastrar recetas entre días | Drag & drop entre días (desktop) + 🔁 re-sorteo por día |
| **Cozi / Dommuss** | Organización familiar simple, sin fricción | Sin cuentas ni registro: un archivo, WhatsApp como canal (que ya usan), y formato de mensaje idéntico al del grupo |
| **Duolingo (patrón general de engagement)** | Rachas y celebración | 🔥 Racha de semanas planificadas + 🎉 confeti al completar la semana |

## Lecciones de UX (de las reseñas)

- **Cozi**: la crítica más repetida es "interfaz cargada y anticuada" → mantenemos una sola pantalla, tarjetas grandes, tipografía clara.
- **Paprika**: su calendario no se conecta con la lista de compras y los usuarios lo penalizan → acá el plan **es** la fuente de la lista.
- **Mealime**: gana por onboarding corto y recetas de 30 min → nuestro recetario ya viene cargado con los platos reales de la familia, onboarding cero.
- **Apps de suscripción (Plan to Eat $49/año, eMeals $5–10/mes)** → esto es gratis, sin cuentas, y los datos quedan en el dispositivo.

## Qué nos hace superadores para ESTA familia

1. **Recetario real, no catálogo**: los 33 platos salen del chat de WhatsApp de Mike y Xime, con las variantes de Martu y las observaciones de las viandas.
2. **Los chicos juegan**: la ruleta convierte el "¿qué comemos?" en un juego para Fran, Luca y Martu; los corazones les dan voz en el menú.
3. **El canal es WhatsApp**: no hay que convencer a nadie de instalar otra app; el resultado se pega en el grupo con el formato de siempre.
4. **Keto integrado**: ninguna app generalista trae el ajuste de Mike por plato; acá viene precargado del chat.

## Ideas para una v3 (no implementadas aún)

- Recordatorios ("descongelar la carne") vía notificaciones (requiere PWA + service worker).
- Sincronización multi-dispositivo (requiere backend, p. ej. Supabase).
- Fotos de los platos y modo cocina paso a paso.
- Sincronizar el calendario escolar (idea de Planifood) para saltear feriados.
