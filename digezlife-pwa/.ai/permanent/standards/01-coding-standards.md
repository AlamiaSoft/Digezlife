# Coding Standards & Design System Guidelines

## 1. CSS Design Tokens (`src/styles.css`)
All styling MUST use the semantic variables declared in `:root` and `[data-theme="dark"]`. Follow shadcn/ui aesthetic principles with micro-elevation, precision radiuses, and neutral-first color hierarchy.

### Token Palette
* **Surfaces**:
  * `--bg`: Canvas background (`#fafafa` in light, `#09090b` in dark)
  * `--surface`: Primary card/container background (`#ffffff` in light, `#121215` in dark)
  * `--surface-2`: Subtle background/hover state (`#f4f4f5` in light, `#18181b` in dark)
  * `--line`: Structural border color (`#e4e4e7` in light, `#27272a` in dark)
* **Primary & Accent**:
  * `--primary`: High-contrast primary action (`#18181b` in light, `#fafafa` in dark)
  * `--accent`: Focus & active accent (`#2563eb` / `#3b82f6` Indigo / Royal Blue)
  * `--radius`: Precision curve (`10px`, `--radius-sm: 6px`, `--radius-lg: 14px`)
* **Typography & Tone**:
  * Font Family: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
  * Heading Tracking: `letter-spacing: -0.025em;`
  * `--text`: Primary text (`#09090b` in light, `#f4f4f5` in dark)
  * `--muted`: Secondary text (`#71717a` in light, `#a1a1aa` in dark)
  * Tone tags: `.blue`, `.purple`, `.emerald`, `.amber`

---

## 2. Mobile & Safe-Area Constraints
1. **Viewport Meta**: Always ensure `viewport-fit=cover` in `index.html` and `app/layout.tsx`.
2. **Safe-Area Insets**:
   - Header top padding: `padding-top: calc(14px + env(safe-area-inset-top));`
   - Bottom navigation bottom padding: `padding-bottom: calc(8px + env(safe-area-inset-bottom));`
3. **Touch Targets**: All interactive elements (`.nav-item`, `.wa-button`, `.menu-row`, `.chip`) must maintain a minimum touch target of **44x44px**.

---

## 3. JavaScript & State Rules
1. **Unidirectional Data Flow**: State transitions must go through `act(actionName)` or set `state.screen = target` followed by `render()`.
2. **Event Delegation**: Use `data-action`, `data-filter`, and `data-search` attributes to bind interactions rather than inline `onclick="..."`.
3. **Clean DOM Re-renders**: Keep templates functional and pure. Use helper composers (`homeMarkup()`, `activityMarkup()`, etc.) that return clean HTML template literals.
4. **Toast Feedback**: For non-blocking asynchronous actions (copying links, saving drafts), invoke `showToast(message)` to provide instant visual feedback.

---

## 4. Accessibility & Web Primitives
1. **Semantic Elements**: Use `<header>`, `<main>`, `<nav>`, `<article>`, and `<section>` with proper `aria-label` tags.
2. **Web Awesome Integration**: Use `@awesome.me/webawesome` elements (`wa-button`, `wa-input`, `wa-select`) to ensure accessible form controls and ARIA attributes out of the box.
3. **Theme Persistence**: Theme changes must sync immediately to `localStorage['alamia-theme']` and update `document.documentElement.dataset.theme`.
