"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Game/SquidGame/SuidGame.css"
import GameBoard from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Game/SquidGame/GameBoard.js"
import { generatePath, checkMove } from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Game/SquidGame/gameLogic.js";
import Navbar from "../../Navbar";

function SquidGame() {
  const [chances, setChances] = useState(5)
  const [currentPosition, setCurrentPosition] = useState(-1) // -1 means at start
  const [correctPath, setCorrectPath] = useState([])
  const [gameState, setGameState] = useState("playing") // playing, won, lost
  const navigate = useNavigate()

  // Initialize the game
  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    startNewGame()
  }, [navigate])

  const startNewGame = () => {
    setChances(5)
    setCurrentPosition(-1)
    setCorrectPath(generatePath())
    setGameState("playing")
  }

  const updateRewardPoints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user || !user.id) return

      const response = await fetch("http://localhost:3001/api/squid-game-win", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`You earned 5 reward points! Total reward points: ${data.rewardPoints}`)
      }
    } catch (error) {
      console.error("Error updating reward points:", error)
    }
  }

  const handleDivClick = (rowIndex, colIndex) => {
    // Only allow clicks if we're on the previous row or at start
    if (currentPosition !== rowIndex - 1) return

    const isCorrect = checkMove(rowIndex, colIndex, correctPath)

    if (isCorrect) {
      setCurrentPosition(rowIndex)

      // Check if player reached the end
      if (rowIndex === 9) {
        setGameState("won")
        updateRewardPoints()
      }
    } else {
      setCurrentPosition(-1) // Back to start
      setChances((prevChances) => prevChances - 1)

      // Check if player lost all chances
      if (chances <= 1) {
        setGameState("lost")
      }
    }
  }

  return (
    <div className="squid-game-container">
      <Navbar />

      <div className="game-content">
        <div className="game-header">
          <h1>Enchanted Forest Bridge</h1>
          <Link to="/game" className="back-button">
            Back to Games
          </Link>
        </div>

        <div className="game-stats">
          <div className="chances">Chances: {chances}</div>
        </div>

        {gameState === "playing" && (
          <GameBoard correctPath={correctPath} currentPosition={currentPosition} onDivClick={handleDivClick} />
        )}

        {gameState === "won" && (
          <div className="game-result">
            <h2>Congratulations!</h2>
            <p>You successfully crossed the enchanted bridge!</p>
            <button onClick={startNewGame}>Play Again</button>
          </div>
        )}

        {gameState === "lost" && (
          <div className="game-result">
            <h2>Game Over</h2>
            <p>The forest spirits have bested you this time.</p>
            <button onClick={startNewGame}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SquidGame

