"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./Feedback.css"

function Feedback() {
  // State for user data
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // State for feedback form
  const [categoryType, setCategoryType] = useState("Product")
  const [items, setItems] = useState([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [description, setDescription] = useState("")
  const [userFeedbacks, setUserFeedbacks] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState("")

  // Check if user is logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    // Parse user data from localStorage
    const user = JSON.parse(loggedInUser)
    fetchUserData(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  // Fetch user data
  const fetchUserData = async (userId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/user/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      const data = await response.json()
      setUserData(data)

      // After getting user data, fetch feedbacks
      fetchUserFeedbacks(userId)
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to load user data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch items based on selected category
  const fetchItemsByCategory = async () => {
    setLoading(true)
    setError("")
    try {
      let endpoint = ""
      switch (categoryType) {
        case "Product":
          endpoint = "http://localhost:3001/api/products"
          break
        case "Food":
          endpoint = "http://localhost:3001/api/foods"
          break
        case "Movie":
          endpoint = "http://localhost:3001/api/movies"
          break
        default:
          endpoint = "http://localhost:3001/api/products"
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`)
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching items:", error)
      setError("Failed to load items. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch user feedbacks
  const fetchUserFeedbacks = async (userId) => {
    if (!userId) return

    setLoading(true)
    setError("")
    try {
      const response = await fetch(`http://localhost:3001/api/feedback/user?userId=${userId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch feedbacks: ${response.statusText}`)
      }
      const data = await response.json()
      setUserFeedbacks(data)
    } catch (error) {
      console.error("Error fetching user feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch items when category changes
  useEffect(() => {
    fetchItemsByCategory()
    // Reset selected item when category changes
    setSelectedItemId("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryType])

  // Handle item selection
  const handleItemChange = (e) => {
    const itemId = e.target.value
    setSelectedItemId(itemId)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userData) {
      setError("Please log in to submit feedback")
      return
    }

    const userId = userData.user_id

    if (!selectedItemId) {
      setError("Please select an item")
      return
    }

    if (!description.trim()) {
      setError("Please provide a description")
      return
    }

    if (description.length > 2000) {
      setError("Description must be less than 2000 characters")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:3001/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          categoryType,
          categoryId: selectedItemId,
          description,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Feedback submitted successfully!")
        setCategoryType("Product")
        setSelectedItemId("")
        setDescription("")
        // Refresh the user feedbacks list
        fetchUserFeedbacks(userId)
      } else {
        setError(data.message || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (loading && !userData) {
    return (
      <div className="feedback-page">
        <Navbar />
        <div className="feedback-container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-page">
      <Navbar />
      <div className="feedback-container">
        <div className="feedback-form-container">
          <h2>Submit Feedback</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="categoryType">Category Type:</label>
              <select
                id="categoryType"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                disabled={isSubmitting}
                required
              >
                <option value="Product">Product</option>
                <option value="Food">Food</option>
                <option value="Movie">Movie</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="itemName">Item:</label>
              <select
                id="itemName"
                value={selectedItemId}
                onChange={handleItemChange}
                disabled={isSubmitting || items.length === 0}
                required
              >
                <option value="">Select an item</option>
                {items.map((item) => {
                  const itemId =
                    categoryType === "Product" ? item.item_id : categoryType === "Food" ? item.food_id : item.movie_id
                  return (
                    <option key={itemId} value={itemId}>
                      {item.name}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (max 2000 characters):</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="6"
                maxLength="2000"
                disabled={isSubmitting}
                required
              ></textarea>
              <div className="character-count">{description.length}/2000 characters</div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default Feedback

