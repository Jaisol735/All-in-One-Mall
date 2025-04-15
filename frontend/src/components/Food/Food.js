"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import SearchBar from "./SearchBar"
import FoodList from "./FoodList"
import FoodDetails from "./FoodDetails"
import "./Food.css"

function Food() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFood, setSelectedFood] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    fetchFoods()
  }, [navigate])

  const fetchFoods = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/foods")
      if (!response.ok) {
        throw new Error("Failed to fetch foods")
      }
      const data = await response.json()
      setFoods(data)
      setError(null)
    } catch (err) {
      setError("Error fetching foods. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/foods/search?term=${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error("Failed to search foods")
      }
      const data = await response.json()
      setFoods(data)
      setError(null)
    } catch (err) {
      setError("Error searching foods. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFoodClick = (food) => {
    setSelectedFood(food)
  }

  const handleCloseDetails = () => {
    setSelectedFood(null)
  }

  return (
    <div className="food-page">
      <Navbar />

      <div className="food-container">
        <h1>Order Delicious Food</h1>

        <SearchBar onSearch={handleSearch} />

        {loading && <div className="loading">Loading foods...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && foods.length === 0 && <div className="no-results">No foods found</div>}

        {!loading && !error && foods.length > 0 && <FoodList foods={foods} onFoodClick={handleFoodClick} />}

        {selectedFood && <FoodDetails food={selectedFood} onClose={handleCloseDetails} />}
      </div>
    </div>
  )
}

export default Food

