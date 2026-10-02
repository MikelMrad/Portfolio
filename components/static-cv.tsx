import {
  CONTACT, EDUCATION, EMPLOYER, IDENTITY, PROJECTS, ROLES, STACK, STATS,
} from "@/lib/content"

/**
 * The whole site as a plain document — server-rendered, so it is in the HTML
 * before any JavaScript runs.
 *
 * The real page is a canvas that mounts after hydration; to anything that
 * reads HTML without running it (LinkedIn and Slack's scrapers, most AI
 * crawlers, a search engine's first pass) it was an empty grid. This is the
 * same content, in order, as semantic HTML.
 *
 * It is not hidden from people: it is the page's no-JS form. With JavaScript
 * off, the <noscript> rule in page.tsx shows it as a readable document. With
 * JavaScript on it sits visually hidden through the boot drawing, then the
 * stage sets `hidden` on it once the interactive grid mounts — so a screen
 * reader gets one copy of everything, never two.
 *
 * English only (see lib/seo.ts). Copy comes from lib/content.ts — never write
 * it here.
 */
export function StaticCv() {
  return (
    <article id="static-cv" className="static-cv" lang="en">
      <header>
        <h1>{IDENTITY.name}</h1>
        <p>{IDENTITY.role}</p>
        <p>{IDENTITY.tagline}</p>
        <p>{IDENTITY.location} · {IDENTITY.availability.long}</p>
        <ul>
          {STATS.map((s) => <li key={s.label}>{s.value}{s.suffix} {s.label}</li>)}
        </ul>
      </header>

      <section>
        <h2>Experience — {EMPLOYER.name}</h2>
        <p>{EMPLOYER.location} · {EMPLOYER.span}. {EMPLOYER.summary}</p>
        {ROLES.map((r) => (
          <section key={r.title + r.from}>
            <h3>{r.title}</h3>
            <p>{r.type} · {r.from} — {r.to}</p>
            <p>{r.blurb}</p>
            <p>{r.skills.join(", ")}</p>
          </section>
        ))}
      </section>

      <section>
        <h2>Work</h2>
        {PROJECTS.map((p) => (
          <section key={p.num}>
            <h3>{p.title.replace("\n", " ")}</h3>
            <p>{p.subtitle} · {p.role} · {p.year}</p>
            {p.detail.map((d) => <p key={d}>{d}</p>)}
            <p>{p.stack.join(", ")}</p>
            {p.url && <p><a href={p.url}>{p.url.replace(/^https?:\/\//, "")}</a></p>}
          </section>
        ))}
      </section>

      <section>
        <h2>Stack</h2>
        {STACK.map((c) => (
          <section key={c.id}>
            <h3>{c.label}</h3>
            <p>{c.skills.join(", ")}</p>
          </section>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        {EDUCATION.map((e) => (
          <p key={e.short}>{e.school} ({e.short}), {e.place} — {e.award}, {e.years}</p>
        ))}
      </section>

      <section>
        <h2>Contact</h2>
        <ul>
          <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
          <li>{CONTACT.phone}</li>
          <li><a href={CONTACT.github}>GitHub</a></li>
          <li><a href={CONTACT.linkedin}>LinkedIn</a></li>
          <li><a href={CONTACT.cv}>CV (PDF)</a></li>
        </ul>
      </section>
    </article>
  )
}
