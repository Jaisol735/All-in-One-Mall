"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./Orders.css"

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    fetchOrders()

    // Set up interval to update time left
    const intervalId = setInterval(() => {
      updateTimeLeft()
    }, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`http://localhost:3001/api/orders?userId=${user.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()

      // Filter out deposit transactions (where purchase_id is 0)
      const filteredOrders = data.filter((order) => !(order.purchase_id === 0 && order.item_name === null))

      setOrders(filteredOrders)
      calculateInitialTimeLeft(filteredOrders)
      setError(null)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Error loading orders. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const calculateInitialTimeLeft = (orderData) => {
    const timeLeftObj = {}

    orderData.forEach((order) => {
      const createdAt = new Date(order.created_at)
      let deliveryTime

      if (order.purchase_type === "Shop") {
        // Shop products: 2 days delivery time
        deliveryTime = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
      } else if (order.purchase_type === "Food") {
        // Food: 30 minutes delivery time
        deliveryTime = new Date(createdAt.getTime() + 30 * 60 * 1000)
      } else if (order.purchase_type === "Movie") {
        // For movies, use the showtime as delivery time
        deliveryTime = order.show_time ? new Date(order.show_time) : null
      }

      if (deliveryTime) {
        const now = new Date()
        const diff = deliveryTime - now

        if (diff > 0) {
          timeLeftObj[order.order_id] = formatTimeLeft(diff)
        } else {
          timeLeftObj[order.order_id] = "Delivered"
        }
      } else {
        timeLeftObj[order.order_id] = "N/A"
      }
    })

    setTimeLeft(timeLeftObj)
  }

  const updateTimeLeft = () => {
    setTimeLeft((prevTimeLeft) => {
      const updatedTimeLeft = { ...prevTimeLeft }

      orders.forEach((order) => {
        const createdAt = new Date(order.created_at)
        let deliveryTime

        if (order.purchase_type === "Shop") {
          deliveryTime = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
        } else if (order.purchase_type === "Food") {
          deliveryTime = new Date(createdAt.getTime() + 30 * 60 * 1000)
        } else if (order.purchase_type === "Movie") {
          deliveryTime = order.show_time ? new Date(order.show_time) : null
        }

        if (deliveryTime) {
          const now = new Date()
          const diff = deliveryTime - now

          if (diff > 0) {
            updatedTimeLeft[order.order_id] = formatTimeLeft(diff)
          } else {
            updatedTimeLeft[order.order_id] = "Delivered"

            // If status is not already completed, update it
            if (order.status !== "Completed") {
              updateOrderStatus(order.order_id, "Completed")
            }
          }
        }
      })

      return updatedTimeLeft
    })
  }

  const formatTimeLeft = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch("http://localhost:3001/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update local state
      setOrders((prevOrders) => prevOrders.map((order) => (order.order_id === orderId ? { ...order, status } : order)))
    } catch (err) {
      console.error("Error updating order status:", err)
    }
  }

  const handleCancelOrder = async (order) => {
    try {
      const now = new Date()
      const createdAt = new Date(order.created_at)
      let canCancel = false
      let reason = ""

      if (order.purchase_type === "Shop") {
        // Shop products: Can cancel before 1 day of delivery
        const deliveryTime = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
        const oneDayBeforeDelivery = new Date(deliveryTime.getTime() - 24 * 60 * 60 * 1000)
        canCancel = now < oneDayBeforeDelivery
        reason = "Shop orders can only be cancelled before 1 day of delivery"
      } else if (order.purchase_type === "Food") {
        // Food: Can cancel within 10 mins
        const tenMinutesAfterOrder = new Date(createdAt.getTime() + 10 * 60 * 1000)
        canCancel = now < tenMinutesAfterOrder
        reason = "Food orders can only be cancelled within 10 minutes of ordering"
      } else if (order.purchase_type === "Movie") {
        // Movie: Can cancel before 1 day of showtime
        if (order.show_time) {
          const showTime = new Date(order.show_time)
          const oneDayBeforeShow = new Date(showTime.getTime() - 24 * 60 * 60 * 1000)
          canCancel = now < oneDayBeforeShow
          reason = "Movie tickets can only be cancelled before 1 day of the show"
        } else {
          canCancel = false
          reason = "Cannot determine show time"
        }
      }

      if (!canCancel) {
        alert(`Cannot cancel this order: ${reason}`)
        return
      }

      // Get the seat_id for movie tickets
      let seatId = null
      if (order.purchase_type === "Movie") {
        // Fetch the seat_id from the server
        const seatResponse = await fetch(`http://localhost:3001/api/orders/${order.order_id}/seat`)
        if (seatResponse.ok) {
          const seatData = await seatResponse.json()
          seatId = seatData.seat_id
        }
      }

      const response = await fetch("http://localhost:3001/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.order_id,
          userId: JSON.parse(localStorage.getItem("user")).id,
          amount: order.amount,
          purchaseType: order.purchase_type,
          purchaseId: order.purchase_id,
          seatId: seatId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to cancel order")
      }

      alert("Order cancelled successfully. Refund has been processed.")
      fetchOrders() // Refresh orders
    } catch (err) {
      console.error("Error cancelling order:", err)
      alert(err.message || "Error cancelling order. Please try again.")
    }
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed"
      case "Cancelled":
        return "status-cancelled"
      case "Pending":
        return "status-pending"
      case "Upcoming":
        return "status-upcoming"
      default:
        return ""
    }
  }

  // Function to check if cancel button should be shown
  const shouldShowCancelButton = (order) => {
    // Don't show cancel button if order is already completed or cancelled
    if (order.status === "Completed" || order.status === "Cancelled") {
      return false
    }

    const now = new Date()
    const createdAt = new Date(order.created_at)

    if (order.purchase_type === "Shop") {
      // Shop products: Hide cancel button after 2 days (delivery time)
      const deliveryTime = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
      return now < deliveryTime
    } else if (order.purchase_type === "Food") {
      // Food: Hide cancel button after 30 minutes (delivery time)
      const deliveryTime = new Date(createdAt.getTime() + 30 * 60 * 1000)
      return now < deliveryTime
    } else if (order.purchase_type === "Movie") {
      // Movie: Hide cancel button after showtime
      if (order.show_time) {
        const showTime = new Date(order.show_time)
        return now < showTime
      }
    }

    return true // Default to showing the button if conditions aren't met
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

  return (
    <div>
      <Navbar />
      <div className="orders-page">
      

      <div className="orders-container">
        <h1>My Orders</h1>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <p>You haven't placed any orders yet</p>
            <div className="order-actions">
              <button onClick={() => navigate("/shop")} className="shop-button">
                Shop Now
              </button>
              <button onClick={() => navigate("/food")} className="food-button">
                Order Food
              </button>
              <button onClick={() => navigate("/movies")} className="movie-button">
                Book Movie Tickets
              </button>
            </div>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            <div>
              <h1>Order Cancelation Terms and Condition</h1>
              <h1>Shop products can be canceled before 1 day of delivery</h1>
              <h1>Food can be canceled until 10 mins from ordered</h1>
              <h1>Movie seat can be canceled before 1 day of movie show</h1>
            </div>
            {orders.map((order) => (
              <div key={order.order_id} className="order-item">
                <div className="order-header">
                  <div className="order-id">Order #{order.order_id}</div>
                  <div className="order-date">{new Date(order.created_at).toLocaleString()}</div>
                </div>

                <div className="order-content">
                  <div className="order-image">
                    <img
                      src={getImageUrl(order.image_url, order.purchase_type) || "/placeholder.svg"}
                      alt={order.item_name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                  </div>

                  <div className="order-details">
                    <h3>{order.item_name}</h3>
                    <p className="order-type">{getItemTypeLabel(order.purchase_type)}</p>
                    {order.purchase_type === "Movie" && order.seat_number && (
                      <p className="order-seat">Seat: {order.seat_number}</p>
                    )}
                    {order.purchase_type === "Movie" && order.show_time && (
                      <p className="order-showtime">Showtime: {new Date(order.show_time).toLocaleString()}</p>
                    )}
                    <p className="order-amount">${Number.parseFloat(order.amount).toFixed(2)}</p>
                    <p className="order-quantity">Quantity: {order.quantity || 1}</p>
                  </div>

                  <div className="order-status-container">
                    <div className={`order-status ${getStatusClass(order.status)}`}>{order.status}</div>

                    {order.status !== "Completed" && order.status !== "Cancelled" && (
                      <div className="order-tracking">
                        <div className="time-left">
                          <span className="clock-icon">⏱️</span>
                          <span>{timeLeft[order.order_id] || "Calculating..."}</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{
                              width:
                                timeLeft[order.order_id] === "Delivered"
                                  ? "100%"
                                  : timeLeft[order.order_id] === "N/A"
                                    ? "0%"
                                    : "50%",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    {shouldShowCancelButton(order) && (
                      <button className="cancel-button" onClick={() => handleCancelOrder(order)}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
    
  )
}

export default Orders

