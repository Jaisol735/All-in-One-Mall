"use client"

import { useState, useEffect } from "react"
import "./Admin.css"

function MovieManagement() {
  const [movies, setMovies] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeAction, setActiveAction] = useState(null)
  const [actionType, setActionType] = useState(null) // "movie" or "showtime"
  const [successMessage, setSuccessMessage] = useState("")

  // Movie form data
  const [movieFormData, setMovieFormData] = useState({
    name: "",
    description: "",
    available_tickets: "50",
    booked_tickets: "0",
    price: "",
    image_url: "",
  })

  // Showtime form data
  const [showtimeFormData, setShowtimeFormData] = useState({
    movie_id: "",
    show_time: "",
  })

  const [movieId, setMovieId] = useState("")
  const [showtimeId, setShowtimeId] = useState("")
  const [movieToUpdate, setMovieToUpdate] = useState(null)
  const [showtimeToUpdate, setShowtimeToUpdate] = useState(null)

  useEffect(() => {
    fetchMovies()
    fetchShowtimes()
  }, [])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/movies")

      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }

      const data = await response.json()
      setMovies(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching movies:", err)
      setError("Error loading movies. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchShowtimes = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/showtimes")

      if (!response.ok) {
        throw new Error("Failed to fetch showtimes")
      }

      const data = await response.json()
      setShowtimes(data)
    } catch (err) {
      console.error("Error fetching showtimes:", err)
    }
  }

  const handleMovieInputChange = (e) => {
    const { name, value } = e.target
    setMovieFormData({
      ...movieFormData,
      [name]: value,
    })
  }

  const handleShowtimeInputChange = (e) => {
    const { name, value } = e.target
    setShowtimeFormData({
      ...showtimeFormData,
      [name]: value,
    })
  }

  const handleAddMovie = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/movies/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to add movie")
      }

      setSuccessMessage("Movie added successfully!")
      setMovieFormData({
        name: "",
        description: "",
        available_tickets: "50",
        booked_tickets: "0",
        price: "",
        image_url: "",
      })
      setActiveAction(null)
      setActionType(null)
      fetchMovies()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding movie:", err)
      setError("Error adding movie. Please try again.")
    }
  }

  const handleAddShowtime = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/showtimes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(showtimeFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to add showtime")
      }

      setSuccessMessage("Showtime added successfully!")
      setShowtimeFormData({
        movie_id: "",
        show_time: "",
      })
      setActiveAction(null)
      setActionType(null)
      fetchShowtimes()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding showtime:", err)
      setError("Error adding showtime. Please try again.")
    }
  }

  const handleDeleteMovie = async (e) => {
    e.preventDefault()

    if (!movieId) {
      setError("Please enter a movie ID")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/movies/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete movie")
      }

      setSuccessMessage("Movie deleted successfully!")
      setMovieId("")
      setActiveAction(null)
      setActionType(null)
      fetchMovies()
      fetchShowtimes()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error deleting movie:", err)
      setError("Error deleting movie. Please try again.")
    }
  }

  const handleDeleteShowtime = async (e) => {
    e.preventDefault()

    if (!showtimeId) {
      setError("Please enter a showtime ID")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/showtimes/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ showtimeId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete showtime")
      }

      setSuccessMessage("Showtime deleted successfully!")
      setShowtimeId("")
      setActiveAction(null)
      setActionType(null)
      fetchShowtimes()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error deleting showtime:", err)
      setError("Error deleting showtime. Please try again.")
    }
  }

  const handleFindMovie = async (e) => {
    e.preventDefault()

    if (!movieId) {
      setError("Please enter a movie ID")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/movies/${movieId}`)

      if (!response.ok) {
        throw new Error("Failed to find movie")
      }

      const movie = await response.json()
      setMovieToUpdate(movie)
      setMovieFormData({
        name: movie.name,
        description: movie.description,
        available_tickets: movie.available_tickets,
        booked_tickets: movie.booked_tickets,
        price: movie.price,
        image_url: movie.image_url,
      })
    } catch (err) {
      console.error("Error finding movie:", err)
      setError("Error finding movie. Please try again.")
    }
  }

  const handleFindShowtime = async (e) => {
    e.preventDefault()

    if (!showtimeId) {
      setError("Please enter a showtime ID")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/showtimes/${showtimeId}`)

      if (!response.ok) {
        throw new Error("Failed to find showtime")
      }

      const showtime = await response.json()
      setShowtimeToUpdate(showtime)
      setShowtimeFormData({
        movie_id: showtime.movie_id,
        show_time: new Date(showtime.show_time).toISOString().slice(0, 16),
      })
    } catch (err) {
      console.error("Error finding showtime:", err)
      setError("Error finding showtime. Please try again.")
    }
  }

  const handleUpdateMovie = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/movies/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: movieToUpdate.movie_id,
          ...movieFormData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update movie")
      }

      setSuccessMessage("Movie updated successfully!")
      setMovieToUpdate(null)
      setMovieId("")
      setMovieFormData({
        name: "",
        description: "",
        available_tickets: "50",
        booked_tickets: "0",
        price: "",
        image_url: "",
      })
      setActiveAction(null)
      setActionType(null)
      fetchMovies()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating movie:", err)
      setError("Error updating movie. Please try again.")
    }
  }

  const handleUpdateShowtime = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/showtimes/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          showtimeId: showtimeToUpdate.showtime_id,
          ...showtimeFormData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update showtime")
      }

      setSuccessMessage("Showtime updated successfully!")
      setShowtimeToUpdate(null)
      setShowtimeId("")
      setShowtimeFormData({
        movie_id: "",
        show_time: "",
      })
      setActiveAction(null)
      setActionType(null)
      fetchShowtimes()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating showtime:", err)
      setError("Error updating showtime. Please try again.")
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="admin-section">
      <h2>Movie Management</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-actions">
        <button
          className="action-button"
          onClick={() => {
            setActiveAction("add")
            setActionType(null)
          }}
        >
          Add
        </button>
        <button
          className="action-button delete"
          onClick={() => {
            setActiveAction("delete")
            setActionType(null)
          }}
        >
          Delete
        </button>
        <button
          className="action-button update"
          onClick={() => {
            setActiveAction("update")
            setActionType(null)
          }}
        >
          Update
        </button>
      </div>

      {/* Secondary action buttons */}
      {activeAction && !actionType && (
        <div className="admin-actions" style={{ marginTop: "10px" }}>
          <button className="action-button" onClick={() => setActionType("movie")}>
            Movie
          </button>
          <button className="action-button" onClick={() => setActionType("showtime")}>
            Showtime
          </button>
        </div>
      )}

      {/* Add Movie Form */}
      {activeAction === "add" && actionType === "movie" && (
        <div className="admin-form">
          <h3>Add New Movie</h3>
          <form onSubmit={handleAddMovie}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={movieFormData.name}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={movieFormData.description}
                onChange={handleMovieInputChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="available_tickets">Available Tickets</label>
              <input
                type="number"
                id="available_tickets"
                name="available_tickets"
                value={movieFormData.available_tickets}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="booked_tickets">Booked Tickets</label>
              <input
                type="number"
                id="booked_tickets"
                name="booked_tickets"
                value={movieFormData.booked_tickets}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={movieFormData.price}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={movieFormData.image_url}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Add Movie
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setActionType(null)
                  setActiveAction(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Showtime Form */}
      {activeAction === "add" && actionType === "showtime" && (
        <div className="admin-form">
          <h3>Add New Showtime</h3>
          <form onSubmit={handleAddShowtime}>
            <div className="form-group">
              <label htmlFor="movie_id">Movie</label>
              <select
                id="movie_id"
                name="movie_id"
                value={showtimeFormData.movie_id}
                onChange={handleShowtimeInputChange}
                required
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie.movie_id} value={movie.movie_id}>
                    {movie.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="show_time">Show Time</label>
              <input
                type="datetime-local"
                id="show_time"
                name="show_time"
                value={showtimeFormData.show_time}
                onChange={handleShowtimeInputChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Add Showtime
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setActionType(null)
                  setActiveAction(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Movie Form */}
      {activeAction === "delete" && actionType === "movie" && (
        <div className="admin-form">
          <h3>Delete Movie</h3>
          <form onSubmit={handleDeleteMovie}>
            <div className="form-group">
              <label htmlFor="movieId">Movie ID</label>
              <input type="text" id="movieId" value={movieId} onChange={(e) => setMovieId(e.target.value)} required />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button delete">
                Delete Movie
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setActionType(null)
                  setActiveAction(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Showtime Form */}
      {activeAction === "delete" && actionType === "showtime" && (
        <div className="admin-form">
          <h3>Delete Showtime</h3>
          <form onSubmit={handleDeleteShowtime}>
            <div className="form-group">
              <label htmlFor="showtimeId">Showtime ID</label>
              <input
                type="text"
                id="showtimeId"
                value={showtimeId}
                onChange={(e) => setShowtimeId(e.target.value)}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button delete">
                Delete Showtime
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setActionType(null)
                  setActiveAction(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Find Movie to Update Form */}
      {activeAction === "update" && actionType === "movie" && !movieToUpdate && (
        <div className="admin-form">
          <h3>Find Movie to Update</h3>
          <form onSubmit={handleFindMovie}>
            <div className="form-group">
              <label htmlFor="movieId">Movie ID</label>
              <input type="text" id="movieId" value={movieId} onChange={(e) => setMovieId(e.target.value)} required />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Find Movie
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setActionType(null)
                  setActiveAction(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update Movie Form */}
      {activeAction === "update" && actionType === "movie" && movieToUpdate && (
        <div className="admin-form">
          <h3>Update Movie</h3>
          <form onSubmit={handleUpdateMovie}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={movieFormData.name}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={movieFormData.description}
                onChange={handleMovieInputChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="available_tickets">Available Tickets</label>
              <input
                type="number"
                id="available_tickets"
                name="available_tickets"
                value={movieFormData.available_tickets}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="booked_tickets">Booked Tickets</label>
              <input
                type="number"
                id="booked_tickets"
                name="booked_tickets"
                value={movieFormData.booked_tickets}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={movieFormData.price}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={movieFormData.image_url}
                onChange={handleMovieInputChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button update">
                Update Movie
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setMovieToUpdate(null)
                  setActionType("movie")
                }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Find Showtime to Update Form */}
      {activeAction === "update" && actionType === "showtime" && !showtimeToUpdate && (
        <div className="admin-form">
          <h3>Find Showtime to Update</h3>
          <form onSubmit={handleFindShowtime}>
            <div className="form-group">
              <label htmlFor="showtimeId">Showtime ID</label>
              <input
                type="text"
                id="showtimeId"
                value={showtimeId}
                onChange={(e) => setShowtimeId(e.target.value)}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Find Showtime
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setActionType(null)
                  setActiveAction(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update Showtime Form */}
      {activeAction === "update" && actionType === "showtime" && showtimeToUpdate && (
        <div className="admin-form">
          <h3>Update Showtime</h3>
          <form onSubmit={handleUpdateShowtime}>
            <div className="form-group">
              <label htmlFor="movie_id">Movie</label>
              <select
                id="movie_id"
                name="movie_id"
                value={showtimeFormData.movie_id}
                onChange={handleShowtimeInputChange}
                required
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie.movie_id} value={movie.movie_id}>
                    {movie.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="show_time">Show Time</label>
              <input
                type="datetime-local"
                id="show_time"
                name="show_time"
                value={showtimeFormData.show_time}
                onChange={handleShowtimeInputChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button update">
                Update Showtime
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowtimeToUpdate(null)
                  setActionType("showtime")
                }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Movies Table */}
      <h3 style={{ marginTop: "30px" }}>Movies</h3>
      {loading ? (
        <div className="loading-spinner">Loading movies...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Available Tickets</th>
              <th>Booked Tickets</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.movie_id}>
                <td>{movie.movie_id}</td>
                <td>{movie.name}</td>
                <td>{movie.available_tickets}</td>
                <td>{movie.booked_tickets}</td>
                <td>₹{Number.parseFloat(movie.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Showtimes Table */}
      <h3 style={{ marginTop: "30px" }}>Showtimes</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Movie ID</th>
            <th>Movie Name</th>
            <th>Show Time</th>
          </tr>
        </thead>
        <tbody>
          {showtimes.map((showtime) => (
            <tr key={showtime.showtime_id}>
              <td>{showtime.showtime_id}</td>
              <td>{showtime.movie_id}</td>
              <td>{showtime.movie_name || "N/A"}</td>
              <td>{formatDate(showtime.show_time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MovieManagement

