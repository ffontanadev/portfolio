# DevZone: Dark Mode + Free Text — Design

**Date:** 2026-07-06
**Branch:** `feature/devzone-darkmode`
**Scope:** The DevZone whiteboard screen only (`src/components/DevZone/**`). No other page is touched.

## Summary

Two features for the DevZone whiteboard:

1. **Dark mode** — a persisted switch that flips the *entire DevZone chrome* (canvas,
   dot grid, widgets, toolbar, dock, zoom controls, header) between a light and a dark
   palette. Scoped to the DevZone screen; the rest of the site is unaffected.
2. **Free text** — replaces the old boxed "note" widget. Press **`T`**, click the
   canvas, and type. Text has **no card and no background**, sits directly on the
   canvas, and is **freely resizable** by dragging a corner handle that scales the
   font size. Width auto-fits the content.

## Decisions (locked during brainstorming)

- Notes are **replaced** by free text — a single text element type going forward.
- "Freely resizable" = **drag a corner handle to scale the font size**; width auto-fits.
- Dark mode restyles the **whole DevZone chrome** (not just the canvas surface).
- The switch lives in the **toolbar** (and the mobile controls sheet) and **persists**
  to `localStorage`.
- Default theme is **light** (no `prefers-color-scheme` read), consistent with the site.
- After placing one text element, the tool **reverts to `select`**.
- `NoteWidget` is **removed** entirely (not kept dormant).
- Theming mechanism: **class-based Tailwind `dark:` variant scoped to a `.dz-dark`
  root class** (Approach A), plus dark overrides for the global `.glass-card` /
  `.custom-scrollbar` utilities.

---

## Architecture

### Theme state — `useDevZoneTheme`

New hook `src/components/DevZone/hooks/useDevZoneTheme.ts`:

- Returns `{ theme: 'light' | 'dark', toggleTheme: () => void }`.
- Reads/writes `localStorage['portfolio.devzone.theme.v1']`; missing/invalid → `'light'`.
- Mirrors to `localStorage` on change (same guarded pattern as `useDevZoneLayout`).
- No system-preference read.

`DevZone.tsx` calls the hook and applies `dz-dark` to its root `<div>` when
`theme === 'dark'`.

### Theming mechanism (Approach A)

In `src/index.css`:

- Register a scoped custom variant so `dark:` utilities only match inside DevZone:
  ```css
  @custom-variant dark (&:where(.dz-dark, .dz-dark *));
  ```
- Add dark overrides for the hand-rolled utilities that widgets rely on:
  ```css
  .dz-dark .glass-card { /* dark glass surface, border, shadow */ }
  .dz-dark .custom-scrollbar { /* dark track/thumb */ }
  ```
- Because the variant is bound to `.dz-dark`, no `dark:` utility can affect any other
  page (verified: no `dark:` variant usage exists elsewhere in the app today).

Each DevZone component gains `dark:` counterparts on its color utilities, e.g.
`text-dark-900/70` → also `dark:text-cream-50/70`, `bg-cream-50` →
`dark:bg-dark-900`, `border-dark-900/10` → `dark:border-cream-50/10`. Active-button
styling `bg-dark-900 text-cream-50` inverts to `dark:bg-cream-50 dark:text-dark-900`.

### Files touched for dark mode

- `DevZone.tsx` — root `dz-dark` class; canvas background + dot-grid color; header
  text/link; empty-board hint.
- `Widget.tsx` — glass frame relies on `.glass-card` override; header border, grip,
  icon, title, pin/close buttons get `dark:` color variants.
- `Toolbar.tsx` — cluster, `ToolButton` states, color-swatch ring offset; **+ theme toggle button**.
- `MobileControls.tsx` — sheet, `IconButton`/`Row`, dividers, status picker; **+ theme toggle entry**.
- `Dock.tsx` — `DockButton` states, status picker, divider.
- `ZoomControls.tsx` — button colors, divider.
- Widget bodies (`MusicPlayerWidget`, `PomodoroWidget`, `StatusListenerWidget`,
  `ImageWidget`) — audit each for hardcoded `text-dark-900` / `bg-*` that need `dark:`
  variants for legibility.

> This is ~8 files, above the CLAUDE.md "5-file" auto-stop threshold — flagged
> deliberately. The implementation plan stages this: (1) theme state + `.dz-dark`
> scaffolding + `index.css`, (2) chrome components, (3) widget bodies.

### Toggle UI

- `Toolbar.tsx`: a sun/moon `ToolButton` (lucide `Sun` / `Moon`) appended to the
  cluster, `iconOnly`, wired to `toggleTheme`. `DevZone` passes `theme` + `onToggleTheme`.
- `MobileControls.tsx`: matching entry (its own row or alongside tools), same props.
- i18n: new key `devZone.toolbar.theme` → "Theme" / localized. Added to all four
  locale files (`en`, `es`, `pt`, `zh`).

---

### Free text element

#### Types (`types.ts`)

- `WidgetType`: `'music' | 'pomodoro' | 'status' | 'text' | 'image'` (`'note'` removed).
- `WidgetInstance`: add `fontSize?: number` (world px). `text?: string` stays (now the
  text element's content). `width`/`height` remain image-only.
- `CanvasTool`: `'select' | 'draw' | 'erase' | 'text'`.

#### Migration (`useDevZoneLayout.ts` → `readLayout`)

- `WIDGET_TYPES` becomes the new set. Validation additionally accepts `type: 'note'`
  transiently, then `readLayout` maps each `note` widget to
  `{ ...w, type: 'text', fontSize: w.fontSize ?? DEFAULT_FONT_SIZE }`.
- Guarantees existing persisted boards (which contain `note` widgets) load without
  falling back to the default layout.

#### Layout API changes (`useDevZoneLayout.ts`)

- `addNote(text, x, y)` → `addText(text, x, y)` — creates a `text` widget with
  `DEFAULT_FONT_SIZE`.
- `updateNote(id, text)` → `updateText(id, text)`.
- New `setTextFontSize(id, size: number)` — clamps to `[FONT_MIN, FONT_MAX]`
  and updates the widget.
- Constants (defined near the top of `useDevZoneLayout.ts` or `types.ts`):
  `DEFAULT_FONT_SIZE = 16`, `FONT_MIN = 10`, `FONT_MAX = 96` (world px).
- `makeId('text')` etc. unchanged.

#### `TextWidget.tsx` (new, frameless)

Replaces `NoteWidget.tsx` (which is deleted). Renders **no card / no background** —
just text on the canvas. Lives inside the world (pan/zoom) layer alongside other widgets.

- **Container:** a `motion.div` positioned at `instance.x/y`, draggable via
  framer-motion (same pattern as `Widget.tsx`: `useMotionValue` x/y, `dragMomentum
  false`, `onDragEnd → onMove`, sync from props on external change). Dragging is
  suspended while a drawing tool is active (`interactive` prop) or while editing.
- **Content:** a `contentEditable` `<div>` (`whiteSpace: pre-wrap`, `outline: none`,
  transparent background), font `var(--font-body)` or `--font-mono` (match old note's
  mono for consistency), `fontSize: instance.fontSize`, color
  `text-dark-900 dark:text-cream-50`. Placeholder shown when empty (via CSS
  `:empty::before` using `data-placeholder`).
- **States:**
  - *idle* — pointer-drag moves it; click selects; double-click (or the placement
    click) enters edit.
  - *selected* — thin focus ring/outline + a bottom-right **corner handle**; a small
    remove affordance (reuse `X`) shown near it.
  - *editing* — caret active, keyboard captured. On blur: save; if trimmed content is
    empty, `onRemove(id)`.
- **Font scaling:** pointer-drag on the corner handle updates `fontSize` live via
  `onSetFontSize(id, size)`. Mapping: `next = clamp(startSize * (1 + dy / K))` (K tuned
  for feel), clamped `[FONT_MIN, FONT_MAX]`. Handle deltas are in the scaled world
  layer; framer's `transformPagePoint` already accounts for zoom for drags — the handle
  uses raw pointer deltas divided by `zoom` (passed in) so scaling feels 1:1 on screen.
- **Selection/focus:** clicking calls `onFocus(id)` to raise z. Clicking empty canvas
  deselects (DevZone tracks `selectedTextId`, cleared on viewport pointer-down on bare
  background).

#### Rendering (`DevZone.tsx`)

- Import `TextWidget`; `renderWidget` `case 'text'` → `<TextWidget … onUpdate={updateText}
  onSetFontSize={setTextFontSize} zoom={zoom} selected={…} onSelect={…} />`.
- Remove `NoteWidget` import and `case 'note'`.

---

### Creation & keyboard (`DevZone.tsx`)

- **`T` shortcut:** in the existing keydown effect (or a sibling), when
  `!isEditableTarget(document.activeElement)` and no Ctrl/Cmd/Alt modifier and
  `key === 't'` → `setTool('text')`. **`Escape`** → `setTool('select')`.
- **Placement:** the drawing overlay already intercepts pointers when `tool !== 'select'`.
  Add a `text` branch: on pointer-down (or click) while `tool === 'text'`, compute the
  world point via `toWorld`, call `addText('', worldX, worldY)`, mark the new id as
  selected + editing, then `setTool('select')`.
- **Paste text:** the paste handler's `addNote(...)` call becomes `addText(...)`,
  creating a text element at the viewport center (no more `-160/-70` box offset; use a
  small caret-anchored offset).

### Undo / redo (`useHistory.ts`)

Extend `signature` to include `fontSize`:

```
`${w.id}:${w.x},${w.y},${w.pinned?1:0},${w.text ?? ''},${w.src?1:0},${w.width ?? ''},${w.height ?? ''},${w.fontSize ?? ''}`
```

So create / move / edit / font-scale / delete of text elements each produce an undo
step, matching prior note behavior.

---

## Data flow

```
useDevZoneTheme ── theme ──▶ DevZone root (.dz-dark) ──▶ Tailwind dark: variants + .glass-card override
                └ toggleTheme ◀── Toolbar / MobileControls toggle

T key / overlay click ─▶ setTool('text') ─▶ addText('',x,y) ─▶ layout + select+edit ─▶ setTool('select')
TextWidget edit ─▶ updateText(id,text) ─┐
TextWidget handle drag ─▶ setTextFontSize(id,size) ─┼─▶ useDevZoneLayout.setLayout ─▶ localStorage
TextWidget drag ─▶ moveWidget(id,x,y) ─┘         └─▶ useHistory snapshot (undo/redo)
```

## Error handling / edge cases

- **Empty text on blur** → element removed (no stray empty text nodes).
- **Font clamp** → `[FONT_MIN, FONT_MAX]` prevents zero/huge sizes.
- **Migration** → legacy `note` widgets convert to `text`; unknown widget shapes still
  fall back to the default layout as today.
- **Keyboard guard** → `T`/`Escape` ignored while typing in any editable target
  (`isEditableTarget` already covers `contentEditable`).
- **localStorage unavailable** (private mode/quota) → theme + layout writes are wrapped
  in try/catch (existing pattern); defaults apply.
- **Dark-mode leakage** → the `dark:` variant is bound to `.dz-dark`; confirm no other
  component uses a `dark:` utility before shipping.

## Testing / verification

No unit-test harness exists for DevZone today, so verification is end-to-end via the
running app (`webapp-testing` / Playwright):

1. Toggle dark mode → whole chrome flips; reload → choice persists; other pages
   unaffected.
2. Press `T`, click, type → text appears with no background; drag to move; drag corner
   handle → font scales; blur empty → removed; delete via affordance.
3. Undo/redo covers create/move/edit/scale/delete.
4. Load a board saved with a legacy `note` widget → it renders as text (migration).

Optional (out of scope unless requested): introduce a component test setup.

## Out of scope

- Site-wide dark theme (Hero, Contact, etc.).
- Per-text color / rich formatting (text uses the single theme foreground color).
- Resizable text *box* with wrapping (chosen model is corner-handle font scaling).
- New test infrastructure.
