import styles from "@/styles/home.module.css"
import Image from "next/image"
import Github from "/public/github.png"
import GithubHover from "/public/social.png"
import LinkedIn from "/public/linkedin.png"
import LinkedInHover from "/public/linkedin-hover.png"
import Link from "next/link"

export default function Welcome() {
  return (
    <section className={styles.Page}>
      <h1 className={styles.Wave}>👋</h1>
      <h1 className={styles.Title}>Welcome to My Portfolio</h1>
      <h4 className={styles.b}>I'm a Frontend Developer</h4>
      <h6 className={styles.b}>Enjoy your stay!</h6>
      <div>
        <div className={styles.Wrapper}  style={{marginRight:"12px"}}>
          <Link href="https://github.com/MikelMrad" target="_blank" rel="noopener noreferrer">
            <Image className={styles.Img} src={Github} width={50} height={50} alt="Github" />
            <Image className={styles.ImgHover} src={GithubHover} width={50} height={50} alt="Github Hover" />
          </Link>
        </div>
        <div className={styles.Wrapper} style={{marginLeft:"12px"}}>
          <Link href="https://www.linkedin.com/in/mikel-mrad-71aa34301/" target="_blank" rel="noopener noreferrer">
            <Image className={styles.Img} src={LinkedIn} width={50} height={50} alt="LinkedIn"/>
            <Image className={styles.ImgHover} src={LinkedInHover} width={50} height={50} alt="LinkedInHover"/>
          </Link>
        </div>
      </div>
    </section>
  )
}
