import styles from "@/styles/home.module.css"
import C from "/public/cpluss.png"
import Java from "/public/java-logo.png"
import Javascript from "/public/java-script.png"
import SkillContainer from "@/common/SkillContainer"
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

export default function Skills() {
  return (
    <section className={styles.Page}>
      <h3>Skills</h3>
      <div className={styles.SkillsContainer}>
        <div>
          <h6  style={{margin:"0 0 20px 0"}}>Programming Languages</h6>
          <div className={styles.Skills}>
            <SkillContainer src={C} language="C++" />
            <SkillContainer src={Java} language="Java" />
            <SkillContainer src={Javascript} language="JavaScript" />
            <SkillContainer src={Typescript} language="TypeScript" />
          </div>
        </div>
        <div>
          <h6  style={{margin:"0 0 20px 0"}}>Frameworks & Libraries</h6>
          <div className={styles.Skills}>
            <SkillContainer src={ReactImage} language="React" />
            <SkillContainer src={ReactImage} language="React Native" />
            <SkillContainer src={Next} language="Next.js" />
            <SkillContainer src={Node} language="Node.js" />
            <SkillContainer src={Express} language="Express" />
            <SkillContainer src={GraphQL} language="GraphQL" />
            <SkillContainer src={Redux} language="Redux" />
          </div>
        </div>
        <div>
          <h6  style={{margin:"0 0 20px 0"}}>Technologies & Tools</h6>
          <div className={styles.Skills}>
            <SkillContainer src={Html} language="HTML" />
            <SkillContainer src={Css} language="CSS" />
            <SkillContainer src={Git} language="Git" />
            <SkillContainer src={Figma} language="Figma" />
            <SkillContainer src={Photoshop} language="Photoshop" />
            <SkillContainer src={IcePanel} language="Ice Panel" />
            <SkillContainer src={Postman} language="Postman" />
          </div>
        </div>
        <div>
          <h6  style={{margin:"0 0 20px 0"}}>Databases</h6>
          <div className={styles.Skills}>
            <SkillContainer src={MongoDB} language="MongoDB" />
            <SkillContainer src={FireBase} language="FireBase" />
          </div>
        </div>
      </div>
    </section>
  )
}
