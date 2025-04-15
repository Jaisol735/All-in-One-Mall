"use client"

import { useState } from "react"
import PlayerPiece from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Game/SquidGame/PlayerPiece.js"

function GameBoard({ correctPath, currentPosition, onDivClick }) {
  const [selectedDivs, setSelectedDivs] = useState({})

  const handleClick = (rowIndex, colIndex) => {
    const isCorrect = correctPath[rowIndex] === colIndex

    // Update selected divs to track which ones have been clicked
    setSelectedDivs((prev) => ({
      ...prev,
      [`${rowIndex}-${colIndex}`]: isCorrect ? "correct" : "wrong",
    }))

    onDivClick(rowIndex, colIndex)
  }

  const renderRow = (rowIndex) => {
    return (
      <div className="bridge-row" key={rowIndex}>
        {[0, 1, 2].map((colIndex) => {
          const divKey = `${rowIndex}-${colIndex}`
          const divStatus = selectedDivs[divKey]

          return (
            <div
              key={colIndex}
              className={`bridge-div ${divStatus || ""}`}
              onClick={() => (currentPosition === rowIndex - 1 ? handleClick(rowIndex, colIndex) : null)}
            >
              {currentPosition === rowIndex && correctPath[rowIndex] === colIndex && <PlayerPiece />}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="game-board" style={{marginLeft: "220px"}}>
      <div className="start-area">
        <div className="start-label">Start</div>
        {currentPosition === -1 && <PlayerPiece />}
      </div>

      <div className="bridge">{Array.from({ length: 10 }, (_, i) => renderRow(i))}</div>

      <div className="end-area">
        <div className="end-label">End</div>
        {currentPosition === 9 && <PlayerPiece />}
      </div>
    </div>
  )
}

export default GameBoard

