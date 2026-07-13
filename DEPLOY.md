# 🚀 Cómo publicar MenuFam dentro de Google Workspace (costo $0)

## ✅ Implementación activa (13/07/2026)

- **URL de la app (mandar al grupo):**
  https://script.google.com/macros/s/AKfycbypLi__u2lS2SsaKFJhgPSSiNUtTS6OHaVENaaT_fJb8Ttq9KVFOweuFf9-D7Lu_f2h/exec
- **ID de implementación:** `AKfycbypLi__u2lS2SsaKFJhgPSSiNUtTS6OHaVENaaT_fJb8Ttq9KVFOweuFf9-D7Lu_f2h`
- Versión 2 · Ejecutar como: dueño · Acceso: cualquier usuario con cuenta de Google
- Proyecto: script.google.com → "MenuFam" · Datos: `menufam-data.json` en el Drive del dueño
- La app se actualiza sola desde este repo (branch `claude/weekly-family-menu-app-jw7odl`) — no hace falta re-implementar para recibir mejoras.

> Nota: este repo es público, así que la URL queda visible. Igual solo entra
> gente logueada en Google; si algún día quieren cerrarla más, en
> "Administrar implementaciones" cambien el acceso a "Cualquier usuario de
> Grupo Mitre" (requiere que toda la familia use cuentas del dominio).


La app se hospeda en **Google Apps Script**, que ya está incluido en el plan
Business Starter de `@grupomitre.com.ar`. No hay que dar de alta ningún
sistema externo, no consume tokens de IA, y el **login con Google es
automático**: Google exige iniciar sesión antes de abrir la URL.

Bonus: al publicarla así, el menú deja de vivir en cada teléfono y pasa a un
archivo `menufam-data.json` en tu Drive — **toda la familia ve y edita el
mismo menú**, sincronizado (la app manda los cambios sola y se actualiza cada
45 segundos).

## ⚡ Opción rápida (2 pasos, ~3 minutos) — recomendada

Esta variante descarga la app desde GitHub en cada visita: **cuando el repo
se actualiza, la app se actualiza sola** sin tocar nada.

1. Entrá a [script.new](https://script.new) (logueado con tu cuenta), ponele
   nombre `MenuFam`, borrá el contenido de `Código.gs` y pegá el contenido de
   [`apps-script/Code-autoupdate.gs`](https://raw.githubusercontent.com/miguelippolito3-cloud/Men-semanal-flia-/claude/weekly-family-menu-app-jw7odl/apps-script/Code-autoupdate.gs)
   (abrí ese link, seleccioná todo, copiá y pegá). No hay que crear ningún
   archivo más.
2. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como:
   **Yo** · Acceso: **Cualquier usuario con cuenta de Google** → Implementar
   → autorizá los permisos → copiá la URL `/exec` y mandala al grupo.

Listo: login con Google automático, datos compartidos en `menufam-data.json`
en tu Drive, y actualizaciones automáticas desde el repo.

## Opción clásica (todo pegado en el proyecto, ~10 minutos)

1. **Entrá a [script.new](https://script.new)** logueado con tu cuenta
   `@grupomitre.com.ar`. Se abre un proyecto nuevo de Apps Script.
   Ponele nombre: `MenuFam`.

2. **Pegá el backend**: borrá el contenido de `Código.gs` y pegá el contenido
   de [`apps-script/Code.gs`](apps-script/Code.gs).

3. **Agregá la app**: menú `+` (junto a "Archivos") → **HTML** → nombralo
   exactamente `index`. Borrá lo que trae y pegá el contenido **completo**
   del archivo [`index.html`](index.html) de este repo.

4. **Publicá**: botón **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**
   - Descripción: `MenuFam v1`
   - Ejecutar como: **Yo** (así los datos viven en TU Drive)
   - Quién tiene acceso: **Cualquier usuario con cuenta de Google**
     (si Xime y vos usan cuentas del dominio, podés elegir
     "Cualquier usuario de Grupo Mitre" y queda cerrada al dominio)
   - **Implementar** → autorizá los permisos (pide Drive: es para el archivo
     de datos) → copiá la **URL que termina en `/exec`**.

5. **Compartila en el grupo de WhatsApp** 😄. En el celular:
   abrir la URL en Chrome/Safari → menú **Compartir → Agregar a pantalla de
   inicio** → queda con ícono como una app más.

## Cómo funciona el login

- Cualquiera que abra la URL sin sesión de Google ve la pantalla de login de
  Google. No hay que programar nada ni configurar OAuth: lo hace la
  plataforma. Costo: $0, tokens: 0.
- Con "Cualquier usuario con cuenta de Google", Xime puede entrar con su
  Gmail personal aunque no sea del dominio.

## Dónde viven los datos

- En `menufam-data.json`, en **tu** Google Drive (el dueño de la
  implementación). Podés abrirlo, hacerle backup o borrarlo cuando quieras.
- Última escritura gana: si dos personas editan exactamente al mismo tiempo,
  queda el cambio del último que guardó (para un menú familiar alcanza).
- Cada teléfono además guarda una copia local, así la app abre al instante y
  funciona aunque se corte internet (sincroniza al volver).

## Mover los datos a una unidad compartida

1. Creá la unidad compartida (Drive → Unidades compartidas → ＋) o usá una
   existente, y sumá como miembros a quienes quieras (con rol "Colaborador
   de contenido" o más).
2. **Mové `menufam-data.json`** desde Mi unidad a esa unidad compartida
   (arrastrándolo en Drive). Mover no cambia el contenido: no se pierde nada.
3. Abrí la unidad en el navegador y copiá el **ID** de la URL
   (`drive.google.com/drive/folders/ESTE_ID`). Si usás una subcarpeta,
   copiá el ID de la subcarpeta.
4. En el proyecto de Apps Script, pegá ese ID en la constante
   `DATA_FOLDER_ID` (arriba de todo en `Código.gs`) — el código nuevo con
   esa constante está en `apps-script/Code-autoupdate.gs`.
5. **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva →
   Implementar** (la URL de la app no cambia).

Desde ahí el archivo vive en la unidad compartida: sobrevive a cambios de
cuenta, y cualquier miembro de la unidad puede verlo y respaldarlo.

## Para actualizar la app más adelante

1. Reemplazá el contenido del archivo `index` con el `index.html` nuevo.
2. **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva → Implementar.**
   La URL no cambia.

## ¿Por qué no las otras opciones de Google?

- **AppSheet**: la licencia es por usuario (USD 34/mes cada uno) y habría que
  rehacer la app en su modelo de planillas. Apps Script corre la app tal cual.
- **Google Sites**: no permite JavaScript propio.
- **Firebase Hosting**: gratis pero es un sistema aparte que hay que dar de
  alta; Apps Script ya está dentro de Workspace.
