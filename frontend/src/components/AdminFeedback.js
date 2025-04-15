"use client"

import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import "./AdminFeedback.css"

function AdminFeedback() {
  const [newFeedbacks, setNewFeedbacks] = useState([])
  const [inProgressFeedbacks, setInProgressFeedbacks] = useState([])
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.isAdmin) {
      window.location.href = "/home"
      return
    }

    fetchNewFeedbacks()
    fetchInProgressFeedbacks()
  }, [])

  const fetchNewFeedbacks = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/admin/feedback/new")
      if (!response.ok) {
        throw new Error("Failed to fetch new feedbacks")
      }
      const data = await response.json()
      setNewFeedbacks(data)
    } catch (error) {
      console.error("Error fetching new feedbacks:", error)
      setError("Failed to load new feedbacks")
    } finally {
      setLoading(false)
    }
  }

  const fetchInProgressFeedbacks = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/admin/feedback/in-progress")
      if (!response.ok) {
        throw new Error("Failed to fetch in-progress feedbacks")
      }
      const data = await response.json()
      setInProgressFeedbacks(data)
    } catch (error) {
      console.error("Error fetching in-progress feedbacks:", error)
      setError("Failed to load in-progress feedbacks")
    } finally {
      setLoading(false)
    }
  }

  const startResolving = async (feedbackId) => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/feedback/start-resolving", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId }),
      })

      if (!response.ok) {
        throw new Error("Failed to start resolving feedback")
      }

      fetchNewFeedbacks()
      fetchInProgressFeedbacks()
      setSelectedFeedback(null)
    } catch (error) {
      console.error("Error starting to resolve feedback:", error)
      setError("Failed to start resolving feedback")
    }
  }

  const markAsResolved = async (feedbackId) => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/feedback/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark feedback as resolved")
      }

      fetchNewFeedbacks()
      fetchInProgressFeedbacks()
      setSelectedFeedback(null)
    } catch (error) {
      console.error("Error marking feedback as resolved:", error)
      setError("Failed to mark feedback as resolved")
    }
  }

  const viewFeedbackDetails = (feedback) => {
    setSelectedFeedback(feedback)
  }

  return (
    <div>
      <Navbar />
      <div className="admin-feedback-page">
      
      <div className="admin-feedback-container">
        <h1>Admin Feedback Management</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="feedback-sections">
          <div className="feedback-section">
            <h2>New Feedbacks</h2>
            {loading ? (
              <p>Loading...</p>
            ) : newFeedbacks.length === 0 ? (
              <p>No new feedbacks available.</p>
            ) : (
              <ul className="feedback-list">
                {newFeedbacks.map((feedback) => (
                  <li key={feedback.feedback_id} className="feedback-item">
                    <div className="feedback-summary">
                      <span>From: {feedback.username}</span>
                      <span>Category: {feedback.category_type}</span>
                      <span>Item: {feedback.category_name}</span>
                      <button onClick={() => viewFeedbackDetails(feedback)}>Show Details</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="feedback-section">
            <h2>In Progress Feedbacks</h2>
            {loading ? (
              <p>Loading...</p>
            ) : inProgressFeedbacks.length === 0 ? (
              <p>No in-progress feedbacks available.</p>
            ) : (
              <ul className="feedback-list">
                {inProgressFeedbacks.map((feedback) => (
                  <li key={feedback.feedback_id} className="feedback-item">
                    <div className="feedback-summary">
                      <span>From: {feedback.username}</span>
                      <span>Category: {feedback.category_type}</span>
                      <span>Item: {feedback.category_name}</span>
                      <button onClick={() => viewFeedbackDetails(feedback)}>Show Details</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {selectedFeedback && (
          <div className="feedback-details">
            <h2>Feedback Details</h2>
            <div className="details-content">
              <p>
                <strong>User:</strong> {selectedFeedback.username}
              </p>
              <p>
                <strong>Category:</strong> {selectedFeedback.category_type}
              </p>
              <p>
                <strong>Item:</strong> {selectedFeedback.category_name}
              </p>
              <p>
                <strong>Description:</strong> {selectedFeedback.description}
              </p>
              <p>
                <strong>Submitted:</strong> {new Date(selectedFeedback.created_at).toLocaleString()}
              </p>

              {selectedFeedback.admin_status === "New" ? (
                <button
                  className="action-button start-button"
                  onClick={() => startResolving(selectedFeedback.feedback_id)}
                >
                  Start Resolving
                </button>
              ) : (
                <button
                  className="action-button resolve-button"
                  onClick={() => markAsResolved(selectedFeedback.feedback_id)}
                >
                  Mark as Resolved
                </button>
              )}

              <button className="action-button close-button" onClick={() => setSelectedFeedback(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
    
  )
}

export default AdminFeedback

