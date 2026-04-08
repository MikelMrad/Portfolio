import Image from "next/image"
import styles from "@/styles/about.module.css"

export default function AboutContainer({src, header, paragraph, date}) {
  return (
    <div className={styles.container}>
      <Image
        src={src}
        height={60}
        width={60}
        className={styles.image}
        alt="Image"
      />
      <div className={styles.body}>
        <h1 className={styles.header}>{header}</h1>
        <p className={styles.paragraph}>{paragraph}</p>
        <h6 className={styles.date}>{date}</h6>
      </div>
    </div>
  )
}
