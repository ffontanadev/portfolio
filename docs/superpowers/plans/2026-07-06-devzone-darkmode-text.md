# DevZone Dark Mode + Free Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted dark-mode switch to the DevZone whiteboard and replace boxed "notes" with free, background-less text that is placed with the `T` key and scaled by dragging a corner handle.

**Architecture:** Dark mode is a class-based Tailwind `dark:` variant scoped to a `.dz-dark` root class on the DevZone container, plus dark overrides for the hand-rolled `.glass-card` / `.custom-scrollbar` utilities; a `useDevZoneTheme` hook persists the choice. Free text is a new frameless `TextWidget` (a framer-motion draggable with a transparent `contentEditable`) that replaces `NoteWidget`; the layout hook migrates legacy `note` widgets to the new `text` type on load.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), framer-motion, lucide-react, react-i18next. Package manager: **npm**.

## Global Constraints

- **No `any` types** — the codebase and CLAUDE.md forbid it; use precise types/type guards.
- **Scope: DevZone only** — changes live under `src/components/DevZone/**`, `src/index.css`, and `src/i18n/locales/*.json`. No other page/component changes.
- **Dark variant must be scoped** — the `dark:` custom variant is bound to `.dz-dark`; it must never affect any other page. No other component uses a `dark:` utility today.
- **Persistence keys:** theme → `portfolio.devzone.theme.v1`; layout stays `portfolio.devzone.layout.v1`. All `localStorage` access wrapped in try/catch (existing pattern).
- **Font-size constants:** `DEFAULT_FONT_SIZE = 16`, `FONT_MIN = 10`, `FONT_MAX = 96` (world px).
- **i18n:** every new user-facing string added to all four locales — `en`, `es`, `pt`, `zh`.
- **Verification cycle (no unit-test harness exists):** each task ends with `npx tsc -b` (must pass, 0 errors), `npm run lint` (no new errors), a described manual check in `npm run dev`, then a commit.
- **Commit style:** end messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Never skip hooks.

---

## File Structure

**Create:**
- `src/components/DevZone/hooks/useDevZoneTheme.ts` — theme state + persistence.
- `src/components/DevZone/widgets/TextWidget.tsx` — frameless draggable text element.

**Modify:**
- `src/index.css` — `@custom-variant dark`, `.dz-dark .glass-card`, `.dz-dark .custom-scrollbar`.
- `src/components/DevZone/DevZone.tsx` — theme wiring + `dz-dark` root, dark canvas/grid, text rendering, `T` shortcut, placement, selection, paste-as-text.
- `src/components/DevZone/Toolbar.tsx` — theme toggle button + dark variants.
- `src/components/DevZone/MobileControls.tsx` — theme toggle entry + dark variants.
- `src/components/DevZone/Widget.tsx`, `Dock.tsx`, `ZoomControls.tsx` — dark variants.
- `src/components/DevZone/widgets/{MusicPlayerWidget,PomodoroWidget,StatusListenerWidget,ImageWidget}.tsx` — dark variants for bodies.
- `src/components/DevZone/types.ts` — `WidgetType` (`text` replaces `note`), `CanvasTool` (+`text`), `WidgetInstance.fontSize`.
- `src/components/DevZone/useDevZoneLayout.ts` — constants, `addText`/`updateText`/`setTextFontSize`, migration.
- `src/components/DevZone/useHistory.ts` — add `fontSize` to snapshot signature.
- `src/i18n/locales/{en,es,pt,zh}.json` — new keys.

**Delete:**
- `src/components/DevZone/widgets/NoteWidget.tsx`.

## Dark-variant class mapping (used in Tasks 1–3)

Apply this lookup wherever a hardcoded light color appears on DevZone chrome. Keep the light class; **add** the `dark:` counterpart.

| Light class | Add dark counterpart |
|---|---|
| `bg-cream-50` | `dark:bg-dark-900` |
| `text-dark-900` | `dark:text-cream-50` |
| `text-dark-900/70` | `dark:text-cream-50/70` |
| `text-dark-900/40` (and `/35`, `/30`, `/25`) | `dark:text-cream-50/40` (match the ratio) |
| `bg-dark-900/5` (hover) | `dark:bg-cream-50/10` |
| `bg-dark-900/[0.03]` | `dark:bg-cream-50/[0.06]` |
| `border-dark-900/10` | `dark:border-cream-50/10` |
| `bg-dark-900/10` (dividers) | `dark:bg-cream-50/15` |
| active: `bg-dark-900 text-cream-50` | `dark:bg-cream-50 dark:text-dark-900` |
| ring: `ring-dark-900/70` / `ring-dark-900/15` | `dark:ring-cream-50/70` / `dark:ring-cream-50/15` |
| ring offset: `ring-offset-cream-50` | `dark:ring-offset-dark-900` |
| `bg-white` (MobileControls sheet) | `dark:bg-dark-800` |
| overlay `bg-dark-900/10` | `dark:bg-black/40` |

`text-coral-500` accents and `service.accent` swatches stay unchanged in both themes.

---

### Task 1: Dark-mode foundation — theme hook, `.dz-dark` scope, toolbar toggle, canvas + toolbar styling

