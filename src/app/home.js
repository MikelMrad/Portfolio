import styles from "@/styles/home.module.css"
import ScrollProgressBar from "../components/ScrollProgressBar"
import Welcome from "@/components/Welcome"
import About from "@/components/About"
import Skills from "@/components/Skills"
import Projects from "@/components/Projects"
import Contact from "@/components/Contact"

export default function Home() {
  const sectionTitles = [
    "Welcome",
    "About",
    "Skills",
    "Projects",
    "Contact"
  ]

  return (
    <>
      <ScrollProgressBar sectionCount={sectionTitles.length} sectionTitles={sectionTitles} />
      <div className={styles.Container}>
        <Welcome/>
        <About/>
        <Skills/>
        <Projects/>
        <Contact/>
      </div>
    </>
  )
}
