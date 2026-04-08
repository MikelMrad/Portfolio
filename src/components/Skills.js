'use client'
import { useState } from "react"
import styles from "@/styles/home.module.css"
import skillStyles from "@/styles/skills.module.css"
import Image from "next/image"

import C from "/public/cpluss.png"
import Java from "/public/java-logo.png"
import Javascript from "/public/java-script.png"
import Typescript from "/public/typescript.png"
import ReactImage from "/public/react.png"
import Next from "/public/next.png"
import Node from "/public/node-js.png"
import Express from "/public/express.png"
import GraphQL from "/public/gql.png"
import Redux from "/public/redux.png"
import Html from "/public/html.png"
import Css from "/public/css.png"
import Git from "/public/git.png"
import Figma from "/public/figma.png"
import Photoshop from "/public/ps.png"
import MongoDB from "/public/MongoDB.png"
import IcePanel from "/public/icepanel-logo.png"
import Postman from "/public/postman.png"
import FireBase from "/public/firebase.png"
import Shopify from "/public/shopify.png"
import Liquid from "/public/liquid.png"
import Docker from "/public/docker.png"

const categories = [
  {
    label: "Languages",
    skills: [
      { src: C, name: "C++" },
      { src: Java, name: "Java" },
      { src: Javascript, name: "JavaScript" },
      { src: Typescript, name: "TypeScript" },
    ],
  },
  {
    label: "Frameworks",
    skills: [
      { src: ReactImage, name: "React" },
      { src: ReactImage, name: "React Native" },
      { src: Next, name: "Next.js" },
      { src: Node, name: "Node.js" },
      { src: Express, name: "Express" },
      { src: GraphQL, name: "GraphQL" },
      { src: Redux, name: "Redux" },
      { src: Liquid, name: "Liquid" },
    ],
  },
  {
    label: "Tools",
    skills: [
      { src: Html, name: "HTML" },
      { src: Css, name: "CSS" },
      { src: Git, name: "Git" },
      { src: Figma, name: "Figma" },
      { src: Photoshop, name: "Photoshop" },
      { src: IcePanel, name: "Ice Panel" },
      { src: Postman, name: "Postman" },
      { src: Shopify, name: "Shopify" },
      { src: Docker, name: "Docker" },
    ],
  },
  {
    label: "Databases",
    skills: [
      { src: MongoDB, name: "MongoDB" },
      { src: FireBase, name: "Firebase" },
    ],
  },
]

export default function Skills() {
  const [active, setActive] = useState(1)

  return (
    <section className={styles.Page}>
      <h3>Skills</h3>

      <div className={skillStyles.tabBar}>
        {categories.map((cat, i) => (
          <button
            key={cat.label}
            className={`${skillStyles.tab} ${active === i ? skillStyles.tabActive : ""}`}
            onClick={() => setActive(i)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div key={active} className={skillStyles.grid}>
        {categories[active].skills.map((skill) => (
          <div key={skill.name} className={skillStyles.pill}>
            <Image src={skill.src} width={32} height={32} alt={skill.name} />
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