**Files:**
- Create: `src/components/DevZone/hooks/useDevZoneTheme.ts`
- Modify: `src/index.css`
- Modify: `src/components/DevZone/DevZone.tsx`
- Modify: `src/components/DevZone/Toolbar.tsx`
- Modify: `src/i18n/locales/en.json`, `es.json`, `pt.json`, `zh.json`

**Interfaces:**
- Produces: `useDevZoneTheme(): { theme: 'light' | 'dark'; toggleTheme: () => void }`.
- Produces: `Toolbar` gains props `theme: 'light' | 'dark'` and `onToggleTheme: () => void`.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Create the theme hook**

Create `src/components/DevZone/hooks/useDevZoneTheme.ts`:

```ts
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'portfolio.devzone.theme.v1';

export type DevZoneTheme = 'light' | 'dark';

function readTheme(): DevZoneTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Owns the DevZone-scoped colour theme and mirrors it to localStorage so the
 * choice survives reloads. Defaults to light (no system-preference read) to stay
 * consistent with the rest of the site.
 */
export function useDevZoneTheme(): { theme: DevZoneTheme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<DevZoneTheme>(readTheme);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable (private mode / quota) — ignore. */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
```

- [ ] **Step 2: Add the scoped dark variant and glass overrides to `index.css`**

In `src/index.css`, immediately after the `@import "tailwindcss";` line (line 2), add:

```css
/* Dark mode is scoped to the DevZone screen: `dark:` utilities only apply
   under a `.dz-dark` ancestor, so no other page is affected. */
@custom-variant dark (&:where(.dz-dark, .dz-dark *));
```

Then, after the existing `.glass-card { … }` block (ends ~line 133), add:

```css
.dz-dark .glass-card {
  background: rgba(36, 36, 36, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 24px 60px -28px rgba(0, 0, 0, 0.55),
    0 2px 6px -2px rgba(0, 0, 0, 0.4);
}
```

After the `.custom-scrollbar` block (ends ~line 166), add:

```css
.dz-dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 248, 243, 0.05); }
.dz-dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 248, 243, 0.2); }
.dz-dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 248, 243, 0.32); }
.dz-dark .custom-scrollbar { scrollbar-color: rgba(255, 248, 243, 0.2) rgba(255, 248, 243, 0.05); }
```

- [ ] **Step 3: Add the i18n key `devZone.toolbar.theme` to all four locales**

In each of `en.json`, `es.json`, `pt.json`, `zh.json`, inside `devZone.toolbar`, add a `theme` key. Suggested values:
- en: `"theme": "Toggle theme"`
- es: `"theme": "Cambiar tema"`
- pt: `"theme": "Alternar tema"`
- zh: `"theme": "切换主题"`

Example (en.json `toolbar` block):

```json
    "toolbar": {
      "select": "Move",
      "draw": "Draw",
      "erase": "Erase",
      "clear": "Clear",
      "undo": "Undo",
      "redo": "Redo",
      "theme": "Toggle theme"
    },
```

- [ ] **Step 4: Wire the theme in `DevZone.tsx`**

In `src/components/DevZone/DevZone.tsx`:

