"use client"

import { useState } from "react"
import "./FeatureCard.css"

const FeatureCard = ({ title, description, imageUrl }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`feature-card ${isHovered ? "expanded" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-content">
        <h2>{title}</h2>
        <div className="card-image">
          <img src={imageUrl || "/placeholder.svg"} alt={title} />
        </div>
        <div className="card-description">
          <p>{description}</p>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard

