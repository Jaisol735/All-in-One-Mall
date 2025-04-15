"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import UserManagement from "./UserManagement"
import RewardManagement from "./RewardManagement"
import ShopManagement from "./ShopManagement"
import FoodManagement from "./FoodManagement"
import MovieManagement from "./MovieManagement"
import "./Admin.css"

function Admin() {
  const [activeSection, setActiveSection] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in and is admin
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    const user = JSON.parse(loggedInUser)
    if (!user.isAdmin) {
      navigate("/home")
      return
    }
  }, [navigate])

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement />
      case "rewards":
        return <RewardManagement />
      case "shop":
        return <ShopManagement />
      case "food":
        return <FoodManagement />
      case "movies":
        return <MovieManagement />
      default:
        return (
          <div className="admin-welcome">
            <h2>Welcome to Admin Panel</h2>
            <p>Please select an option from the menu to manage the mall application.</p>
          </div>
        )
    }
  }

  return (
    <div>
      <Navbar />
      <div className="admin-page">
      <div className="admin-container">
        <div className="admin-sidebar">
          <button className="admin-button" onClick={() => navigate("/home")}>
            Back to Home
          </button>
          <button className="admin-button" onClick={() => setActiveSection("users")}>
            User Management
          </button>
          <button className="admin-button" onClick={() => setActiveSection("rewards")}>
            Reward Points
          </button>
          <button className="admin-button" onClick={() => setActiveSection("shop")}>
            Shop Management
          </button>
          <button className="admin-button" onClick={() => setActiveSection("food")}>
            Food Management
          </button>
          <button className="admin-button" onClick={() => setActiveSection("movies")}>
            Movie Management
          </button>
        </div>

        <div className="admin-content">{renderSection()}</div>
      </div>
    </div>
    </div>
  )
}

export default Admin

