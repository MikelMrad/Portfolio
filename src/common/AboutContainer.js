import styles from "@/styles/home.module.css"
import Image from "next/image"

export default function AboutContainer({src , header , paragraph , date}) {
  return (
      <div 
      style={{
        display:"flex",
        alignItems:"center",
        gap:"10px",
        width:"100%",
        maxWidth:"800px"
      }}>
        <Image 
        src={src}
        height={60}
        width={60}
        style={{borderRadius:"50%"}}
        alt="Image"/>
        <div
        style={{
          display:"flex",
          flexDirection:"column",
          alignItems:"flex-start",
          gap:"0",
        }}>
          <h1 style={{fontSize:"22px" , margin: 0}}>
            {header}
          </h1>
          <p style={{fontSize:"16px",textAlign:"left" , margin: 0}}>
            {paragraph}
          </p>
          <h6 style={{fontSize:"14px",color:"#909090" , margin: 0}}>
            {date}
          </h6>
        </div>
      </div>
  )
}
