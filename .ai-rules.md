# Reglas Maestras de Programación y Diseño - Pool Control 1.0

Este documento es la autoridad máxima para el comportamiento del Asistente de IA. **Debe ser consultado antes de cada modificación de código.**

---

## 1. Protocolo Obligatorio Antes de Modificar Código (Pre-Flight Checklist)

Antes de escribir o editar cualquier archivo:
1. **Revisar componentes comunes:** Verificar si lo solicitado se resuelve con los componentes del Design System en `@/components/comunes` (`PageHeader`, `PillTabs`, `CountBadge`, `SurfaceCard`).
2. **Prohibido el código monolítico:** Si una página supera las 250-300 líneas, es **obligatorio** dividirla:
   - Mover la lógica y Firestore a un Custom Hook (`use[Modulo].ts`).
   - Mover las vistas secundarias y tarjetas a subcomponentes en `_components/`.
3. **Build Tracking:** Incrementar el número de `build` en `src/lib/version.ts` en **cada respuesta que contenga cambios de código**.
4. **No Publicación Automática:** Prohibido hacer commits, crear tags de versión o ejecutar `git push` a repositorios remotos de forma automática o por iniciativa propia. Toda confirmación en Git y publicación/lanzamiento solo se realizará cuando el usuario lo solicite de manera explícita (ej. *"haz la publicación"*, *"publica los cambios"*).

---

## 2. Reglas Maestras de Diseño Visual (UI/UX)

### A. Paleta Oficial de Colores (Estricta - Antigravity IDE Dark Theme)
La paleta corporativa oficial del modo oscuro está sincronizada con el estándar del IDE Antigravity y sigue una jerarquía estricta de elevación en 4 capas para garantizar profundidad y contraste:
* **Fondo Base de la Aplicación (Canvas / Body):** `#121212` (variable `--background: 0 0% 7%`).
* **Contenedor Principal / Listados / Barra Lateral / Paneles:** `bg-[#1e1e1e]` (o clase `bg-app-panel`) con borde `border-[#2e2e2e]` (`border-app-border`).
* **Tarjetas Secundarias / Acordeones / Inputs / Modales:** `bg-[#252526]` (o clase `bg-app-surface`) con borde `border-[#2e2e2e]`.
* **Bloques Interiores Recesivos (ej. Rutas Origen ➔ Destino, Píldoras Inset):** `bg-[#141414]` con borde `border-[#2e2e2e]`.
* **Hover de superficies táctiles:** `hover:bg-[#313131]` / `hover:bg-[#2e2e2e]`.
* **Acentos de foco y acción:** Azul Antigravity (`#0078D4` / `text-sky-400` / `bg-sky-500`).

### B. Controles Redondeados en Píldora (`rounded-full`)
* **Botones de acción:** Todo botón de acción táctil (Recibir, Cancelar, Ver Detalle, Nuevo, Filtros) debe ser `rounded-full`, con altura estándar `h-8` o `h-9` y padding ergonómico.
* **Pestañas (Tabs):** Contenedor píldora `h-11 p-1 bg-[#252526] rounded-full border border-[#2e2e2e]`, con triggers `rounded-full` y estado activo en azul primario.
* **Buscadores e Inputs:** Buscadores en barras de filtrado deben usar `rounded-full`, icono centrado `Search` y fondo `bg-[#252526]`.

### C. Badges Numéricos (Forma y Contraste)
* **Forma simétrica:** Siempre circulares para 1 dígito (`min-w-[20px] h-5 rounded-full inline-flex items-center justify-center text-[11px] font-black`).
* **Alto contraste obligatorio:**
  - Pestaña activa / azul: Badge **blanco puro (`bg-white text-slate-950`)** o **ámbar (`bg-amber-400 text-slate-950`)**.
  - Prohibido azul sobre azul (`bg-sky-500` dentro de un botón primario).
  - Usar siempre `<CountBadge count={n} variant="..." />`.

### D. Tipografía y Capitalización (No Mayúsculas Sostenidas)
* **Cero mayúsculas sostenidas:** Prohibido colocar en labels, títulos, badges, botones o textos de interfaz palabras enteramente en mayúsculas (evitar la clase `uppercase` o textos como `MONTO TOTAL`, `ÚLTIMA`, etc.). Deben utilizar formato Título o Capitalizado legible (Ejemplo: `Monto Total`, `Última`, `Gasto Directo`, `Recibir Traslado`).

### E. Diseño Responsivo y Móvil (Mobile First)
* **Cero desbordamiento horizontal:** Prohibidas las tablas HTML rígidas de muchas columnas en vistas móviles.
* **Visualización en Tarjetas (Cards):** Usar cuadrículas responsivas (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3`) con tarjetas independientes (`rounded-xl bg-[#283244] border border-[#324157] p-3.5`).
* **Encabezados estándar:** Usar siempre `<PageHeader>` con icono circular translúcido, título conciso, breve descripción y botón alineado.

---

## 3. Seguridad Multi-Sucursal y Lógica de Negocio

1. **Scoped Data (Path Isolation):** Todas las rutas de Firestore deben seguir el patrón: `sucursales/{sucursalId}/[coleccion]`.
2. **Validation:** Antes de cualquier escritura, verificar que `sucursalId` sea válido y esté presente en el contexto del hook `useSucursal`.
3. **Atomicidad:** Operaciones de Ventas, Stock y Correlativos deben usar `runTransaction`.
4. **Clock Sync:** Usar `serverTimestamp()` para registros financieros. No confiar en `new Date()` del cliente para persistencia.
5. **Form Cleanliness:** Ejecutar `resetForm()` tras guardados exitosos y cerrar modales.
6. **Manejo de Errores:** Usar el patrón `FirestorePermissionError` y `errorEmitter` para fallos de reglas de seguridad.

---

## 4. Componentes Disponibles en `@/components/comunes`

* `<PageHeader title="..." description="..." icon={...} action={...} />`
* `<PillTabs value={tab} onValueChange={setTab} tabs={[{ id, label, icon, count, badgeVariant }]} />`
* `<CountBadge count={num} variant="amber" | "white" | "emerald" | "sky" | "slate" />`
* `<SurfaceCard variant="panel" | "surface" | "subcard">`
