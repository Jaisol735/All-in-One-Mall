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
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  )
}

export default SearchBar

