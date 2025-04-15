"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./WelcomeAnimation.css"
import ALLINONE from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/AllInOne.jpg"

const WelcomeAnimation = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to landing page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/landing")
    }, 3000)

    // Clean up the timer if component unmounts
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="welcome-container">
      <div className="logo-placeholder">
        <img
          src={ALLINONE}
          alt="All In One Logo"
          style={{ height: "100px", width: "100px", borderRadius: "50%" }}
        />
      </div>
      <h1 className="welcome-text">Welcome to ALL IN ONE</h1>
    </div>
  )
}

export default WelcomeAnimation

