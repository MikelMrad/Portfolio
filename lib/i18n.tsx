"use client"
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react"
import { EN, type Content } from "./content"
import { AR } from "./content-ar"
import { LANG_KEY } from "./lang-boot"

/**
 * English / Arabic.
 *
 * The language lives on <html> — `lang` and `dir` — and that attribute is the
 * store. Three reasons it isn't React state:
 *
 * - It has to be right *before* React exists. PREFS_BOOT (lib/lang-boot.ts),
 *   inlined in <head>,
 *   sets it from `?lang=` or the remembered choice, so the boot drawing — CSS
 *   grid, server-rendered — is already mirrored on the first frame.
 * - Mirroring is CSS's job. Under `dir="rtl"` the grid, every flex row and
 *   every logical property (`ms-*`, `end-*`, `text-start`) flips by itself.
 * - The server can't know it, so hydration renders English and
 *   useSyncExternalStore switches to the real value straight after — before
 *   any module mounts (the stage waits for the viewport anyway).
 */

export type Lang = "en" | "ar"

export const CONTENT: Record<Lang, Content> = { en: EN, ar: AR }


const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

const read = (): Lang => (document.documentElement.lang === "ar" ? "ar" : "en")

export function useLangStore(): Lang {
  return useSyncExternalStore(subscribe, read, () => "en")
}

export function setLang(lang: Lang) {
  const h = document.documentElement
  h.lang = lang
  h.dir = lang === "ar" ? "rtl" : "ltr"
  try { localStorage.setItem(LANG_KEY, lang) } catch { /* private mode */ }
  listeners.forEach((fn) => fn())
}

const Ctx = createContext<Content>(EN)

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={CONTENT[lang]}>{children}</Ctx.Provider>
}

/** The active language's copy. */
export function useContent(): Content {
  return useContext(Ctx)
}
