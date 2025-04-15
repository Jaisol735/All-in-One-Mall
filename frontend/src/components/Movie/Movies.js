"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import SearchBar from "./SearchBar"
import "./Movies.css"

function Movies() {
  const [movies, setMovies] = useState([])
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

    fetchMovies()
  }, [navigate])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/movies")
      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }
      const data = await response.json()

      // Ensure price is a number
      const formattedData = data.map((movie) => ({
        ...movie,
        price: Number.parseFloat(movie.price) || 0,
      }))

      setMovies(formattedData)
      setError(null)
    } catch (err) {
      setError("Error fetching movies. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/movies/search?term=${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error("Failed to search movies")
      }
      const data = await response.json()

      // Ensure price is a number
      const formattedData = data.map((movie) => ({
        ...movie,
        price: Number.parseFloat(movie.price) || 0,
      }))

      setMovies(formattedData)
      setError(null)
    } catch (err) {
      setError("Error searching movies. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Function to convert file path to usable URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x450?text=Movie+Poster"

    // Extract filename from path
    const parts = imagePath.split("/")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/movie/${filename}`
  }

  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`)
  }

  return (
    <div className="movies-page">
      <Navbar />

      <div className="movies-container">
        <h1>Book Movie Tickets</h1>

        <SearchBar onSearch={handleSearch} />

        {loading && <div className="loading">Loading movies...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && movies.length === 0 && <div className="no-results">No movies found</div>}

        {!loading && !error && movies.length > 0 && (
          <div className="movie-grid">
            {movies.map((movie) => (
              <div key={movie.movie_id} className="movie-card" onClick={() => handleMovieClick(movie.movie_id)}>
                <div className="movie-image">
                  <img
                    src={getImageUrl(movie.image_url) || "/placeholder.svg"}
                    alt={movie.name}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "https://via.placeholder.com/300x450?text=Movie+Poster"
                    }}
                  />
                </div>
                <div className="movie-info">
                  <h3 className="movie-name">{movie.name}</h3>
                  <p className="movie-price">₹{movie.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Movies

