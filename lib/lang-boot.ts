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
 * The language: `?lang=`, else the visitor's saved choice from the toggle, else
 * the device's — Arabic only when the phone's first language is Arabic,
 * English for everyone else. The theme follows the device: light if the
 * visitor's phone or computer is set to light, dark otherwise — so the site
 * opens matching everything else on their screen. `?theme=light|dark` in a
 * link overrides it. The ◐ toggle lasts for the visit and isn't saved (an old
 * saved choice is cleared, so nobody is stuck in a mode they once tried).
 *
 * It also fixes in-app browsers that ignore `width=device-width`. LinkedIn's on
 * Android laid the page out ~980px wide and zoomed it out to fit: the desktop
 * dock and every card at a third of its size. A portrait touch screen whose
 * layout viewport is well over the screen's own width is that case; pinning the
 * width to `screen.width` (CSS px on Android) makes the WebView re-layout.
 * Portrait only, because iOS doesn't swap `screen.width` on rotation, so a
 * landscape iPhone would otherwise trip it.
 */
export const PREFS_BOOT = `(function(){try{var W=innerWidth,S=Math.min(screen.width,screen.height),v=document.querySelector('meta[name="viewport"]');if(v&&S>0&&innerHeight>W&&W>S*1.2&&matchMedia("(pointer: coarse)").matches)v.setAttribute("content","width="+S+", initial-scale=1, maximum-scale=1")}catch(e){}try{var h=document.documentElement,q=new URLSearchParams(location.search);var l=q.get("lang");l=l==="ar"||l==="en"?l:localStorage.getItem("${LANG_KEY}");if(l!=="ar"&&l!=="en")l=String((navigator.languages&&navigator.languages[0])||navigator.language||"").toLowerCase().split("-")[0]==="ar"?"ar":"en";if(l==="ar"){h.lang="ar";h.dir="rtl"}try{localStorage.removeItem("${THEME_KEY}")}catch(e){}var t=q.get("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";if(t==="light"){h.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLOR.light}")}}catch(e){}})()`
