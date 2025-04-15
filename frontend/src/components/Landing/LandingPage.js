"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LandingPage.css"
import FeatureCard from "./FeatureCard"
import GamesImg from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/Games.jpg"
import ShopsImg from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/Shops.jpg"
import MoviesImg from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/Movies.jpg"
import FoodImg from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/Food.jpg"
import ALLINONE from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/AllInOne.jpg"


const Landing = () => {
  const [activeNavItem, setActiveNavItem] = useState(null)
  const navigate = useNavigate()

  const handleNavHover = (item) => {
    setActiveNavItem(item)
  }

  const handleNavLeave = () => {
    setActiveNavItem(null)
  }

  const handleLogin = () => {
    navigate("/login")
  }

  const handleSignup = () => {
    navigate("/signup")
  }

  return (
    <div className="landing-container">
      <header className="header">
        <div className="brand">All In One</div>
        <nav className="nav">
          <div
            className="nav-item"
            onMouseEnter={() => handleNavHover("login")}
            onMouseLeave={handleNavLeave}
            onClick={handleLogin}
          >
            Login
          </div>
          <div
            className="nav-item"
            onMouseEnter={() => handleNavHover("signup")}
            onMouseLeave={handleNavLeave}
            onClick={handleSignup}
          >
            Signup
            {activeNavItem === "signup" && (
              <div className="nav-dropdown" onClick={(e) => e.stopPropagation()} style={{background:"transparent"}}></div>
            )}
          </div>
        </nav>
      </header>

      <main className="main-content">
        <div className="features-grid">
          <FeatureCard
            title="Games"
            description="Explore a variety of exciting games to play and win rewards."
            imageUrl={GamesImg}
          />

          <FeatureCard
            title="Shop"
            description="Browse and purchase from our wide selection of products."
            imageUrl={ShopsImg}
          />

          <div className="logo-container">
            <div className="logo-placeholder">
              <img
                src={ALLINONE}
                alt="All In One Logo"
                style={{ height: "100px", width: "100px", borderRadius: "50%" }}
              />
            </div>
          </div>

          <FeatureCard
            title="Movie"
            description="Watch the latest movies and TV shows from our collection."
            imageUrl={MoviesImg}
          />

          <FeatureCard
            title="Food"
            description="Order delicious food from your favorite restaurants."
            imageUrl={FoodImg}
          />
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} All In One. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Landing

