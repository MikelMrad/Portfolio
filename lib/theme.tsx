"use client"
import { useSyncExternalStore } from "react"
import { THEME_COLOR } from "./lang-boot"

/**
 * Dark (the default) or inverted. Like the language, it lives on <html> — as
 * data-theme — because the colours are CSS's job: every token, glow and
 * hairline is a variable (globals.css, "Inverted mode"). React only needs to
 * know for the one thing CSS can't reach, the WebGL arrow field.
 */

export type Theme = "dark" | "light"

const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }
const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark")

export function useThemeStore(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark")
}

function apply(theme: Theme) {
  const h = document.documentElement
  if (theme === "light") h.dataset.theme = "light"
  else delete h.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme])
  // Not saved: every visit starts dark (see PREFS_BOOT).
  listeners.forEach((fn) => fn())
}

/**
 * Flip the theme, as a circle growing out of the point that was pressed.
 *
 * Built only from properties the GPU animates (transform, opacity), in three
 * beats: a disc of the *new* background scales out from the button until it
 * covers the screen; under that cover the theme flips; the cover fades away.
 *
 * It used to be a View Transition revealing the new page through an animated
 * clip-path. That was smooth for the first half and juddered for the rest:
 * clip-path isn't composited, so every frame repainted the revealed area on
 * the main thread, and that area grows with the square of the radius. Here the
 * one expensive moment — restyling every element for the new tokens — happens
 * while the disc hides it.
 */
const GROW_MS = 560
const FADE_MS = 340
let switching = false

export function toggleTheme(origin: { x: number; y: number }) {
  const next: Theme = read() === "light" ? "dark" : "light"
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(next); return }
  if (switching) return
  switching = true

  const { x, y } = origin
  // Radius to the furthest corner, so the disc covers the whole screen.
  const r = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)))
  const disc = document.createElement("div")
  disc.setAttribute("aria-hidden", "true")
  Object.assign(disc.style, {
    position: "fixed",
    left: `${x - r}px`,
    top: `${y - r}px`,
    width: `${2 * r}px`,
    height: `${2 * r}px`,
    borderRadius: "50%",
    background: THEME_COLOR[next],
    // Over the page and the dock, under the film grain and the cursor.
    zIndex: "9990",
    pointerEvents: "none",
    transform: "scale(0)",
    willChange: "transform, opacity",
  })
  document.body.appendChild(disc)

  const grow = disc.animate(
    [{ transform: "scale(0)" }, { transform: "scale(1)" }],
    { duration: GROW_MS, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
  )
  grow.finished
    .then(() => {
      apply(next)
      // Two frames: one for React to re-render the WebGL colour and the
      // toggle, one for the browser to paint the new theme under the disc.
      return new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())))
    })
    .then(() => disc.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: FADE_MS, easing: "ease-out", fill: "forwards" },
    ).finished)
    .catch(() => apply(next))
    .finally(() => { disc.remove(); switching = false })
}
