import styles from "@/styles/home.module.css"
import USEK from "/public/usek.jpeg"
import EST from "/public/est.jpg"
import AboutContainer from "@/common/AboutContainer"

export default function About() {
  return (
    <section className={styles.Page}>
      <h3> About Me </h3>
      <AboutContainer src={USEK} header={"Computer Science Student"} paragraph={"I graduated from the Holy Spirit University of Kaslik with a Bachelor's degree in Computer Science."} date={"September 2021 - June 2025"}/>
      <AboutContainer src={EST} header={"Web Development Intern"} paragraph={"Started as a Web Development Intern at EST to fulfill the university's internship requirement."} date={"July 2024 - October 2024"}/>
      <AboutContainer src={EST} header={"Part-Time Front-End Developer"} paragraph={"After completing my internship, I continued working part-time until I received my diploma."} date={"November 2024 - June 2025"}/>
      <AboutContainer src={EST} header={"Full-Time Front-End Developer"} paragraph={"With my diploma in hand, I secured a full-time position as a Front-End Developer."} date={"June 2025 - Present"}/>
    </section>
  )
}
