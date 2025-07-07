import styles from "@/styles/home.module.css"
import Java from "/public/java-logo.png"
import ProjectContainer from "@/common/ProjectContainer"

export default function Projects() {
  return (
    <section className={styles.Page}>
      <h3>Projects</h3>
      <div className={styles.ProjectsContainer}>
        <ProjectContainer
        src={Java}
        header="Supplement Store "
        paragraph="A reusable e-commerce web-app created using Javascript, React, Redux."
        techs={["Javascript", "React", "Redux"]}
        />
        <ProjectContainer
        src={Java}
        header="EDU Center Management System"
        paragraph="TutorMe, a comprehensive educational center management system."
        techs={["Javascript", "Next", "Redux"," Node.js", "Express", "MongoDB"," GraphQL","typescript"]}
        />
      </div>
    </section>
  )
}
