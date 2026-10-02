/**
 * Shared by the server layout and the client stores (lib/i18n.tsx,
 * lib/theme.tsx), so it lives outside any "use client" module — a server
 * component importing a plain value from one gets a client reference, not the
 * value.
 */

export const LANG_KEY  = "mm:lang"
export const THEME_KEY = "mm:theme"

/** <meta name="theme-color"> per theme — the browser chrome around the page. */
export const THEME_COLOR = { dark: "#0a0a0a", light: "#f3f3f1" } as const

/**
 * Inlined into <head>: sets the language (lang/dir) and the theme (data-theme)
 * before the first paint, so the server-rendered boot drawing is already
 * mirrored and already the right colours. Dependency-free on purpose.
 *
 * The language is remembered; the theme is not. Every visit starts dark — the
 * site's own look — and inverted mode is something to try, not a setting that
 * follows you. `?theme=light` still opens it deliberately (a shared link).
 * The old saved choice is cleared, so anyone who tried light mode before this
 * isn't stuck in it.
 */
export const PREFS_BOOT = `(function(){try{var h=document.documentElement,q=new URLSearchParams(location.search);var l=q.get("lang");l=l==="ar"||l==="en"?l:localStorage.getItem("${LANG_KEY}");if(l==="ar"){h.lang="ar";h.dir="rtl"}try{localStorage.removeItem("${THEME_KEY}")}catch(e){}var t=q.get("theme");if(t==="light"){h.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLOR.light}")}}catch(e){}})()`
