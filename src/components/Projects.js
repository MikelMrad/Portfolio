import styles from "@/styles/home.module.css"
import Supplement from "/public/supp.JPG"
import TutorMe from "/public/tutorme.JPG"
import ProjectContainer from "@/common/ProjectContainer"

export default function Projects() {
  return (
    <section className={styles.Page}>
      <h3>Projects</h3>
      <div className={styles.ProjectsContainer}>
        <ProjectContainer
        src={Supplement}
        header="Supplement Store "
        paragraph="A reusable e-commerce web-app created using Javascript, React, Redux."
        techs={["Javascript", "React", "Redux"]}
        dir={"https://github.com/MikelMrad/Supplement-Store"}
        />
        <ProjectContainer
        src={TutorMe}
        header="EDU Center Management System"
        paragraph="TutorMe, a comprehensive educational center management system."
        techs={["Javascript", "Next", "Redux"," Node.js", "Express", "MongoDB"," GraphQL","typescript"]}
        dir={"https://github.com/MikelMrad/Final-Year-Project"}
        />
      </div>
    </section>
  )
}
