"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../../Navbar"
import "./SnakeAndLadder.css"

// Import the game board image
import gameBoardImage from "./game.png"

function SnakeAndLadder() {
  const [playerPosition, setPlayerPosition] = useState(0)
  const [computerPosition, setComputerPosition] = useState(0)
  const [currentTurn, setCurrentTurn] = useState("player")
  const [gameOver, setGameOver] = useState(false)
  const [playerName, setPlayerName] = useState("Player")
  const [diceValue, setDiceValue] = useState(null)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  // Define snakes and ladders
  const snakes = { 32: 10, 36: 6, 48: 26, 62: 18, 88: 24, 95: 56, 97: 78 }
  const ladders = { 1: 38, 4: 14, 8: 30, 21: 42, 28: 76, 50: 67, 71: 92, 80: 99 }

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    // Get player name from users table
    fetchPlayerName(JSON.parse(loggedInUser))
  }, [navigate])

  const fetchPlayerName = async (userData) => {
    try {
      if (userData && userData.id) {
        const response = await fetch(`http://localhost:3001/api/user-name?userId=${userData.id}`)
        if (response.ok) {
          const data = await response.json()
          setPlayerName(data.name)
        }
      } else if (userData && userData.name) {
        setPlayerName(userData.name)
      }
    } catch (error) {
      console.error("Error fetching player name:", error)
    }
  }

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1
  }

  const movePlayer = (position, diceRoll) => {
    let newPosition = position + diceRoll

    // If player exceeds 100, bounce back
    if (newPosition > 100) {
      newPosition = 100 - (newPosition - 100)
    }

    // Check if landed on a snake or ladder
    if (snakes[newPosition]) {
      setMessage(`Oops! You landed on a snake and slid down to ${snakes[newPosition]}`)
      return snakes[newPosition]
    } else if (ladders[newPosition]) {
      setMessage(`Yay! You landed on a ladder and climbed up to ${ladders[newPosition]}`)
      return ladders[newPosition]
    }

    setMessage(`Moved to position ${newPosition}`)
    return newPosition
  }

  const handleGameEnd = async (winner) => {
    setGameOver(true)

    if (winner === "player") {
      setMessage(`Congratulations! ${playerName} wins!`)

      // Update reward points
      try {
        const user = JSON.parse(localStorage.getItem("user"))
        if (user && user.id) {
          const response = await fetch("http://localhost:3001/api/snake-ladder-win", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          })

          if (response.ok) {
            const data = await response.json()
            alert(`You earned a reward point! Total reward points: ${data.rewardPoints}`)
          }
        }
      } catch (error) {
        console.error("Error updating reward points:", error)
      }
    } else {
      setMessage("Computer wins! Better luck next time.")
    }
  }

  const playerTurn = () => {
    if (gameOver) return

    const dice = rollDice()
    setDiceValue(dice)

    const newPosition = movePlayer(playerPosition, dice)
    setPlayerPosition(newPosition)

    if (newPosition === 100) {
      handleGameEnd("player")
    } else {
      setCurrentTurn("computer")
      // Computer's turn after a delay
      setTimeout(computerTurn, 1500)
    }
  }

  const computerTurn = () => {
    if (gameOver) return

    const dice = rollDice()
    setDiceValue(dice)

    const newPosition = movePlayer(computerPosition, dice)
    setComputerPosition(newPosition)

    if (newPosition === 100) {
      handleGameEnd("computer")
    } else {
      setCurrentTurn("player")
    }
  }

  const resetGame = () => {
    setPlayerPosition(0)
    setComputerPosition(0)
    setCurrentTurn("player")
    setGameOver(false)
    setDiceValue(null)
    setMessage("")
  }

  // Generate the game board with positions
  const renderBoard = () => {
    const cells = []

    // Create a 10x10 grid
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        // Calculate the cell number (1-100)
        // In snake and ladder, we start from bottom left (1) and go up to top left (100)
        // For even rows (0, 2, 4, 6, 8), numbers increase from left to right
        // For odd rows (1, 3, 5, 7, 9), numbers increase from right to left
        let cellNumber
        if (row % 2 === 0) {
          // Even row (0, 2, 4, 6, 8) - numbers increase left to right
          cellNumber = 10 * (9 - row) + col + 1
        } else {
          // Odd row (1, 3, 5, 7, 9) - numbers increase right to left
          cellNumber = 10 * (9 - row) + (10 - col)
        }

        // Check if player or computer is on this cell
        const hasPlayer = playerPosition === cellNumber
        const hasComputer = computerPosition === cellNumber

        cells.push(
          <div key={cellNumber} className="board-cell" data-number={cellNumber}>
            {hasPlayer && <div className="player-token">🔴</div>}
            {hasComputer && <div className="computer-token">🔵</div>}
          </div>,
        )
      }
    }
    return cells
  }

  return (
    <div className="snake-ladder-container">
      <Navbar />

      <div className="game-content">
        <div className="game-header">
          <h1>Snake and Ladder</h1>
          <Link to="/game" className="back-button">
            Back to Games
          </Link>
        </div>

        <div className="game-layout">
          <div className="game-board-container">
            <div
              className="game-board"
              style={{
                backgroundImage: `url(${gameBoardImage})`,
                backgroundSize: "100% 100%",
              }}
            >
              {renderBoard()}
            </div>
          </div>

          <div className="game-controls">
            <div className="player-info">
              <div className="player-status">
                <h3>{playerName}</h3>
                <p>Position: {playerPosition}</p>
              </div>

              <div className="player-status">
                <h3>Computer</h3>
                <p>Position: {computerPosition}</p>
              </div>
            </div>

            <button className="roll-button" onClick={playerTurn} disabled={currentTurn !== "player" || gameOver}>
              Roll Dice
            </button>

            <div className="message-box">
              {message && <p>{message}</p>}
              {currentTurn === "computer" && !gameOver && <p>Computer is thinking...</p>}
              {diceValue && <p>You rolled: {diceValue}</p>}
            </div>

            {gameOver && (
              <button className="reset-button" onClick={resetGame}>
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SnakeAndLadder

