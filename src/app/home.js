'use client'
import styles from "@/styles/home.module.css"
import ScrollProgressBar from "../components/ScrollProgressBar"
import Welcome from "@/components/Welcome"
import About from "@/components/About"
import Skills from "@/components/Skills"
import Projects from "@/components/Projects"
import Contact from "@/components/Contact"
import { useEffect, useState } from "react"

export default function Home() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
  const handleResize = () => {
    setIsVisible(window.innerWidth >= 1300)
  }

  handleResize()
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sectionTitles = [
    "Welcome",
    "About",
    "Skills",
    "Projects",
    "Contact"
  ]

  return (
    <>
      {isVisible && (
      <ScrollProgressBar
        sectionCount={sectionTitles.length}
        sectionTitles={sectionTitles}
      />
    )}

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
