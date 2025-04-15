"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "./Navbar"
import "./Game.css"

// Import game images with relative paths
import SLImage from "./Game/SL.png"
import SUImage from "./Game/SU.png"
import WUImage from "./Game/WU.png"
import SQImage from "./Game/SQ.png"

function Game() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }
  }, [navigate])

  // Hide menu if a game is selected
  const isGameSelected = ["/game/snake-and-ladder", "/game/sudoku", "/game/word-guess", "/game/squid-game"].includes(
    location.pathname,
  )

  if (isGameSelected) return null // Do not render the game menu

  return (
    <div className="game-page">
      <Navbar />

      <div className="app-container">
        <div className="content-wrapper">
          <header className="header animate-in">
            <h1>Game Center</h1>
          </header>

          <nav className="main-content">
            <Link to="/game/snake-and-ladder" className="card animate-in">
              <div className="game-card">
                <img
                  src={SLImage || "/placeholder.svg"}
                  alt="Snake and Ladder"
                  className="game-image"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://via.placeholder.com/150?text=Snake+and+Ladder"
                  }}
                />
                <h2>Snake and Ladder</h2>
              </div>
            </Link>

            <Link to="/game/sudoku" className="card animate-in">
              <div className="game-card">
                <img
                  src={SUImage || "/placeholder.svg"}
                  alt="Sudoku"
                  className="game-image"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://via.placeholder.com/150?text=Sudoku"
                  }}
                />
                <h2>Sudoku</h2>
              </div>
            </Link>

            <Link to="/game/word-guess" className="card animate-in">
              <div className="game-card">
                <img
                  src={WUImage || "/placeholder.svg"}
                  alt="Wordguess"
                  className="game-image"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://via.placeholder.com/150?text=Word+Guess"
                  }}
                />
                <h2>Word Guess</h2>
              </div>
            </Link>

            <Link to="/game/squid-game" className="card animate-in">
              <div className="game-card">
                <img
                  src={SQImage || "/placeholder.svg"}
                  alt="SquidGame"
                  className="game-image"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://via.placeholder.com/150?text=Squid+Game"
                  }}
                />
                <h2>Squid Game</h2>
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Game

