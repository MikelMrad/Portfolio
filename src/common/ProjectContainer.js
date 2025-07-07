import Image from "next/image"
import React from "react"
import styles from "@/styles/project.module.css"

const ProjectContainer = ({ src, header, paragraph, techs, dir }) => (
  <div className={styles.container}>
    <div className={styles.chrome}>
      {["#EF4444", "#F59E0B", "#10B981"].map((color, i) => (
        <div
          key={i}
          className={styles.dot}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
    <div className={styles.imagePanel}>
      <Image
        src={src}
        alt={header}
        className={styles.image}
      />
    </div>
    <div className={styles.body}>
      <h2 className={styles.title}>{header}</h2>
      <p className={styles.paragraph}>{paragraph}</p>
      <div className={styles.techs}>
        {techs.map((t, i) => (
          <span key={i} className={styles.techBadge}>
            {t}
          </span>
        ))}
      </div>
      <a href={dir} target="_blank" className={styles.learnMore}>
        Learn more
      </a>
    </div>
  </div>
)

export default ProjectContainer
