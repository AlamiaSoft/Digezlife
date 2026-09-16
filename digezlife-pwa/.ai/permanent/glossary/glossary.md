# Project Glossary & Terminology

| Term | Definition |
| :--- | :--- |
| **App Shell** | The minimal HTML, CSS, and JavaScript required to power the user interface (header, bottom navigation, container) cached locally for instant offline loading. |
| **PWA (Progressive Web App)** | Web application leveraging service workers and web manifests to deliver app-like experiences, standalone window display, and offline support on iOS/Android. |
| **Bottom Navigation** | Mobile standard persistent navigation bar pinned to the bottom of the screen (`.bottom-nav`), accommodating safe-area insets. |
| **Web Awesome** | Library of accessible, standard web components (`@awesome.me/webawesome`) used for form controls, buttons, and selects. |
| **State Screen** | Visual fallback views rendered during edge cases, such as `.status-banner.offline`, `.state-card.empty`, or `.state-card.unavailable`. |
| **Data Adapter** | The abstraction layer decoupling UI rendering logic from data persistence (local mock, IndexedDB, or REST API). |
| **Safe-Area Inset** | CSS environment variables (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) that protect UI elements from mobile notches and home indicators. |
