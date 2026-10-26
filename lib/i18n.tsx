"use client"
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react"
import { EN, type Content } from "./content"
import { AR } from "./content-ar"
import { CV_EN, type CvContent } from "./content-cv"
import { CV_AR } from "./content-cv-ar"
import type { SharedContent, Variant } from "./content-types"
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

/** Either variant's full set, told apart by `VARIANT`. */
export type AnyContent = Content | CvContent

/** Every set, by variant (picked by hostname, see proxy.ts) and language. */
export const CONTENT: { business: Record<Lang, Content>; cv: Record<Lang, CvContent> } = {
  business: { en: EN, ar: AR },
  cv:       { en: CV_EN, ar: CV_AR },
}

export const contentFor = (variant: Variant, lang: Lang): AnyContent => CONTENT[variant][lang]


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

const Ctx = createContext<AnyContent>(EN)

export function LangProvider({ lang, variant, children }: { lang: Lang; variant: Variant; children: ReactNode }) {
  return <Ctx.Provider value={contentFor(variant, lang)}>{children}</Ctx.Provider>
}

/**
 * The active language's copy, as far as the shared components need it: the
 * fields both variants have (lib/content-types.ts).
 */
export function useContent(): SharedContent {
  return useContext(Ctx)
}

/** The business set, for modules that only exist on mikelmrad.dev. */
export function useBusiness(): Content {
  const c = useContext(Ctx)
  if (c.VARIANT !== "business") throw new Error("A business-only module rendered in the cv variant")
  return c
}

/** The portfolio set, for modules that only exist on portfolio.mikelmrad.dev. */
export function useCv(): CvContent {
  const c = useContext(Ctx)
  if (c.VARIANT !== "cv") throw new Error("A cv-only module rendered in the business variant")
  return c
}
