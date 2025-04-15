"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./TransactionHistory.css"

function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    fetchTransactions(JSON.parse(loggedInUser))
  }, [navigate])

  const fetchTransactions = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      if (!userData || !userData.id) {
        // For demo purposes, show empty transactions instead of error
        setTransactions([])
        setLoading(false)
        return
      }

      console.log("Fetching transactions for user ID:", userData.id) // Debug log

      const response = await fetch(`http://localhost:3001/api/transactions?userId=${userData.id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const data = await response.json()
      console.log("Transaction data:", data) // Debug log

      // Format transaction data
      const formattedTransactions = data.map((transaction) => ({
        ...transaction,
        amount:
          typeof transaction.amount === "number" ? transaction.amount : Number.parseFloat(transaction.amount) || 0,
      }))

      setTransactions(formattedTransactions)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Error loading transaction history. Please try again later.")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString // Return original if invalid date
      }
      return date.toLocaleString()
    } catch (error) {
      console.error("Date formatting error:", error)
      return dateString
    }
  }

  // Format amount to display
  const formatAmount = (amount) => {
    if (typeof amount === "number") {
      return amount.toFixed(2)
    }

    const numAmount = Number.parseFloat(amount)
    return isNaN(numAmount) ? "0.00" : numAmount.toFixed(2)
  }

  // Get transaction type display name
  const getTransactionTypeDisplay = (type, status) => {
    let displayType = ""

    switch (type) {
      case "Shop":
        displayType = "Shop Purchase"
        break
      case "Food":
        displayType = "Food Order"
        break
      case "Movie":
        displayType = "Movie Ticket"
        break
      default:
        displayType = type
    }

    // Add status information if available
    if (status === "Refunded") {
      displayType += " (Refunded)"
    } else if (status === "Cancelled") {
      displayType += " (Cancelled)"
    }

    return displayType
  }

  return (
    <div>
      <Navbar />
      <div className="transaction-page">
      

      <div className="transaction-container">
        <h1>Transaction History</h1>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && transactions.length === 0 && (
          <div className="empty-transactions">
            <p>No transactions found</p>
            <p className="sub-text">
              Your transaction history will appear here once you make purchases or convert rewards.
            </p>
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="transaction-list">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Item Name</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.history_id}
                    className={`transaction-${transaction.transaction_type?.toLowerCase() || "default"} ${
                      transaction.status?.toLowerCase() === "refunded" ? "transaction-refunded" : ""
                    }`}
                  >
                    <td>{formatDate(transaction.created_at || transaction.transaction_date)}</td>
                    <td>{getTransactionTypeDisplay(transaction.transaction_type, transaction.status)}</td>
                    <td>${formatAmount(transaction.amount)}</td>
                    <td>{transaction.status || "Completed"}</td>
                    <td>{transaction.payment_method || "Wallet"}</td>
                    <td>{transaction.item_name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
    
  )
}

export default TransactionHistory

