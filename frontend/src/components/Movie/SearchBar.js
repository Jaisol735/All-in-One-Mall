"use client"

import { useState } from "react"
import "./SearchBar.css"

function SearchBar({ onSearch }) {
  const [searchInput, setSearchInput] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchInput)
  }

  return (
    <div className="movie-search-container">
      <form onSubmit={handleSubmit} className="movie-search-form">
        <input
          type="text"
          className="movie-search-input"
          placeholder="Search movies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="movie-search-button">
          Search
        </button>
      </form>
    </div>
  )
}

export default SearchBar