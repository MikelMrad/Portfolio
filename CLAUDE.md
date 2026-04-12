# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Next.js Turbopack)
npm run build    # production build
npm run lint     # ESLint
npm run start    # serve production build
```

No test suite is configured.

## Stack

- **Next.js 16.2.3** with App Router and React Compiler (`reactCompiler: true` in `next.config.ts`) — see AGENTS.md note about breaking changes
- **React 19** — treat all components as potentially compiled; avoid patterns the React Compiler can't handle (e.g., manual memoization)
- **Tailwind CSS v4** — configured via `@theme {}` blocks in CSS, not `tailwind.config.*`. Custom tokens live in `app/globals.css`
- **Three.js** via `@react-three/fiber` (v9) and `@react-three/drei` (v10)
- **Lenis** for smooth scrolling

## Architecture

The portfolio is built as a series of full-screen **scroll-driven sections**. The core scroll pattern:

1. **`LenisProvider`** (`components/providers/lenis-provider.tsx`) — wraps the entire app in a `useEffect`-driven Lenis instance. Does not expose a context; it only initializes the smooth scroll RAF loop.

2. **`ZStage`** (`components/sections/z-stage.tsx`) — a section with `height: 150vh` and a `sticky` inner viewport. On each animation frame it computes a normalized `progress` value (0–1) based on how far the sticky container has been scrolled through, and stores it in a **`useRef`** (not `useState`) to avoid React re-renders.

3. **`Scene`** (`components/three/scene.tsx`) — a `<Canvas>` that receives `progressRef`. `CameraRig` reads `progressRef.current` inside `useFrame` to animate the camera flying from `z=15` toward a manifesto text at `z=-25`, with no React state involved. An occluder mesh (`meshBasicMaterial`, same color as background) hides the manifesto text until the camera has passed through the title plane.

**Key pattern:** scroll progress flows as a ref through the component tree so that Three.js animation runs at 60fps without triggering any React reconciliation.

## Design tokens (globals.css)

| Token | Value |
|---|---|
| `bg` | `#0a0a0a` |
| `fg` | `#f0f0f0` |
| `mid` | `#666666` |
| `hairline` | `#1f1f1f` |
| `font-mono` | JetBrains Mono |
| `font-display` | Barlow Condensed |

Use these as Tailwind utilities (`bg-bg`, `text-fg`, `text-mid`, `font-mono`, `font-display`).

## Fonts

- **JetBrains Mono** and **Barlow Condensed** are loaded via `next/font/google` in `app/layout.tsx` and injected as CSS variables (`--font-jetbrains-mono`, `--font-barlow-condensed`).
- **Barlow Condensed Black** is also served as a local TTF at `public/fonts/BarlowCondensed-Black.ttf` for use inside the Three.js `<Text>` component (which cannot use CSS fonts).
