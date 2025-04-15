"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Account.css"

function Account() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [processingDeposit, setProcessingDeposit] = useState(false)
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

        // Ensure numeric values
        const formattedData = {
          ...data,
          balance: typeof data.balance === "number" ? data.balance : Number.parseFloat(data.balance) || 0,
          reward_points:
            typeof data.reward_points === "number" ? data.reward_points : Number.parseInt(data.reward_points) || 0,
        }

        setUser(formattedData)
      } else {
        // Use demo data for hardcoded login
        setUser({
          name: userData.name || "Jainam",
          email: "solankijainam07@gmail.com",
          phone_number: "9136291039",
          balance: 200000.0,
          reward_points: 5,
          address: "703/A, Landsend Bldg., Lokhandwala Complex Andheri (W), Mumbai, Maharashtra 400053, India",
        })
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to load user data. Please try again later.")

      // Fallback user data
      setUser({
        name: "Jainam",
        email: "solankijainam07@gmail.com",
        phone_number: "9136291039",
        balance: 200000.0,
        reward_points: 5,
        address: "703/A, Landsend Bldg., Lokhandwala Complex Andheri (W), Mumbai, Maharashtra 400053, India",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDepositClick = () => {
    setShowDepositModal(true)
  }

  const handleCloseModal = () => {
    setShowDepositModal(false)
    setDepositAmount("")
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault()

    // Validate amount
    const amount = Number.parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      setProcessingDeposit(true)
      const loggedInUser = JSON.parse(localStorage.getItem("user"))

      const response = await fetch("http://localhost:3001/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUser.id,
          amount: amount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to deposit funds")
      }

      const data = await response.json()

      // Update user data with new balance
      setUser((prev) => ({
        ...prev,
        balance: data.newBalance,
      }))

      alert("Transaction complete! Funds have been added to your account.")
      handleCloseModal()
    } catch (error) {
      console.error("Deposit error:", error)
      alert(error.message || "Error processing deposit. Please try again.")
    } finally {
      setProcessingDeposit(false)
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
    <div className="account-page">
      <Navbar />

      <div className="account-container">
        <h1>My Account</h1>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading user data...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && user && (
          <div className="account-info">
            <div className="account-section">
              <h2>Personal Information</h2>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone_number}
              </p>
            </div>

            <div className="account-section">
              <h2>Shipping Address</h2>
              <p>{user.address}</p>
            </div>

            <div className="account-section">
              <h2>Account Balance</h2>
              <p className="balance">₹{formatBalance(user.balance)}</p>
              <p>
                <strong>Reward Points:</strong> {user.reward_points || 0}
              </p>
              <button className="deposit-button" onClick={handleDepositClick}>
                Deposit Funds
              </button>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="modal-overlay">
            <div className="deposit-modal">
              <h2>Deposit Funds</h2>
              <form onSubmit={handleDepositSubmit}>
                <div className="form-group">
                  <label htmlFor="amount">Amount to Deposit (₹):</label>
                  <input
                    type="number"
                    id="amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    required
                    placeholder="Enter amount"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseModal}
                    disabled={processingDeposit}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="confirm-button" disabled={processingDeposit}>
                    {processingDeposit ? "Processing..." : "Confirm Deposit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Account


