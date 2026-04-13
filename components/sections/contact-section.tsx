"use client"
import { useRef, useState, useCallback } from "react"
import emailjs from "@emailjs/browser"
import { Reveal } from "@/components/ui/reveal"
import { ScrambleText } from "@/components/ui/scramble-text"

const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? ""
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? ""
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? ""

const gridBg: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(var(--color-hairline) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-hairline) 1px, transparent 1px)
  `,
  backgroundSize: "60px 60px",
}

const fieldCls =
  "bg-transparent border-0 border-b border-fg/20 text-fg font-mono text-[11px] uppercase tracking-[0.14em] py-3 outline-none w-full placeholder:text-fg/40 focus:border-fg transition-colors duration-200"

type Status = "idle" | "sending" | "sent" | "error"

export function ContactSection() {
  const [status, setStatus] = useState<Status>("idle")
  const [name,   setName]   = useState("")
  const [email,  setEmail]  = useState("")
  const [msg,    setMsg]    = useState("")

  const sectionRef = useRef<HTMLElement>(null)
  const glowRef    = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLButtonElement>(null)
  const btnTextRef = useRef<HTMLSpanElement>(null)

  const onBtnMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current || !btnTextRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.28
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.28
    btnTextRef.current.style.transform = `translate(${x}px, ${y}px)`
  }, [])

  const onBtnLeave = useCallback(() => {
    if (btnTextRef.current) btnTextRef.current.style.transform = ""
  }, [])

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!glowRef.current || !sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    glowRef.current.style.left    = `${e.clientX - rect.left}px`
    glowRef.current.style.top     = `${e.clientY - rect.top}px`
    glowRef.current.style.opacity = "1"
  }

  const onLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { name, email, message: msg, title: "Portfolio Contact" },
        { publicKey: EMAILJS_PUBLIC_KEY },
      )
      setStatus("sent")
      setName(""); setEmail(""); setMsg("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      data-snap=""
      className="relative bg-bg border-t border-hairline min-h-screen flex flex-col overflow-hidden"
      style={gridBg}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width:  "700px",
          height: "700px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(240,240,240,0.055) 0%, transparent 65%)",
          zIndex: 0,
          opacity: 0,
          transition: "opacity 0.4s ease",
        }}
      />

      <div className="relative z-10 flex-1 grid md:grid-cols-2">
        <div className="flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-fg/20">
          <Reveal>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mid">CONTACT</span>
          </Reveal>

          <Reveal delay={80}>
            <h2
              className="font-display tracking-tight text-fg leading-[0.85]"
              style={{ fontSize: "clamp(3.5rem, 10vw, 13rem)" }}
            >
              LET&apos;S<br />WORK.
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mid mt-8">
              AVAILABLE FOR FREELANCE &amp; FULL-TIME.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <a
              href="mailto:mikelmrad.work@gmail.com"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg hover:text-mid transition-colors duration-150 flex items-center gap-3 self-start"
            >
              <span className="inline-block w-4 h-px bg-fg" />
              <ScrambleText text="MIKELMRAD.WORK@GMAIL.COM" speed={5} />
            </a>
          </Reveal>
        </div>

        <div className="flex items-center p-8 md:p-16">
          {status === "sent" ? (
            <Reveal className="font-mono text-[11px] uppercase tracking-[0.2em] leading-loose">
              <span className="text-mid">MESSAGE RECEIVED.<br /></span>
              <span className="text-fg">I&apos;LL BE IN TOUCH.</span>
            </Reveal>
          ) : (
            <Reveal delay={120} className="w-full max-w-lg">
              <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
                  <input
                    placeholder="YOUR NAME"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={status === "sending"}
                    className={fieldCls}
                  />
                  <input
                    type="email"
                    placeholder="YOUR EMAIL"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={status === "sending"}
                    className={fieldCls}
                  />
                </div>
                <textarea
                  placeholder="YOUR MESSAGE"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  required
                  rows={4}
                  disabled={status === "sending"}
                  className={`${fieldCls} resize-none`}
                />
                {status === "error" && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid">
                    SOMETHING WENT WRONG — TRY AGAIN OR EMAIL DIRECTLY.
                  </span>
                )}
                <button
                  ref={btnRef}
                  type="submit"
                  disabled={status === "sending"}
                  onMouseMove={onBtnMove}
                  onMouseLeave={onBtnLeave}
                  className="font-mono text-[10px] uppercase tracking-[0.28em] border border-fg text-fg px-7 py-4 hover:bg-fg hover:text-bg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span
                    ref={btnTextRef}
                    style={{
                      display: "inline-block",
                      transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)",
                      willChange: "transform",
                    }}
                  >
                    {status === "sending" ? "SENDING..." : "SEND MESSAGE →"}
                  </span>
                </button>
              </form>
            </Reveal>
          )}
        </div>
      </div>

      <div className="relative z-10 border-t border-fg/20 px-8 md:px-16 py-5 flex justify-between items-center">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid">
          © 2026 MIKEL MRAD
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid">
          NEXT.JS + THREE.JS
        </span>
      </div>
    </section>
  )
}
