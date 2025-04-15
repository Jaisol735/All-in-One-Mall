"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./Cart.css"

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    fetchCartItems()
  }, [navigate])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`http://localhost:3001/api/cart?userId=${user.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch cart items")
      }

      const data = await response.json()
      setCartItems(data)

      // Calculate total price
      const total = data.reduce((sum, item) => sum + item.price * item.quantity, 0)
      setTotalPrice(total)

      setError(null)
    } catch (err) {
      console.error("Error fetching cart:", err)
      setError("Error loading cart items. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (cartId) => {
    try {
      const response = await fetch("http://localhost:3001/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove item")
      }

      // Refresh cart items
      fetchCartItems()
    } catch (err) {
      console.error("Error removing item:", err)
      setError("Error removing item. Please try again.")
    }
  }

  const handleCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      const response = await fetch("http://localhost:3001/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed")
      }

      alert("Transaction complete! Your order has been placed.")
      setCartItems([])
      setTotalPrice(0)
      navigate("/transactions")
    } catch (err) {
      console.error("Checkout error:", err)
      alert(err.message || "Error during checkout. Please try again.")
    }
  }

  // Function to convert file path to usable URL
  const getImageUrl = (imagePath, type) => {
    if (!imagePath) {
      return "/placeholder.svg?height=100&width=100"
    }

    // Extract filename from path
    const parts = imagePath.includes("\\") ? imagePath.split("\\") : imagePath.split("/")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/${type.toLowerCase()}/${filename}`
  }

  const getItemTypeLabel = (itemType) => {
    switch (itemType) {
      case "Shop":
        return "Product"
      case "Food":
        return "Food Item"
      case "Movie":
        return "Movie Ticket"
      default:
        return itemType
    }
  }

  return (
    <div>
      <Navbar />
      <div className="cart-page">
      

      <div className="cart-container">
        <h1>Shopping Cart</h1>

        {loading && <div className="loading">Loading cart...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && cartItems.length === 0 && (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <div className="cart-actions">
              <button onClick={() => navigate("/shop")} className="continue-shopping">
                Continue Shopping
              </button>
              <button onClick={() => navigate("/food")} className="continue-shopping">
                Order Food
              </button>
              <button onClick={() => navigate("/movies")} className="continue-shopping">
                Book Movie Tickets
              </button>
            </div>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cart_id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={getImageUrl(item.image_url, item.item_type) || "/placeholder.svg"}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                  </div>

                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-type">{getItemTypeLabel(item.item_type)}</p>
                    {item.item_type === "Movie" && item.seat_number && (
                      <p className="item-seat">Seat: {item.seat_number}</p>
                    )}
                    {item.item_type === "Movie" && item.show_time && (
                      <p className="item-showtime">Showtime: {new Date(item.show_time).toLocaleString()}</p>
                    )}
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>

                  <button className="remove-button" onClick={() => handleRemoveItem(item.cart_id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="total-price">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>

              <button className="checkout-button" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  )
}

export default Cart

