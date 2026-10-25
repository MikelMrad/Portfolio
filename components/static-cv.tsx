import Link from "next/link"
import { CONTACT, has, whatsappUrl } from "@/lib/config"
import {
  EDUCATION, EMPLOYER, FAQ, HERO, IDENTITY, PROCESS, PROJECTS, PROOF, ROLES, SERVICES, STACK,
  TESTIMONIALS as QUOTES, UI,
} from "@/lib/content"
import { APPROVED_TESTIMONIALS } from "@/lib/testimonials"

/**
 * The whole site as a plain document: server-rendered, so it is in the HTML
 * before any JavaScript runs.
 *
 * The real page is a canvas that mounts after hydration; to anything that
 * reads HTML without running it (LinkedIn and Slack's scrapers, most AI
 * crawlers, a search engine's first pass) it was an empty grid. This is the
 * same content, in the same order as the sections, as semantic HTML.
 *
 * It is not hidden from people: it is the page's no-JS form. With JavaScript
 * off, the <noscript> rule in page.tsx shows it as a readable document. With
 * JavaScript on it sits visually hidden through the boot drawing, then the
 * stage sets `hidden` on it once the interactive grid mounts, so a screen
 * reader gets one copy of everything, never two.
 *
 * English only (see lib/seo.ts). Copy comes from lib/content.ts: never write
 * it here.
 */
export function StaticCv() {
  return (
    <article id="static-cv" className="static-cv" lang="en">
      <header>
        <p>{IDENTITY.role}</p>
        <h1>{HERO.headline}</h1>
        <p>{HERO.subline}</p>
        <p>
          <a href={whatsappUrl(UI.whatsapp.message)}>{HERO.whatsapp}</a> · <Link href="/work">{HERO.work}</Link>
        </p>
        <ul>{PROOF.items.map((p) => <li key={p}>{p}</li>)}</ul>
      </header>

      <section>
        <h2>{SERVICES.label}</h2>
        <p>{SERVICES.fixesNote}</p>
        {SERVICES.items.map((s) => (
          <section key={s.id}>
            <h3>{s.title.replace("\n", " ")}</h3>
            <p>{s.body}</p>
            <p>{s.price}{s.note && `. ${s.note}.`}</p>
            {s.includes && <ul>{s.includes.map((i) => <li key={i}>{i}</li>)}</ul>}
            {s.plans?.map((plan) => (
              <p key={plan.name}>{plan.name}, {plan.price}: {plan.items.join(", ")}.</p>
            ))}
          </section>
        ))}
      </section>

      <section>
        <h2>Work</h2>
        {PROJECTS.map((p) => (
          <section key={p.num}>
            <h3>{p.title.replace("\n", " ")}</h3>
            <p>{p.headline}</p>
            <p>{p.body}</p>
            <p>{p.stack.join(" · ")}</p>
            {p.url && <p><a href={p.url}>{p.url.replace(/^https?:\/\//, "")}</a></p>}
          </section>
        ))}
      </section>

      {APPROVED_TESTIMONIALS.length > 0 && (
        <section>
          <h2>Testimonials</h2>
          {APPROVED_TESTIMONIALS.map((t) => (
            <blockquote key={t.id}>
              <p>{QUOTES[t.id]?.quote}</p>
              <footer>{[t.name, QUOTES[t.id]?.role, t.business].filter(Boolean).join(", ")}</footer>
            </blockquote>
          ))}
        </section>
      )}

      <section>
        <h2>{PROCESS.label}</h2>
        <ol>{PROCESS.steps.map((s) => <li key={s.title}>{s.title}. {s.body}</li>)}</ol>
      </section>

      <section>
        <h2>Experience: {EMPLOYER.name}</h2>
        <p>{EMPLOYER.location} · {EMPLOYER.span}. {EMPLOYER.summary}</p>
        {ROLES.map((r) => (
          <section key={r.title + r.from}>
            <h3>{r.title}</h3>
            <p>{r.type} · {UI.range(r.from, r.to)}</p>
            <p>{r.blurb}</p>
            <p>{r.skills.join(", ")}</p>
          </section>
        ))}
      </section>

      <section>
        <h2>Stack</h2>
        {STACK.map((c) => <p key={c.id}>{c.label}: {c.skills.join(", ")}</p>)}
      </section>

      <section>
        <h2>Education</h2>
        {EDUCATION.map((e) => (
          <p key={e.short}>{e.school} ({e.short}), {e.place}. {e.award}, {e.years}</p>
        ))}
      </section>

      <section>
        <h2>{FAQ.label}</h2>
        <dl>
          {FAQ.items.map((f) => (
            <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>
          ))}
        </dl>
      </section>

      <section>
        <h2>{UI.contact.headline}</h2>
        <p>{UI.contact.line}</p>
        <ul>
          <li><a href={whatsappUrl(UI.whatsapp.message)}>WhatsApp {CONTACT.phone}</a></li>
          {has(CONTACT.calcom) && <li><a href={CONTACT.calcom}>Book a free call</a></li>}
          <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
          <li><a href={CONTACT.github}>GitHub</a></li>
          <li><a href={CONTACT.linkedin}>LinkedIn</a></li>
          <li><a href={CONTACT.cv}>CV (PDF)</a></li>
        </ul>
      </section>
    </article>
  )
}
