'use client'
import React, { useEffect, useState } from "react"

export default function ScrollProgressBar({ sectionCount, sectionTitles = [] }) {
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const sections = document.querySelectorAll("section")
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, 
    }

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(sections).indexOf(entry.target)
          setActiveSection(idx)
        }
      })
    }

    const observer = new window.IntersectionObserver(callback, options)
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const barHeight = 60
  const barTop = (barHeight / sectionCount) * activeSection + (barHeight / sectionCount) / 2

  const handleBarClick = (idx) => {
    const sections = document.querySelectorAll("section")
    if (sections[idx]) {
      sections[idx].scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div style={{
      position: "fixed",
      left: 20,
      top: "50%",
      transform: "translateY(-50%)",
      width: "6px",
      height: "60vh",
      background: "#222",
      borderRadius: "3px",
      zIndex: 1000,
      overflow: "visible"
    }}>
      <div style={{
        width: "100%",
        height: `${((activeSection + 1) / sectionCount) * 100}%`,
        background: "#fff",
        transition: "height 0.3s",
      }} />
      {Array.from({ length: sectionCount }).map((_, idx) => (
        <div
          key={idx}
          onClick={() => handleBarClick(idx)}
          style={{
            position: "absolute",
            left: "-8px",
            width: "22px",
            height: `calc(60vh / ${sectionCount})`,
            top: `calc((${barHeight} / ${sectionCount}) * ${idx}vh)`,
            cursor: "pointer",
            background: "transparent",
            zIndex: 1100
          }}
          title={sectionTitles[idx] || `Section ${idx + 1}`}
        />
      ))}
      <div style={{
        position: "absolute",
        top: `calc(${barTop}vh - 12px)`,
        display: "flex",
        alignItems: "center",
        transition: "top 0.3s",
      }}>
        <div style={{
          width: "28px",
          height: "6px",
          background: "#fff",
          marginRight: "12px",
          borderRadius: "2px",
          boxShadow: "0 0 4px #0002"
        }} />
        <span style={{
          color: "#fff",
          fontSize: "1rem",
          fontWeight: 500,
          background: "#222",
          padding: "2px 12px",
          borderRadius: "4px",
          boxShadow: "0 0 4px #0002"
        }}>
          {sectionTitles[activeSection] || ""}
        </span>
      </div>
    </div>
  )
}