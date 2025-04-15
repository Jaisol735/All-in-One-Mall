"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "./Navbar.css"

function Navbar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user")
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          <h1>ALL IN ONE</h1>
        </Link>

        <div className="navbar-links">
          <Link to="/cart" className="navbar-link">
            <div className="navbar-icon">🛒</div>
            <span>Cart</span>
          </Link>

          <Link to="/orders" className="navbar-link">
            <div className="navbar-icon">📦</div>
            <span>Orders</span>
          </Link>

          <Link to="/transactions" className="navbar-link">
            <div className="navbar-icon">📜</div>
            <span>Transactions</span>
          </Link>

          <Link to="/rewards" className="navbar-link">
            <div className="navbar-icon">🏆</div>
            <span>Rewards</span>
          </Link>

          <Link to="/account" className="navbar-link">
            <div className="navbar-icon">👤</div>
            <span>Account</span>
          </Link>
          {!user.isAdmin && (
          <>
            <Link to="/feedback" className="navbar-link">
              <div className="navbar-icon">❓</div>
              <span>Feedback</span>
            </Link>
          </>
        )}

          {user.isAdmin && (
            <>
              <Link to="/admin-feedback" className="navbar-link">
                <div className="navbar-icon">❓</div>
                <span>Admin Feedback</span>
              </Link>

              <Link to="/data-analysis" className="navbar-link admin-link">
                <div className="navbar-icon">📊</div>
                <span>Data Analysis</span>
              </Link>

              <Link to="/admin" className="navbar-link admin-link">
                <div className="navbar-icon">⚙️</div>
                <span>Admin</span>
              </Link>
            </>
          )}

          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

