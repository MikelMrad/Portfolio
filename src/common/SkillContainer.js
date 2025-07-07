import Image from "next/image"

export default function SkillContainer({src, language}) {
  return (
      <div
      style={{
        backgroundColor: "#ffffff",
        color: "#404040",
        padding: "5px 15px",
        borderRadius: "50px",
        width: "fit-content",
        fontSize: "14px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Image 
          src={src}
          height={40}
          width={40}
          alt="Image"/>
        <h1 style={{margin:"0 0 0 10px"}} >{language}</h1>
      </div>
  )
}
