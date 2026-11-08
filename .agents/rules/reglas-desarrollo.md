# Reglas Oficiales de Desarrollo y Diseño - Pool Control

Este documento es de cumplimiento **ESTRICTO Y OBLIGATORIO** para cualquier modificación de código en el proyecto. Debe consultarse como lista de comprobación antes de comenzar cualquier cambio.

---

## 1. Protocolo Obligatorio Antes de Modificar Código (Pre-Flight Checklist)

Antes de escribir o editar cualquier archivo:
1. **Revisar componentes comunes:** Verificar si lo solicitado se resuelve con los componentes del Design System en `@/components/comunes` (`PageHeader`, `PillTabs`, `CountBadge`, `SurfaceCard`).
2. **Prohibido el código monolítico:** Si una página supera las 250-300 líneas, es **obligatorio** dividirla:
   - Mover la lógica y Firestore a un Custom Hook (`use[Modulo].ts`).
   - Mover las vistas secundarias y tarjetas a subcomponentes en `_components/`.
3. **Control de Versión:** Incrementar el número de compilación (`build`) en `src/lib/version.ts` en **cada respuesta que contenga cambios de código**.
4. **Prohibido el auto-commit / auto-push:** Jamás ejecutar `git commit`, `git tag` o `git push` por iniciativa propia. Esperar la instrucción explícita del usuario (ej. *"publica los cambios"*).

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

### D. Tipografía y Capitalización (Prohibido ALL-CAPS)
* **Cero mayúsculas sostenidas:** Prohibido el uso de la clase `uppercase` o textos como `NUEVO TRASLADO`, `MONTO TOTAL`, `EN TRÁNSITO`.
* Usar siempre **Tipo Título** o capitalización normal: `Nuevo Traslado`, `Monto Total`, `En Tránsito`.

### E. Diseño Responsivo y Móvil (Mobile First)
* **Cero desbordamiento horizontal:** Prohibidas las tablas HTML rígidas de muchas columnas en vistas móviles.
* **Visualización en Tarjetas (Cards):** Usar cuadrículas responsivas (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3`) con tarjetas independientes (`rounded-xl bg-[#283244] border border-[#324157] p-3.5`).
* **Encabezados estándar:** Usar siempre `<PageHeader>` con icono circular translúcido, título conciso, breve descripción y botón alineado.

---

## 3. Reglas de Programación y Arquitectura

1. **Aislamiento Multi-Sucursal:** Todas las consultas y escrituras en Firestore deben aislarse estrictamente bajo la ruta `sucursales/{sucursalId}/[coleccion]`.
2. **Atomicidad Financiera e Inventario:** Operaciones de stock, compras, ventas y traslados deben utilizar transacciones (`runTransaction`) o batch writes para garantizar coherencia.
3. **Tiempos y Fechas:** Usar `serverTimestamp()` para persistencia en base de datos. Usar `format(..., { locale: es })` de `date-fns` para despliegue al usuario.
4. **Manejo Limpio de Formularios:** Restablecer estados y formularios (`reset()`) tras confirmaciones exitosas y cerrar los modales correspondientes.

---

## 4. Componentes Disponibles en `@/components/comunes`

* `<PageHeader title="..." description="..." icon={...} action={...} />`
* `<PillTabs value={tab} onValueChange={setTab} tabs={[{ id, label, icon, count, badgeVariant }]} />`
* `<CountBadge count={num} variant="amber" | "white" | "emerald" | "sky" | "slate" />`
* `<SurfaceCard variant="panel" | "surface" | "subcard">`