1. Add import near the other hook imports (after line 9):
```ts
import { useDevZoneTheme } from './hooks/useDevZoneTheme';
```
2. Inside the component, after the `useDevZoneLayout()` / `useWhiteboardCanvas()` calls (~line 63), add:
```ts
  const { theme, toggleTheme } = useDevZoneTheme();
```
3. On the root `<div>` (line 355 `className={cn(...)}`), add the scope class:
```tsx
      className={cn(
        'fixed inset-0 touch-none overflow-hidden bg-cream-50 dark:bg-dark-900',
        theme === 'dark' && 'dz-dark',
        tool === 'select' && 'cursor-grab active:cursor-grabbing',
      )}
```
4. Dot-grid color depends on theme — update the root `style` `backgroundImage` (line 360). Replace the fixed rgba with a theme-driven one:
```tsx
      style={{
        backgroundImage: `radial-gradient(circle, ${
          theme === 'dark' ? 'rgba(255,248,243,0.10)' : 'rgba(26,26,26,0.08)'
        } 1px, transparent 1px)`,
        backgroundSize: `${22 * zoom}px ${22 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
```
5. Empty-board hint (line 417) — add dark text: change `text-dark-900/35` to `text-dark-900/35 dark:text-cream-50/35`.
6. Floating header (lines 424–435): on the `<Link>` change `text-dark-900/50` → add `dark:text-cream-50/50`; on the `<h1>` change `text-dark-900` → add `dark:text-cream-50`.
7. Pass the toggle to `Toolbar` (line 437 block), add props:
```tsx
        theme={theme}
        onToggleTheme={toggleTheme}
```

- [ ] **Step 5: Add the toggle button + dark variants to `Toolbar.tsx`**

In `src/components/DevZone/Toolbar.tsx`:

1. Import the icons — change line 2 to include `Moon, Sun`:
```ts
import { Eraser, Moon, MousePointer2, Pen, Redo2, Sun, Trash2, Undo2 } from 'lucide-react';
```
2. Extend `ToolbarProps` (after `canRedo: boolean;`):
```ts
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
```
3. Destructure `theme, onToggleTheme` in the component params.
4. In the cluster, after the Clear `ToolButton` (line 84) add a divider + toggle:
```tsx
        <span className="mx-1 h-6 w-px bg-dark-900/10 dark:bg-cream-50/15" aria-hidden="true" />
        <ToolButton
          icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          label={t('devZone.toolbar.theme')}
          active={theme === 'dark'}
          onClick={onToggleTheme}
          iconOnly
        />
```
5. Apply the class-mapping table to this file's existing classes:
   - divider (line 64): add `dark:bg-cream-50/15`.
   - `ToolButton` (lines 138–145): active `bg-dark-900 text-cream-50` → add `dark:bg-cream-50 dark:text-dark-900`; inactive `text-dark-900 hover:bg-dark-900/5` → add `dark:text-cream-50 dark:hover:bg-cream-50/10`; disabled `text-dark-900/25` → add `dark:text-cream-50/25`.
   - color swatch ring (lines 101–106): add `dark:ring-cream-50/70 dark:ring-offset-dark-900` and `dark:ring-cream-50/15`.

- [ ] **Step 6: Typecheck, lint**

Run:
```bash
npx tsc -b
npm run lint
```
Expected: `tsc` exits 0; lint reports no new errors.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, open the DevZone route. Verify:
- A sun/moon button appears in the top toolbar. Clicking it flips the canvas background to dark, the dot grid lightens, and all glass cards become dark glass.
- The toolbar buttons stay legible in dark; the active tool shows an inverted (light) pill.
- Reload the page → the dark choice persists.
- Navigate to the home page → it is unchanged (still light).

- [ ] **Step 8: Commit**

```bash
git add src/components/DevZone/hooks/useDevZoneTheme.ts src/index.css src/components/DevZone/DevZone.tsx src/components/DevZone/Toolbar.tsx src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "feat(devzone): dark-mode foundation, toolbar toggle, canvas + toolbar theming"
```

---

### Task 2: Dark styling for remaining chrome — Widget frame, Dock, ZoomControls, MobileControls

**Files:**
- Modify: `src/components/DevZone/Widget.tsx`
- Modify: `src/components/DevZone/Dock.tsx`
- Modify: `src/components/DevZone/ZoomControls.tsx`
- Modify: `src/components/DevZone/MobileControls.tsx`

**Interfaces:**
- Consumes: `Toolbar`'s `theme`/`onToggleTheme` pattern from Task 1 (mirror it for `MobileControls`).
- Produces: `MobileControls` gains props `theme: 'light' | 'dark'` and `onToggleTheme: () => void`.

- [ ] **Step 1: Widget.tsx dark variants**

Apply the class-mapping table to `src/components/DevZone/Widget.tsx`:
- header (line 82): `border-dark-900/10` → add `dark:border-cream-50/10`.
- grip icon (line 88): `text-dark-900/30` → add `dark:text-cream-50/30`.
- icon span (line 96): `text-dark-900/70` → add `dark:text-cream-50/70`.
- title (line 97): `text-dark-900` → add `dark:text-cream-50`.
- pin & close buttons (lines 104, 115): `text-dark-900/40 hover:bg-dark-900/5` → add `dark:text-cream-50/40 dark:hover:bg-cream-50/10` (keep `hover:text-coral-500`).

(The `.glass-card` frame background/border is already handled by Task 1's CSS override.)

- [ ] **Step 2: Dock.tsx dark variants**

Apply mapping to `src/components/DevZone/Dock.tsx`:
- status-picker hint (line 82): `text-dark-900/40` → add `dark:text-cream-50/40`.
- service buttons (lines 96–101): active `cursor-default text-dark-900/35` → add `dark:text-cream-50/35`; inactive `text-dark-900 hover:bg-dark-900/5` → add `dark:text-cream-50 dark:hover:bg-cream-50/10`.
- "added" label (line 109): `text-dark-900/35` → add `dark:text-cream-50/35`.
- divider (line 121): `bg-dark-900/10` → add `dark:bg-cream-50/15`.
- `DockButton` (lines 144–150): disabled `text-dark-900/30` → add `dark:text-cream-50/30`; active `bg-dark-900 text-cream-50` → add `dark:bg-cream-50 dark:text-dark-900`; inactive `text-dark-900 hover:bg-dark-900/5` → add `dark:text-cream-50 dark:hover:bg-cream-50/10`.

- [ ] **Step 3: ZoomControls.tsx dark variants**

Apply mapping to `src/components/DevZone/ZoomControls.tsx`:
- three buttons + readout (lines 23, 32, 41, 51): `text-dark-900 hover:bg-dark-900/5` → add `dark:text-cream-50 dark:hover:bg-cream-50/10`.
- divider (line 45): `bg-dark-900/10` → add `dark:bg-cream-50/15`.

- [ ] **Step 4: MobileControls.tsx dark variants + theme toggle**

In `src/components/DevZone/MobileControls.tsx`:
1. Import icons: add `Moon, Sun` to the lucide import (lines 3–19).
2. Extend `MobileControlsProps`:
```ts
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
```
3. Destructure `theme, onToggleTheme` in the component.
4. Sheet container (line 101): `glass-card bg-white` → change to `glass-card bg-white dark:bg-dark-800`.
5. Overlay (line 94): `bg-dark-900/10` → add `dark:bg-black/40`.
6. Apply mapping to: `IconButton` states (lines 294–300, same as `DockButton`), `Row` label (line 269 `text-dark-900/40` → add `dark:text-cream-50/40`), dividers (lines 123, 175, 203 → add `dark:bg-cream-50/15`), zoom readout button (line 170 → add `dark:text-cream-50 dark:hover:bg-cream-50/10`), status picker container (line 215 `bg-dark-900/[0.03]` → add `dark:bg-cream-50/[0.06]`), status buttons (lines 227–229), swatch rings (lines 150–155).
7. Add a theme toggle in the "Tools" row — after the Clear `IconButton` (line 140), add:
```tsx
                <span className="mx-1 h-7 w-px bg-dark-900/10 dark:bg-cream-50/15" aria-hidden="true" />
                <IconButton
                  icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  label={t('devZone.toolbar.theme')}
                  active={theme === 'dark'}
                  onClick={onToggleTheme}
                />
```
8. Floating toggle button (line 258): `text-dark-900` → add `dark:text-cream-50`.

- [ ] **Step 5: Pass theme props to MobileControls from DevZone.tsx**

In `src/components/DevZone/DevZone.tsx`, in the `<MobileControls … />` block (line 464), add:
```tsx
        theme={theme}
        onToggleTheme={toggleTheme}
```

- [ ] **Step 6: Typecheck, lint**

```bash
npx tsc -b
npm run lint
```
Expected: 0 type errors; no new lint errors.

- [ ] **Step 7: Manual verification**

`npm run dev` → DevZone in dark mode. Verify: widget frames, headers, pin/close buttons, dock, zoom controls are all legible. Resize to a narrow viewport (< 640px): the mobile controls sheet is dark, and its Tools row has a working sun/moon toggle.

- [ ] **Step 8: Commit**

```bash
git add src/components/DevZone/Widget.tsx src/components/DevZone/Dock.tsx src/components/DevZone/ZoomControls.tsx src/components/DevZone/MobileControls.tsx src/components/DevZone/DevZone.tsx
git commit -m "feat(devzone): dark theming for widget frame, dock, zoom, mobile controls"
```

---

### Task 3: Dark styling for widget bodies — Music, Pomodoro, Status, Image

**Files:**
- Modify: `src/components/DevZone/widgets/MusicPlayerWidget.tsx`
- Modify: `src/components/DevZone/widgets/PomodoroWidget.tsx`
- Modify: `src/components/DevZone/widgets/StatusListenerWidget.tsx`
- Modify: `src/components/DevZone/widgets/ImageWidget.tsx`

**Interfaces:**
- Consumes: `.glass-card` dark override (Task 1) and the class-mapping table.
- Produces: nothing new.

- [ ] **Step 1: Audit each widget body for hardcoded light colors**

For each file, search for `text-dark-900`, `bg-dark-900`, `bg-cream-50`, `border-dark-900`, `bg-white`, and ring/offset colors. For every match, add the `dark:` counterpart from the mapping table. Leave brand accents (`coral`, `teal`, `purple`, `service.accent`, station art) unchanged.

Run to list them:
```bash
npx tsc -b >/dev/null 2>&1; grep -nE "text-dark-900|bg-dark-900|bg-cream-50|border-dark-900|bg-white" src/components/DevZone/widgets/MusicPlayerWidget.tsx src/components/DevZone/widgets/PomodoroWidget.tsx src/components/DevZone/widgets/StatusListenerWidget.tsx src/components/DevZone/widgets/ImageWidget.tsx
```

- [ ] **Step 2: Apply dark variants**

Edit each of the four widget files, adding `dark:` counterparts per the mapping table for every match from Step 1. Typical cases: primary text `text-dark-900` → `dark:text-cream-50`; muted labels `text-dark-900/60|/50|/40` → matching `dark:text-cream-50/*`; input/control backgrounds `bg-dark-900/5` → `dark:bg-cream-50/10`; inner surfaces `bg-cream-50`/`bg-white` → `dark:bg-dark-900`/`dark:bg-dark-800`; hairlines `border-dark-900/10` → `dark:border-cream-50/10`.

- [ ] **Step 3: Typecheck, lint**

```bash
npx tsc -b
npm run lint
```
Expected: 0 type errors; no new lint errors.

- [ ] **Step 4: Manual verification**

`npm run dev` → dark mode. Add each widget from the dock (Radio, Pomodoro, a Status listener) and paste an image. Verify every widget body is legible in dark: labels, numbers, inputs, buttons, station/service names, the image frame. Toggle back to light and confirm nothing regressed.

- [ ] **Step 5: Commit**

```bash
git add src/components/DevZone/widgets/MusicPlayerWidget.tsx src/components/DevZone/widgets/PomodoroWidget.tsx src/components/DevZone/widgets/StatusListenerWidget.tsx src/components/DevZone/widgets/ImageWidget.tsx
git commit -m "feat(devzone): dark theming for music, pomodoro, status, image widget bodies"
```

---

### Task 4: Free-text element core — types, layout + migration, TextWidget, placement, `T` shortcut

**Files:**
- Modify: `src/components/DevZone/types.ts`
- Modify: `src/components/DevZone/useDevZoneLayout.ts`
- Create: `src/components/DevZone/widgets/TextWidget.tsx`
- Modify: `src/components/DevZone/DevZone.tsx`
- Delete: `src/components/DevZone/widgets/NoteWidget.tsx`
- Modify: `src/i18n/locales/{en,es,pt,zh}.json`

**Interfaces:**
- Produces (`types.ts`): `WidgetType = 'music' | 'pomodoro' | 'status' | 'text' | 'image'`; `CanvasTool = 'select' | 'draw' | 'erase' | 'text'`; `WidgetInstance.fontSize?: number`.
- Produces (`useDevZoneLayout.ts`): `addText(text: string, x: number, y: number): string` (returns new id); `updateText(id: string, text: string): void`; `setTextFontSize(id: string, size: number): void`; exported consts `DEFAULT_FONT_SIZE`, `FONT_MIN`, `FONT_MAX`.
- Produces (`TextWidget.tsx`): default export `TextWidget` with props `{ instance, interactive?, editing, selected, onMove, onFocus, onRemove, onUpdate, onSetFontSize, onSelect, onEditStart, onEditEnd, zoom }`. In this task the font-scaling handle is stubbed as non-interactive; `selected`/`onSetFontSize` are wired but the handle is added in Task 5.
- Consumes: `moveWidget`, `focusWidget`, `removeWidget` (existing).

- [ ] **Step 1: Update `types.ts`**

In `src/components/DevZone/types.ts`:
- Line 9: `export type WidgetType = 'music' | 'pomodoro' | 'status' | 'text' | 'image';`
- In `WidgetInstance`, update the note comment + field and add fontSize. Replace the `text?` doc/field and add:
```ts
  /** Text widgets carry their (editable) content. */
  text?: string;
  /** Font size for text widgets, in world px. */
  fontSize?: number;
```
- Line 46: `export type CanvasTool = 'select' | 'draw' | 'erase' | 'text';`

- [ ] **Step 2: Update `useDevZoneLayout.ts` — constants, migration, API**

In `src/components/DevZone/useDevZoneLayout.ts`:

1. After the version consts (line 5), add:
```ts
export const DEFAULT_FONT_SIZE = 16;
export const FONT_MIN = 10;
export const FONT_MAX = 96;
```
2. Line 44: `const WIDGET_TYPES: WidgetType[] = ['music', 'pomodoro', 'status', 'text', 'image'];`
3. Migration: make `isWidgetInstance` also accept legacy `'note'`, then convert in `readLayout`. Change the type check in `isWidgetInstance` (line 51) to:
```ts
    (WIDGET_TYPES.includes(w.type as WidgetType) || w.type === 'note') &&
```
   In `readLayout`, before returning the parsed layout (line 72), map legacy notes:
```ts
    const widgets = parsed.widgets.map((w) =>
      w.type === ('note' as WidgetType)
        ? { ...w, type: 'text' as WidgetType, fontSize: w.fontSize ?? DEFAULT_FONT_SIZE }
        : w,
    );
    return {
      version: LAYOUT_VERSION,
      zCounter: typeof parsed.zCounter === 'number' ? parsed.zCounter : widgets.length,
      widgets,
    };
```
4. Rename `addNote` → `addText` and return the id; set `fontSize`. Replace the `addNote` callback (lines 148–162):
```ts
  const addText = useCallback((text: string, x: number, y: number): string => {
    const id = makeId('text');
    setLayout((prev) => {
      const nextZ = prev.zCounter + 1;
      const widget: WidgetInstance = {
        id,
        type: 'text',
        text,
        fontSize: DEFAULT_FONT_SIZE,
        x: Math.round(x),
        y: Math.round(y),
        z: nextZ,
        pinned: false,
      };
      return { ...prev, zCounter: nextZ, widgets: [...prev.widgets, widget] };
    });
    return id;
  }, []);
```
5. Rename `updateNote` → `updateText` (lines 185–190): rename only; body identical.
6. Add `setTextFontSize` after `updateText`:
```ts
  const setTextFontSize = useCallback((id: string, size: number) => {
    const clamped = Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(size)));
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, fontSize: clamped } : w)),
    }));
  }, []);
