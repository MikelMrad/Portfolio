/**
 * Shared by the server layout and the client store (lib/i18n.tsx), so it lives
 * outside the "use client" module — a server component importing a plain value
 * from one gets a client reference, not the value.
 */

export const LANG_KEY = "mm:lang"

/**
 * Inlined into <head>: sets lang/dir from `?lang=` or the remembered choice
 * before the first paint, so the server-rendered boot drawing (CSS grid) is
 * already mirrored. Dependency-free on purpose.
 */
export const LANG_BOOT = `(function(){try{var q=new URLSearchParams(location.search).get("lang");var l=q==="ar"||q==="en"?q:localStorage.getItem("${LANG_KEY}");if(l==="ar"){var h=document.documentElement;h.lang="ar";h.dir="rtl"}}catch(e){}})()`
