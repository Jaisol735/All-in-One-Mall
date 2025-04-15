"use client"

import { useState } from "react"
import "./Food.css"

function FoodDetails({ food, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const increaseQuantity = () => {
    if (quantity < food.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }
  // Function to convert file path to usable URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=200&width=200"

    // Extract filename from path
    const parts = imagePath.split("/")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/food/${filename}`
  }

  const totalPrice = Number.parseFloat(food.price) * quantity

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      const user = JSON.parse(localStorage.getItem("user"))

      if (!user || !user.id) {
        throw new Error("User not found")
      }

      const response = await fetch("http://localhost:3001/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: food.food_id,
          quantity: quantity,
          purchaseType: "Food",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add item to cart")
      }

      alert(`Added ${quantity} ${food.name}(s) to cart!`)
      onClose()
    } catch (err) {
      console.error("Error adding to cart:", err)
      alert("Error adding item to cart. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="food-modal-overlay">
      <div className="food-modal-content">
        <button className="food-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="food-modal-details">
          <div className="food-modal-image">
            <img
              src={getImageUrl(food.image_url) || "/placeholder.svg?height=300&width=300"}
              alt={food.name}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=300&width=300"
              }}
            />
          </div>

          <div className="food-modal-info">
            <h2 className="food-modal-name">{food.name}</h2>
            <p className="food-modal-category">{food.category}</p>
            <p className="food-modal-price">₹{Number.parseFloat(food.price).toFixed(2)}</p>

            <div className="food-modal-description">
              <h3>Description</h3>
              <p>{food.description}</p>
            </div>

            <div className="food-quantity-selector">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button className="quantity-btn" onClick={decreaseQuantity} disabled={quantity <= 1}>
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button className="quantity-btn" onClick={increaseQuantity} disabled={quantity >= food.stock}>
                  +
                </button>
              </div>
            </div>

            <div className="food-total">
              <h3>Total</h3>
              <p className="total-price">₹{totalPrice.toFixed(2)}</p>
            </div>

            <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={adding}>
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodDetails

