# Repository Index & Component Map

## 1. Top-Level Directory Layout

```
premium-pwa-starter-kit/
├── .agents/                 <-- AI workspace behavior instructions
│   └── AGENTS.md
├── .ai/                     <-- Canonical AI knowledge base
│   ├── permanent/           <-- Architecture, ADRs, glossary, standards
│   ├── transient/           <-- Current sprint status, backlog, handoffs
│   ├── indexes/             <-- Concept & dependency maps
│   └── lessons/             <-- Debugging & operational takeaways
├── app/                     <-- Next.js layout & page fallback
│   ├── globals.css          <-- Tailwind / Next base styling
│   ├── layout.tsx           <-- Root HTML & meta definitions
│   └── page.tsx             <-- Minimal shell presentation
├── public/                  <-- Static PWA assets served directly
│   ├── manifest.webmanifest <-- PWA metadata (standalone, theme colors)
│   ├── sw.js                <-- Service worker for offline shell caching
│   ├── icons/               <-- High-res SVG icons
│   └── *.png, *.svg         <-- Favicons, apple touch icons, placeholder logos
├── src/                     <-- Core PWA application logic
│   ├── main.js              <-- Application state machine & screen markup
│   └── styles.css           <-- Design tokens, safe-areas, dark theme
├── dist/                    <-- Production build distribution output
├── index.html               <-- Web entrypoint with Web Awesome imports
├── package.json             <-- Project manifest & scripts
├── vite.config.js / mjs     <-- Vite development server & build bundler
└── tsconfig.json            <-- TypeScript configuration
```

---

## 2. Concept to File Mapping

| Architectural Concept | Primary File / Path | Key Symbols / Exports |
| :--- | :--- | :--- |
| **PWA Manifest** | `public/manifest.webmanifest` | `name`, `short_name`, `icons`, `theme_color` |
| **Service Worker & Offline** | `public/sw.js` | `CACHE_NAME`, `fetch` interceptor, `install` cache |
| **UI State & Screen Routing** | `src/main.js` | `state`, `render()`, `act()`, `screenMarkup()` |
| **Screen Composers** | `src/main.js` | `homeMarkup()`, `activityMarkup()`, `searchMarkup()`, `profileMarkup()` |
| **Design System & Tokens** | `src/styles.css` | `:root`, `[data-theme="dark"]`, `.app-shell`, `.bottom-nav` |
| **UI Primitives** | `node_modules/@awesome.me/webawesome` | `.wa-button`, `.wa-input`, `.wa-select` |
| **Production HTML** | `index.html` | `#app`, module scripts |