```
7. Update the `DevZoneLayoutApi` interface (lines 88–104): replace `addNote` with `addText: (text: string, x: number, y: number) => string;`, `updateNote` with `updateText: (id: string, text: string) => void;`, and add `setTextFontSize: (id: string, size: number) => void;`.
8. Update the returned object (lines 233–246): `addText`, `updateText`, `setTextFontSize`.

- [ ] **Step 3: Create `TextWidget.tsx`**

Create `src/components/DevZone/widgets/TextWidget.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { DEFAULT_FONT_SIZE } from '../useDevZoneLayout';
import type { WidgetInstance } from '../types';

interface TextWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  editing: boolean;
  selected: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onSetFontSize: (id: string, size: number) => void;
  onSelect: (id: string) => void;
  onEditStart: (id: string) => void;
  onEditEnd: () => void;
  zoom: number;
}

/**
 * A free text element living directly on the whiteboard — no card, no
 * background. Drag to move, double-click to edit, and (Task 5) drag the corner
 * handle to scale the font size. Empty text is removed on blur.
 */
export default function TextWidget({
  instance,
  interactive = true,
  editing,
  selected,
  onMove,
  onFocus,
  onRemove,
  onUpdate,
  onSetFontSize: _onSetFontSize,
  onSelect,
  onEditStart,
  onEditEnd,
  zoom: _zoom,
}: TextWidgetProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(instance.x);
  const y = useMotionValue(instance.y);
  const draggable = interactive && !editing;

  useEffect(() => {
    if (x.get() !== instance.x) x.set(instance.x);
    if (y.get() !== instance.y) y.set(instance.y);
  }, [instance.x, instance.y, x, y]);

  // Focus the editor and place the caret at the end when entering edit mode.
  useEffect(() => {
    if (!editing) return;
    const el = editorRef.current;
    if (!el) return;
    if (el.innerText !== (instance.text ?? '')) el.innerText = instance.text ?? '';
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [editing, instance.text]);

  const commit = () => {
    const el = editorRef.current;
    const next = (el?.innerText ?? '').replace(/ /g, ' ');
    if (next.trim() === '') {
      onRemove(instance.id);
      onEditEnd();
      return;
    }
    if (next !== (instance.text ?? '')) onUpdate(instance.id, next);
    onEditEnd();
  };

  return (
    <motion.div
      data-widget="true"
      style={{
        x,
        y,
        scale: isMobile ? 0.9 : 1,
        transformOrigin: 'top left',
        zIndex: instance.z,
        touchAction: 'none',
      }}
      drag={draggable}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={() => {
        onFocus(instance.id);
        onSelect(instance.id);
      }}
      onDragEnd={() => onMove(instance.id, Math.round(x.get()), Math.round(y.get()))}
      onDoubleClick={() => onEditStart(instance.id)}
      className={cn(
        'absolute top-0 left-0 select-none',
        selected && 'outline outline-1 outline-coral-500/60',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-text',
      )}
    >
      <div
        ref={editorRef}
        contentEditable={editing}
        suppressContentEditableWarning
        data-placeholder={t('devZone.text.placeholder')}
        spellCheck={false}
        onBlur={commit}
        style={{ fontSize: `${instance.fontSize ?? DEFAULT_FONT_SIZE}px` }}
        className={cn(
          'min-w-[1ch] max-w-[60vw] whitespace-pre-wrap break-words bg-transparent font-mono leading-snug text-dark-900 outline-none dark:text-cream-50',
          'empty:before:text-dark-900/30 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-cream-50/30',
        )}
      >
        {editing ? undefined : instance.text}
      </div>
    </motion.div>
  );
}
```

> Note: `_zoom` and `_onSetFontSize` are intentionally unused in this task (underscore-prefixed to satisfy lint); Task 5 consumes them for the resize handle.

- [ ] **Step 4: Wire `TextWidget` into `DevZone.tsx` and remove NoteWidget**

In `src/components/DevZone/DevZone.tsx`:
1. Replace the NoteWidget import (line 17) with:
```ts
import TextWidget from './widgets/TextWidget';
```
2. Update the layout destructure (lines 49–61): `addNote` → `addText`, `updateNote` → `updateText`, add `setTextFontSize`.
3. Add selection/edit state near the other `useState` calls (~line 75):
```ts
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
```
4. In `renderWidget` (lines 331–344), replace the `note` case with:
```tsx
      case 'text':
        return (
          <TextWidget
            {...shared}
            editing={editingTextId === instance.id}
            selected={selectedTextId === instance.id}
            onUpdate={updateText}
            onSetFontSize={setTextFontSize}
            onSelect={setSelectedTextId}
            onEditStart={(id) => {
              setSelectedTextId(id);
              setEditingTextId(id);
            }}
            onEditEnd={() => setEditingTextId(null)}
            zoom={zoom}
          />
        );
```
   Note `shared` already provides `onRemove`, `onMove`, `onFocus`, `interactive`; `onTogglePin` is passed but unused by `TextWidget` (harmless). To avoid an unused-prop type error, `TextWidget`'s props omit `onTogglePin`; spreading `shared` includes it, which is fine because TS allows extra props via spread only if the type is exact — it is not exact here, so it passes. If lint/TS flags it, destructure `shared` without `onTogglePin` for this case.
5. Placement + deselect on the viewport: in `handleViewportPointerDown` (line 250), after the existing `tool !== 'select'` guard, clear selection when clicking bare canvas:
```ts
    if (tool === 'select' && event.target === event.currentTarget) {
      setSelectedTextId(null);
      setEditingTextId(null);
    }
```
   (Place this before the pan bookkeeping; keep the existing early returns intact.)
6. Text placement via the drawing overlay: the overlay intercepts pointers when `tool !== 'select'`. Add handlers for the `text` tool. Change `isDrawingTool` usage so the overlay is active for `text` too — it already is (`tool !== 'select'`). Add a dedicated pointer-down for text at the overlay (lines 403–413). Replace the overlay handler wiring with:
```tsx
        onPointerDown={
          tool === 'text'
            ? handleTextPlace
            : isDrawingTool
              ? handleDrawPointerDown
              : undefined
        }
        onPointerMove={tool === 'text' ? undefined : isDrawingTool ? handleDrawPointerMove : undefined}
        onPointerUp={tool === 'text' ? undefined : isDrawingTool ? handleDrawPointerUp : undefined}
```
   And update the overlay `className` cursor: add `tool === 'text' && 'cursor-text'`.
7. Add the `handleTextPlace` handler (near `handleDrawPointerDown`, ~line 284):
```tsx
  const handleTextPlace = (event: React.PointerEvent<HTMLDivElement>) => {
    const world = toWorld(event.clientX, event.clientY);
    const id = addText('', world.x, world.y);
    setSelectedTextId(id);
    setEditingTextId(id);
    setTool('select');
  };
```
8. `T` / `Escape` shortcuts: add a keydown effect (after the undo/redo effect, ~line 181):
```tsx
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(document.activeElement)) return;
      const key = event.key.toLowerCase();
      if (key === 't') {
        event.preventDefault();
        setTool('text');
      } else if (event.key === 'Escape') {
        setTool('select');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
```
9. Paste-as-text: in the paste handler, change `addNote(text, centerX - 160, centerY - 70)` (line 241) to:
```ts
        addText(text, centerX, centerY);
```
   Update the effect dependency array (line 247) from `[addNote, addImage]` to `[addText, addImage]`.

- [ ] **Step 5: Delete NoteWidget**

```bash
git rm src/components/DevZone/widgets/NoteWidget.tsx
```

- [ ] **Step 6: Replace note i18n keys with text keys in all four locales**

In `en/es/pt/zh.json`, rename the `devZone.note` block to `devZone.text` with a `placeholder` (drop `title`, unused by free text):
- en: `"text": { "placeholder": "Type text…" }`
- es: `"text": { "placeholder": "Escribe texto…" }`
- pt: `"text": { "placeholder": "Escreva um texto…" }`
- zh: `"text": { "placeholder": "输入文字…" }`

- [ ] **Step 7: Typecheck, lint**

```bash
npx tsc -b
npm run lint
```
Expected: 0 type errors; no new lint errors. If TS flags the spread `onTogglePin` on `TextWidget`, apply the destructure fallback noted in Step 4.4.

- [ ] **Step 8: Manual verification**

`npm run dev` → DevZone. Verify:
- Press `T` (cursor not in a field): the cursor over the canvas becomes a text caret. Click → a caret appears on the canvas with a placeholder, no box/background; type text; click away → text persists with no background.
- Drag the text to move it. Double-click to re-edit.
- Type nothing and click away → the empty text is removed.
- Paste text (Ctrl/Cmd+V with clipboard text) → appears as free text at center.
- Press `Esc` while the text tool is armed → returns to Move.
- Undo (Ctrl+Z) removes the last text; redo restores it.
- Reload with an existing board → old boxed notes now render as free text (migration). To test explicitly: before this task, create a note; after, reload — it appears as background-less text.

- [ ] **Step 9: Commit**

```bash
git add src/components/DevZone/types.ts src/components/DevZone/useDevZoneLayout.ts src/components/DevZone/widgets/TextWidget.tsx src/components/DevZone/DevZone.tsx src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "feat(devzone): replace boxed notes with free text (T tool, placement, migration)"
```

---

### Task 5: Text font scaling handle, selection affordances, undo coverage

**Files:**
- Modify: `src/components/DevZone/widgets/TextWidget.tsx`
- Modify: `src/components/DevZone/useHistory.ts`

**Interfaces:**
- Consumes: `onSetFontSize(id, size)` and `zoom` (already passed from Task 4); `FONT_MIN`/`FONT_MAX` from `useDevZoneLayout`.
- Produces: nothing new.

- [ ] **Step 1: Add `fontSize` to the history signature**

In `src/components/DevZone/useHistory.ts`, change the `widgetSig` line (line 28) to append `fontSize`:
```ts
        `${w.id}:${w.x},${w.y},${w.pinned ? 1 : 0},${w.text ?? ''},${w.src ? 1 : 0},${w.width ?? ''},${w.height ?? ''},${w.fontSize ?? ''}`,
```

- [ ] **Step 2: Implement the corner resize handle in `TextWidget.tsx`**

1. Add imports: `FONT_MIN, FONT_MAX` alongside `DEFAULT_FONT_SIZE`:
```ts
import { DEFAULT_FONT_SIZE, FONT_MAX, FONT_MIN } from '../useDevZoneLayout';
```
2. Remove the underscore prefixes: use `onSetFontSize` and `zoom` for real.
3. Add a resize ref/state and handler inside the component:
```tsx
  const resizeRef = useRef<{ startY: number; startSize: number } | null>(null);

  const onHandleDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      startY: event.clientY,
      startSize: instance.fontSize ?? DEFAULT_FONT_SIZE,
    };
  };
  const onHandleMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = resizeRef.current;
    if (!state) return;
    // Screen-space drag → world-space size: divide by zoom so it feels 1:1.
    const deltaWorld = (event.clientY - state.startY) / zoom;
    const next = Math.min(FONT_MAX, Math.max(FONT_MIN, state.startSize + deltaWorld));
    onSetFontSize(instance.id, next);
  };
  const onHandleUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizeRef.current = null;
  };
