# ADR-003: shadcn/ui Zinc Design System & Inter Modern Typography

* **Status**: Accepted
* **Date**: 2026-09-16
* **Deciders**: Engineering & Product Team

## Context
The initial starter prototype utilized retro/quirky 'Space Grotesk' fonts and a teal/green tinted color palette with 22px bubbly radii. For professional enterprise, developer tool, and modern SaaS deployments, a cleaner, more disciplined design aesthetic was required.

## Decision
1. Adopt **Inter** as the foundational typography stack across light and dark modes with tight header tracking (`-0.025em`) and precise optical weights (400, 500, 600, 700).
2. Implement **shadcn/ui-inspired Zinc & Obsidian design tokens**:
   - Light mode: Pure white (`#ffffff`) and zinc (`#fafafa`) canvas with high-contrast dark carbon (`#18181b`) primary buttons and subtle 1px zinc borders (`#e4e4e7`).
   - Dark mode: Obsidian dark (`#09090b`) with elevated cards (`#121215`), zinc borders (`#27272a`), and high-contrast light buttons (`#fafafa`).
3. Standardize precision border radii (`--radius: 10px`, `--radius-sm: 6px`, `--radius-lg: 14px`) and micro-elevation shadows.
4. Clean up menu lists into structured three-column layouts (`icon`, `text`, `arrow`) with dedicated CSS classes.

## Consequences
* **Pros**:
  - High-end, modern, crisp visual presentation matching standard modern SaaS conventions.
  - Improved readability, contrast, and layout stability.
  - Seamless dark/light theme switching with zero style regressions.
* **Cons**:
  - Less quirky branding; differentiation relies on domain content, brand marks, and product features.
