"use client"
import { useState } from "react"
import emailjs from "@emailjs/browser"
import { CONTACT } from "@/lib/content"
import { GlowRule, Label } from "@/components/ui/bits"
import { Magnetic } from "@/components/ui/magnetic"
import { ScrambleText } from "@/components/ui/scramble-text"

export function Headline() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[300px]:p-6 overflow-hidden">
      <Label>CONTACT</Label>
      <h2 className="font-display text-fg leading-[0.82] tracking-tight text-[clamp(2rem,min(20cqw,26cqh),8rem)]">
        LET&apos;S
        <br />
        <span style={{ WebkitTextStroke: "2px #f0f0f0", color: "transparent" }}>WORK.</span>
      </h2>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        AVAILABLE FOR FREELANCE & FULL-TIME
      </span>
    </div>
  )
}

export function EmailCard() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[400px]:p-5 gap-2 min-w-0">
      <Label right={CONTACT.phone}>DIRECT</Label>
      <a
        href={`mailto:${CONTACT.email}`}
        className="font-mono text-[11px] @[400px]:text-sm uppercase tracking-[0.14em] text-fg hover:text-mid transition-colors flex items-center gap-3 min-w-0"
      >
        <span className="inline-block w-4 h-px bg-fg shrink-0" style={{ boxShadow: "0 0 8px 1px rgba(240,240,240,0.5)" }} />
        <ScrambleText text={CONTACT.email.toUpperCase()} speed={5} />
      </a>
      <GlowRule />
    </div>
  )
}

type Status = "idle" | "sending" | "sent" | "error"

const FIELD =
  "bg-transparent border-0 border-b border-hairline text-fg font-mono text-[10px] uppercase tracking-[0.12em] py-2.5 outline-none w-full placeholder:text-dim focus:border-fg transition-colors duration-200"

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [name, setName]   = useState("")
  const [email, setEmail] = useState("")
  const [msg, setMsg]     = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
        { name, email, message: msg, title: "Portfolio Contact" },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "" },
      )
      setStatus("sent")
      setName(""); setEmail(""); setMsg("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="h-full flex flex-col p-4 @[400px]:p-6 gap-4 min-h-0">
      <Label right={status === "sent" ? "SENT" : "FORM"}>SEND A MESSAGE</Label>

      {status === "sent" ? (
        <div className="flex-1 flex flex-col justify-center gap-2">
          <span className="font-display text-fg leading-none tracking-tight text-[clamp(1.5rem,min(12cqw,18cqh),3rem)]">RECEIVED.</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid">
            I&apos;LL BE IN TOUCH SHORTLY.
          </span>
        </div>
      ) : (
        <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col gap-4 @[400px]:gap-5">
          <div className="grid grid-cols-1 @[400px]:grid-cols-2 gap-4 @[400px]:gap-5 shrink-0">
            <input
              placeholder="YOUR NAME" value={name} onChange={(e) => setName(e.target.value)}
              required disabled={status === "sending"} className={FIELD}
            />
            <input
              type="email" placeholder="YOUR EMAIL" value={email} onChange={(e) => setEmail(e.target.value)}
              required disabled={status === "sending"} className={FIELD}
            />
          </div>

          <textarea
            placeholder="YOUR MESSAGE" value={msg} onChange={(e) => setMsg(e.target.value)}
            required disabled={status === "sending"}
            className={`${FIELD} resize-none flex-1 min-h-0`}
          />

          {status === "error" && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim shrink-0">
              SOMETHING WENT WRONG — EMAIL ME DIRECTLY.
            </span>
          )}

          <Magnetic strength={0.25} className="self-start shrink-0">
            <button
              type="submit" disabled={status === "sending"}
              className="font-mono text-[10px] uppercase tracking-[0.24em] border border-fg text-fg px-6 py-3 hover:bg-fg hover:text-bg transition-colors duration-150 disabled:opacity-40"
            >
              {status === "sending" ? "SENDING..." : "SEND MESSAGE →"}
            </button>
          </Magnetic>
        </form>
      )}
    </div>
  )
}

export function Socials() {
  const links = [
    { label: "GITHUB",   href: CONTACT.github },
    { label: "LINKEDIN", href: CONTACT.linkedin },
    { label: "CV ↓",     href: CONTACT.cv },
  ]
  return (
    <div className="h-full flex items-center gap-5 px-4 @[300px]:px-5">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors whitespace-nowrap"
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

export function Footer() {
  return (
    <div className="h-full flex items-center justify-between px-4 @[220px]:px-5 gap-3">
      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim whitespace-nowrap">© 2026 MikelMrad</span>
      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim whitespace-nowrap">· NEXT.JS</span>
    </div>
  )
}
