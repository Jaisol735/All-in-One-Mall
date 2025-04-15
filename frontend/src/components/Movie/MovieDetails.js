"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Navbar from "../Navbar"
import "./MovieDetails.css"

function MovieDetails() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [user, setUser] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    setUser(JSON.parse(loggedInUser))
    fetchMovieDetails()
  }, [movieId, navigate])

  // Function to convert file path to usable URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x450?text=Movie+Poster"

    // Extract filename from path
    const parts = imagePath.split("/")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/movie/${filename}`
  }

  // Fetch movie details
  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/movies/${movieId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch movie details")
      }
      const data = await response.json()

      // Ensure price is a number
      const formattedData = {
        ...data,
        price: Number.parseFloat(data.price) || 0,
      }

      setMovie(formattedData)
      setError(null)
    } catch (err) {
      setError("Error fetching movie details. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch seats when a showtime is selected
  const fetchSeats = async (showtimeId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/movies/${movieId}/seats?showtimeId=${showtimeId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch seats")
      }
      const data = await response.json()
      setSeats(data)
      setSelectedSeats([])
      setTotalPrice(0)
      setError(null)
    } catch (err) {
      setError("Error fetching seats. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle showtime selection
  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime)
    fetchSeats(showtime.showtime_id)
  }

  // Handle seat selection
  const handleSeatSelect = (seat) => {
    if (seat.user_id !== null) return // Seat already booked

    const seatIndex = selectedSeats.findIndex((s) => s.seat_number === seat.seat_number)

    if (seatIndex === -1) {
      // Add seat to selection
      setSelectedSeats([...selectedSeats, seat])
      setTotalPrice(totalPrice + (movie ? movie.price : 0))
    } else {
      // Remove seat from selection
      const newSelectedSeats = [...selectedSeats]
      newSelectedSeats.splice(seatIndex, 1)
      setSelectedSeats(newSelectedSeats)
      setTotalPrice(totalPrice - (movie ? movie.price : 0))
    }
  }

  // Add to cart instead of direct payment
  const handleAddToCart = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat")
      return
    }

    try {
      setProcessing(true)

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user"))

      // Add each selected seat to cart
      for (const seat of selectedSeats) {
        const response = await fetch("http://localhost:3001/api/cart/add-movie-seat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            movieId: Number.parseInt(movieId),
            showtimeId: selectedShowtime.showtime_id,
            seatNumber: seat.seat_number,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to add seats to cart")
        }
      }

      alert("Movie tickets added to cart successfully!")
      navigate("/cart")
    } catch (err) {
      setError(err.message || "Error adding tickets to cart. Please try again.")
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  // Format date for display
  const formatShowtime = (datetime) => {
    try {
      const date = new Date(datetime)
      return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    } catch (error) {
      return datetime
    }
  }

  // Generate seat grid
  const renderSeats = () => {
    if (!selectedShowtime) return null

    // Create a structured seat map
    const rows = ["A", "B", "C", "D", "E"]
    const seatMap = {}

    // Initialize the seat map with empty seats
    rows.forEach((row) => {
      seatMap[row] = Array(10)
        .fill()
        .map((_, index) => ({
          seat_id: null,
          seat_number: `${row}${index + 1}`,
          user_id: null,
          showtime_id: selectedShowtime.showtime_id,
        }))
    })

    // Update the seat map with actual seat data if available
    if (seats.length > 0) {
      seats.forEach((seat) => {
        const row = seat.seat_number.charAt(0)
        const seatNum = Number.parseInt(seat.seat_number.substring(1))
        if (seatMap[row] && seatNum >= 1 && seatNum <= 10) {
          seatMap[row][seatNum - 1] = seat
        }
      })
    }

    return (
      <div className="seat-container">
        <div className="seat-grid">
          {rows.map((row) => (
            <div key={row} className="seat-row">
              <div className="row-label">{row}</div>
              <div className="seats">
                {Array(10)
                  .fill()
                  .map((_, index) => {
                    const seatNumber = index + 1
                    const seatId = `${row}${seatNumber}`
                    const seat = seatMap[row][index]
                    const isBooked = seat.user_id !== null
                    const isSelected = selectedSeats.some((s) => s.seat_number === seat.seat_number)

                    return (
                      <div
                        key={seatId}
                        className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                        onClick={() => !isBooked && handleSeatSelect(seat)}
                        style={{
                          borderColor: isBooked ? "#ff9800" : "#4caf50",
                          backgroundColor: isSelected ? "#4caf50" : "white",
                          color: isSelected ? "white" : "#333",
                        }}
                      >
                        {seatNumber}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="screen">
          <h1>SCREEN</h1>
        </div>

        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat-sample available" style={{ borderColor: "#4caf50", backgroundColor: "white" }}></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat-sample booked" style={{ borderColor: "#ff9800", backgroundColor: "#fff3e0" }}></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="seat-sample selected" style={{ borderColor: "#4caf50", backgroundColor: "#4caf50" }}></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !movie) {
    return (
      <div className="movie-details-page">
        <Navbar />
        <div className="loading">Loading movie details...</div>
      </div>
    )
  }

  if (error && !movie) {
    return (
      <div className="movie-details-page">
        <Navbar />
        <div className="error">{error}</div>
        <Link to="/movies" className="back-link">
          Back to Movies
        </Link>
      </div>
    )
  }

  return (
    <div className="movie-details-page">
      <Navbar />

      <div className="movie-details-container">
        <div className="movie-details-header">
          <Link to="/movies" className="back-link">
            Back to Movies
          </Link>
          <h1>{movie?.name}</h1>
        </div>

        <div className="movie-details-content">
          <div className="movie-poster">
            <img
              src={
                movie?.image_url
                  ? getImageUrl(movie.image_url)
                  : "https://via.placeholder.com/300x450?text=Movie+Poster"
              }
              alt={movie?.name}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "https://via.placeholder.com/300x450?text=Movie+Poster"
              }}
            />
          </div>

          <div className="movie-info-details">
            <div className="movie-description">
              <h3>Description</h3>
              <p>{movie?.description}</p>
            </div>

            <div className="movie-price-info">
              <h3>Price per Ticket</h3>
              <p className="price">₹{movie?.price.toFixed(2)}</p>
            </div>

            <div className="movie-timings">
              <h3>Select Show Time</h3>
              {movie?.showtimes && movie.showtimes.length > 0 ? (
                <div className="timing-buttons">
                  {movie.showtimes.map((showtime) => (
                    <button
                      key={showtime.showtime_id}
                      className={`timing-button ${selectedShowtime?.showtime_id === showtime.showtime_id ? "active" : ""}`}
                      onClick={() => handleShowtimeSelect(showtime)}
                    >
                      {formatShowtime(showtime.show_time)}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No showtimes available</p>
              )}
            </div>
          </div>
        </div>

        {selectedShowtime && (
          <div className="seat-booking-section">
            <h2>Select Your Seats</h2>

            {loading ? <div className="loading">Loading seats...</div> : renderSeats()}

            {selectedSeats.length > 0 && (
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Selected Seats:</span>
                    <span>{selectedSeats.map((seat) => seat.seat_number).join(", ")}</span>
                  </div>
                  <div className="summary-row">
                    <span>Price per Ticket:</span>
                    <span>₹{movie?.price.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button className="payment-button" onClick={handleAddToCart} disabled={processing}>
                  {processing ? "Processing..." : "Add to Cart"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetails

