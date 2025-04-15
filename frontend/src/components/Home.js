"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./Home.css"

// Define placeholder image URLs to prevent glitching
const PLACEHOLDER_IMAGES = {
  games: "https://framerusercontent.com/assets/fMoMrPSg1ZFlMrVYyz7fPq21hJM.png",
  shopping: "https://www.retail4growth.com/public/uploads/editor/2023-01-27/1674799241.jpg",
  movies: "https://content.jdmagicbox.com/v2/comp/mumbai/y7/022pxx22.xx22.171220061110.t7y7/catalogue/pvr-icon-cinemas-pxl-oberoi-mall--goregaon-east-mumbai-pvr-cinemas-0tdbylvnsf.jpg",
  food: "https://content.jdmagicbox.com/v2/comp/mumbai/58/022pf012358/catalogue/foodmall-andheri-east-mumbai-general-stores-tpj1ldnrav.jpg",
}

function Home() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    try {
      const userData = JSON.parse(loggedInUser)
      setUser(userData)
    } catch (error) {
      console.error("Error parsing user data:", error)
      navigate("/")
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // If still loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // If no user after loading, redirect to login
  if (!user) {
    return null
  }

  return (
    <div>
      <Navbar />
      <div className="home-page">
      

      <div className="home-container">
        <h1>Welcome to Mall Platform</h1>

        <div className="options">
          <Link to="/game" className="option-link">
            <div className="option">
              <div className="image-container">
                <img src={PLACEHOLDER_IMAGES.games || "/placeholder.svg"} alt="Games" className="option-image" />
              </div>
              <h2>Games</h2>
            </div>
          </Link>

          <Link to="/shop" className="option-link">
            <div className="option">
              <div className="image-container">
                <img src={PLACEHOLDER_IMAGES.shopping || "/placeholder.svg"} alt="Shopping" className="option-image" />
              </div>
              <h2>Shopping</h2>
            </div>
          </Link>

          <Link to="/movies" className="option-link">
            <div className="option">
              <div className="image-container">
                <img src={PLACEHOLDER_IMAGES.movies || "/placeholder.svg"} alt="Movies" className="option-image" />
              </div>
              <h2>Movies</h2>
            </div>
          </Link>

          <Link to="/food" className="option-link">
            <div className="option">
              <div className="image-container">
                <img src={PLACEHOLDER_IMAGES.food || "/placeholder.svg"} alt="Food" className="option-image" />
              </div>
              <h2>Food</h2>
            </div>
          </Link>
        </div>
      </div>
    </div>
    </div>
    
  )
}

export default Home

