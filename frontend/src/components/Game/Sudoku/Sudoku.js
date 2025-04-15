"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../../Navbar"
import "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Game/Sudoku/game.css"

// Function to generate a Sudoku board
function generateSudoku(difficulty) {
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num) return false
    }

    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false
      }
    }
    return true
  }

  function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (const num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num
              if (solveSudoku(board)) return true
              board[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  solveSudoku(board)

  let cellsToRemove
  switch (difficulty) {
    case "easy":
      cellsToRemove = 30
      break
    case "medium":
      cellsToRemove = 40
      break
    case "hard":
      cellsToRemove = 50
      break
    default:
      cellsToRemove = 30
  }

  // Create a deep copy of the solved board
  const solvedBoard = board.map((row) => [...row])

  // Remove cells based on difficulty
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (board[row][col] !== 0) {
      board[row][col] = 0
      cellsToRemove--
    }
  }

  return { board, solvedBoard }
}

function Sudoku() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState("easy")
  const [board, setBoard] = useState([])
  const [initialBoard, setInitialBoard] = useState([])
  const [solvedBoard, setSolvedBoard] = useState([])
  const [gameWon, setGameWon] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rewardGiven, setRewardGiven] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    generateNewGame()
  }, [navigate])

  const generateNewGame = () => {
    setLoading(true)
    try {
      const { board, solvedBoard } = generateSudoku(difficulty)
      setBoard(board.map((row) => [...row]))
      setInitialBoard(board.map((row) => [...row]))
      setSolvedBoard(solvedBoard)
      setGameWon(false)
      setRewardGiven(false)
    } catch (error) {
      console.error("Error generating Sudoku:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty)
    setTimeout(() => {
      generateNewGame()
    }, 100)
  }

  const handleCellChange = (row, col, value) => {
    // Only allow changes to cells that were empty in the initial board
    if (initialBoard[row][col] === 0) {
      const newBoard = board.map((r) => [...r])

      // Handle empty input or non-numeric input
      if (value === "" || isNaN(value)) {
        newBoard[row][col] = 0
      } else {
        // Ensure value is between 1-9
        const numValue = Number.parseInt(value, 10)
        if (numValue >= 1 && numValue <= 9) {
          newBoard[row][col] = numValue
        }
      }

      setBoard(newBoard)
    }
  }

  const isBoardComplete = (board) => {
    return board.every((row) => row.every((cell) => cell !== 0))
  }

  const isBoardCorrect = (board) => {
    // Compare with the solved board
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== solvedBoard[i][j]) {
          return false
        }
      }
    }
    return true
  }

  // Function to update reward points
  const updateRewardPoints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user || !user.id) return

      const response = await fetch("http://localhost:3001/api/update-reward-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`You earned a reward point! Total reward points: ${data.rewardPoints}`)
        setRewardGiven(true)
      }
    } catch (error) {
      console.error("Error updating reward points:", error)
    }
  }

  const checkSolution = async () => {
    if (!isBoardComplete(board)) {
      alert("Please fill in all cells before checking!")
      return
    }

    if (isBoardCorrect(board)) {
      setGameWon(true)
      alert("Congratulations! You solved the Sudoku puzzle!")

      // Update reward points if not already given
      if (!rewardGiven) {
        await updateRewardPoints()
      }
    } else {
      alert("Sorry, your solution is incorrect. Please try again!")
    }
  }

  return (
    <div className="game-page">
      <Navbar />

      <div className="game-container">
        <div className="content-wrapper">
          <header className="header animate-in">
            <h1>Sudoku</h1>
            <Link to="/game" className="home-link">
              Back to Games
            </Link>
          </header>

          <div className="sudoku-game-content">
            <div className="difficulty-buttons">
              <button className={difficulty === "easy" ? "active" : ""} onClick={() => handleDifficultyChange("easy")}>
                Easy
              </button>
              <button
                className={difficulty === "medium" ? "active" : ""}
                onClick={() => handleDifficultyChange("medium")}
              >
                Medium
              </button>
              <button className={difficulty === "hard" ? "active" : ""} onClick={() => handleDifficultyChange("hard")}>
                Hard
              </button>
              <button onClick={generateNewGame}>New Game</button>
            </div>

            {loading ? (
              <div className="loading-message">Generating Sudoku puzzle...</div>
            ) : (
              <>
                <div className="sudoku-board">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`sudoku-cell ${initialBoard[rowIndex][colIndex] !== 0 ? "initial" : ""}`}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[1-9]*"
                          maxLength="1"
                          value={cell === 0 ? "" : cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          readOnly={initialBoard[rowIndex][colIndex] !== 0}
                        />
                      </div>
                    )),
                  )}
                </div>

                <div className="game-controls">
                  <button className="check-button" onClick={checkSolution} disabled={gameWon}>
                    {gameWon ? "Solved!" : "Check Solution"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sudoku

