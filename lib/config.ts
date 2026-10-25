/**
 * Contact constants, in one place.
 *
 * Anything that links out reads from here. A button whose URL is an empty
 * string does not render (see `has()`), so filling in `calcom` is all it takes
 * to put BOOK A FREE CALL on the site.
 */
export const CONTACT = {
  /** International format, digits only: what wa.me expects. */
  whatsapp: "96170036858",
  /** The same number, written for people. */
  phone:    "+961 70 036 858",
  email:    "mikelmrad.work@gmail.com",
  /** Booking link, e.g. "https://cal.com/mikelmrad/intro". Empty hides the button. */
  calcom:   "",
  github:   "https://github.com/mikelmrad",
  linkedin: "https://www.linkedin.com/in/mikel-mrad/",
  cv:       "/docs/Mikel-Mrad-CV.pdf",
  /** The production origin: metadataBase and the link preview use it. */
  site:     "https://mikelmrad.dev",
} as const

/** A wa.me link that opens the chat with `text` already typed. */
export const whatsappUrl = (text: string) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`

/** False for an empty URL: the button that would carry it isn't rendered. */
export const has = (url: string) => url.trim().length > 0
