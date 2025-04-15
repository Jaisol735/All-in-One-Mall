"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./GameReward.css"

function GameReward() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [converting, setConverting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    fetchUserData(JSON.parse(loggedInUser))
  }, [navigate])

  const fetchUserData = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      // If we have a user ID, fetch from backend
      if (userData.id) {
        const response = await fetch(`http://localhost:3001/api/user/${userData.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`)
        }

        const data = await response.json()
        console.log("User data from API:", data) // Debug log

        // Ensure numeric values
        const formattedData = {
          ...data,
          balance: typeof data.balance === "number" ? data.balance : Number.parseFloat(data.balance) || 0,
          reward_points:
            typeof data.reward_points === "number" ? data.reward_points : Number.parseInt(data.reward_points) || 0,
        }

        setUserData(formattedData)
      } else {
        // Use demo data for hardcoded login
        setUserData({
          name: userData.name || "JAINAM",
          balance: 50,
          reward_points: 15,
        })
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to load user data. Please try again later.")

      // Fallback user data
      setUserData({
        name: "JAINAM",
        balance: 50.0,
        reward_points: 15,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConvertRewards = async () => {
    try {
      setConverting(true)
      const user = JSON.parse(localStorage.getItem("user"))

      if (!user || !user.id) {
        throw new Error("User ID not found")
      }

      const response = await fetch("http://localhost:3001/api/convert-rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to convert rewards")
      }

      const data = await response.json()

      alert(`Successfully converted ${data.convertedAmount} reward points to balance!`)

      // Refresh user data
      fetchUserData(user)
    } catch (err) {
      console.error("Error converting rewards:", err)
      alert(err.message || "Error converting rewards. Please try again.")
    } finally {
      setConverting(false)
    }
  }

  // Format balance to display
  const formatBalance = (balance) => {
    if (typeof balance === "number") {
      return balance.toFixed(2)
    }

    const numBalance = Number.parseFloat(balance)
    return isNaN(numBalance) ? "0.00" : numBalance.toFixed(2)
  }

  return (
    <div>
      <Navbar />
      <div className="reward-page">

      <div className="reward-container">
        <h1>Rewards</h1>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading rewards data...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && userData && (
          <div className="reward-content">
            <div className="reward-card">
              <div className="reward-info">
                <h2>Reward Points</h2>
                <div className="reward-value">{userData.reward_points || 0}</div>
              </div>
            </div>

            <div className="reward-card">
              <div className="reward-info">
                <h2>Current Balance</h2>
                <div className="balance-value">₹{formatBalance(userData.balance)}</div>
              </div>
            </div>

            <div className="reward-actions">
              <p className="reward-description">Convert your reward points to balance. Each reward point equals ₹1.</p>

              <button
                className="convert-button"
                onClick={handleConvertRewards}
                disabled={(userData.reward_points || 0) <= 0 || converting}
              >
                {converting ? "Converting..." : "Convert Rewards to Balance"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
    
  )
}

export default GameReward