```
4. Render the handle + a remove affordance when `selected && !editing && interactive`. Add just before the closing `</motion.div>`:
```tsx
      {selected && !editing && interactive && (
        <>
          <button
            type="button"
            aria-label={t('devZone.widget.remove')}
            title={t('devZone.widget.remove')}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onRemove(instance.id)}
            className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-coral-500 text-white"
          >
            <X size={10} />
          </button>
          <button
            type="button"
            aria-label={t('devZone.text.resize')}
            title={t('devZone.text.resize')}
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full border border-white bg-coral-500 touch-none"
          />
        </>
      )}
```
5. Add `X` to the imports: `import { X } from 'lucide-react';`.

- [ ] **Step 3: Add the `devZone.text.resize` i18n key to all four locales**

Inside the `devZone.text` block in each locale:
- en: `"resize": "Resize text"`
- es: `"resize": "Redimensionar texto"`
- pt: `"resize": "Redimensionar texto"`
- zh: `"resize": "调整文字大小"`

- [ ] **Step 4: Typecheck, lint**

```bash
npx tsc -b
npm run lint
```
Expected: 0 type errors; no new lint errors (the previously-unused `zoom`/`onSetFontSize` are now consumed).

- [ ] **Step 5: Manual verification**

`npm run dev` → DevZone. Verify:
- Click a text once → a coral outline, a top-right remove dot, and a bottom-right resize dot appear.
- Drag the resize dot down → font grows; up → shrinks; it clamps at ~10px and ~96px. Feels 1:1 with the pointer at 100% zoom, and still tracks correctly when zoomed in/out.
- The remove dot deletes the text.
- Undo/redo now covers a font-size change (Ctrl+Z reverts the scale step).
- Clicking empty canvas deselects (outline/handles disappear).

- [ ] **Step 6: Commit**

```bash
git add src/components/DevZone/widgets/TextWidget.tsx src/components/DevZone/useHistory.ts src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "feat(devzone): text font-scaling handle, selection affordances, undo coverage"
```

---

### Task 6: Full end-to-end verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Clean typecheck, lint, and build**

```bash
npx tsc -b
npm run lint
npm run build
```
Expected: all succeed with 0 errors.

- [ ] **Step 2: Run the spec's E2E checklist in `npm run dev`**

Verify, in both a fresh board (clear `localStorage`) and an existing one:
1. **Dark mode:** toggle from toolbar → whole DevZone chrome (canvas, grid, all widgets, toolbar, dock, zoom, header, mobile sheet) flips; reload → persists; other site pages unaffected.
2. **Text:** `T` → click → type; no background; drag to move; drag corner handle → font scales freely; blur empty → removed; remove dot deletes; paste text creates a text element.
3. **Undo/redo:** covers text create / move / edit / scale / delete.
4. **Migration:** a board saved with a legacy `note` widget loads and renders as free text.
5. **Text legibility in dark mode:** text foreground flips with the theme (dark text on light, light text on dark).

- [ ] **Step 3: (Optional) Automated smoke via webapp-testing / Playwright**

If desired, drive the above with the `webapp-testing` skill: navigate to the DevZone route, click the theme toggle, assert the root has `dz-dark`; press `T`, click, type, and assert a `[data-widget]` text node with the typed content and no background color.

- [ ] **Step 4: Finalize**

No commit needed unless Step 1–2 surfaced fixes. If fixes were required, commit them:
```bash
git add -A && git commit -m "fix(devzone): address issues found in E2E verification"
```

---

## Self-Review

**Spec coverage:**
- Dark-mode switch (whole chrome, toolbar, persisted, DevZone-scoped) → Tasks 1–3. ✓
- `useDevZoneTheme` + `portfolio.devzone.theme.v1` + light default → Task 1. ✓
- `.dz-dark` scoped variant + glass/scrollbar overrides → Task 1. ✓
- Toggle in toolbar + mobile sheet → Tasks 1 & 2. ✓
- Free text replaces notes; `text` type; `fontSize`; `CanvasTool` `text` → Task 4. ✓
- Migration of legacy `note` widgets → Task 4. ✓
- `addText`/`updateText`/`setTextFontSize` → Task 4/5. ✓
- Frameless TextWidget (move/edit/no-bg, empty-on-blur removal) → Task 4. ✓
- `T` shortcut + Esc + overlay placement + revert to select → Task 4. ✓
- Paste-as-text → Task 4. ✓
- Corner-handle font scaling (clamped) → Task 5. ✓
- Undo/redo incl. `fontSize` → Task 5. ✓
- NoteWidget removed → Task 4. ✓
- Constants `DEFAULT_FONT_SIZE`/`FONT_MIN`/`FONT_MAX` → Task 4. ✓
- i18n across four locales → Tasks 1, 4, 5. ✓
- Verification E2E (no unit harness) → Task 6. ✓

**Placeholder scan:** No TBD/TODO. Dark-styling tasks use an explicit mapping table + per-file element lists with exact line references rather than vague "add dark styling" — concrete and actionable against the open files.

**Type consistency:** `addText` returns `string` (id) and is consumed as such in `handleTextPlace`; `updateText`/`setTextFontSize` signatures match between `useDevZoneLayout` and `TextWidget`/`DevZone`. `WidgetType`/`CanvasTool` unions consistent across `types.ts`, layout, and DevZone. `TextWidget` prop names match the `renderWidget` wiring. `fontSize` appears in the type, layout, TextWidget, and the history signature consistently.
