'use client'
import { useState } from "react"
import styles from "@/styles/home.module.css"
import projStyles from "@/styles/project.module.css"
import Supplement from "/public/supp.JPG"
import TutorMe from "/public/tutorme.JPG"
import UnderConstruction from "/public/under-construction.png"
import UncleJNutrition from "/public/unclejnutriotionproj.png"
import TheOutletsLB from "/public/theoutlets.png"

const projects = [
  {
    src: UncleJNutrition,
    title: "E-Commerce Platform",
    description: "Fully custom e-commerce platform website built on Shopify.",
    techs: ["Liquid"],
    link: "https://unclejnutrition.com/",
  },
  {
    src: TheOutletsLB,
    title: "E-Commerce Platform",
    description: "Fully custom e-commerce platform website built on Shopify.",
    techs: ["Liquid"],
    link: "https://theoutletslb.com/",
  },
  {
    src: TutorMe,
    title: "EDU Center Management System",
    description: "TutorMe, a comprehensive educational center management system.",
    techs: ["JavaScript", "Next.js", "Redux", "Node.js", "Express", "MongoDB", "GraphQL", "TypeScript"],
    link: "https://github.com/MikelMrad/Final-Year-Project",
  },
  {
    src: Supplement,
    title: "Supplement Store",
    description: "A reusable e-commerce web-app created using Javascript, React, and Redux.",
    techs: ["JavaScript", "React", "Redux"],
    link: "https://github.com/MikelMrad/Supplement-Store",
  },
  {
    src: UnderConstruction,
    title: "E-Commerce Platform Rebuild",
    description: "Full rebuild of an e-commerce platform from Shopify into a custom web, backend, admin, and mobile admin system.",
    techs: ["JavaScript", "Next.js", "Node.js", "Express", "MongoDB", "GraphQL"],
    link: "https://github.com/MikelMrad",
  },
]

export default function Projects() {
  const [active, setActive] = useState(0)

  const prev = () => setActive((a) => (a - 1 + projects.length) % projects.length)
  const next = () => setActive((a) => (a + 1) % projects.length)

  const project = projects[active]

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    e.currentTarget.style.backgroundPosition = `${x}% top`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundPosition = "50% top"
  }

  return (
    <section className={styles.Page}>
      <h3>Projects</h3>

      <div key={active} className={projStyles.card}>
        <div
          className={projStyles.imagePanel}
          style={{ backgroundImage: `url(${project.src.src})` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <div className={projStyles.content}>
          <div>
            <h2 className={projStyles.title}>{project.title}</h2>
            <p className={projStyles.description}>{project.description}</p>
          </div>
          <div className={projStyles.techs}>
            {project.techs.map((t, i) => (
              <span key={i} className={projStyles.techBadge}>{t}</span>
            ))}
          </div>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={projStyles.link}
          >
            View Project →
          </a>
        </div>
      </div>

      <div className={projStyles.nav}>
        <button className={projStyles.arrow} onClick={prev}>‹</button>
        <div className={projStyles.dots}>
          {projects.map((_, i) => (
            <button
              key={i}
              className={`${projStyles.dot} ${i === active ? projStyles.dotActive : ""}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
        <button className={projStyles.arrow} onClick={next}>›</button>
      </div>
    </section>
  )
}
