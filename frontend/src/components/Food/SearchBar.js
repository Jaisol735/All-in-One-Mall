"use client"

import { useState } from "react"
import "./Food.css"

function SearchBar({ onSearch }) {
  const [searchInput, setSearchInput] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchInput)
  }

  const handleChange = (e) => {
    setSearchInput(e.target.value)
  }

  return (
    <div className="food-search-container">
      <form onSubmit={handleSubmit} className="food-search-form">
        <input
          type="text"
          className="food-search-input"
          placeholder="Search for food..."
          value={searchInput}
          onChange={handleChange}
        />
        <button type="submit" className="food-search-button">
          Search
        </button>
      </form>
    </div>
  )
}

export default SearchBar

