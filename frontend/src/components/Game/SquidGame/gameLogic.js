// Generate a random path (one correct div per row)
export const generatePath = () => {
  const path = []
  for (let i = 0; i < 10; i++) {
    path.push(Math.floor(Math.random() * 3)) // Random number 0, 1, or 2
  }
  return path
}

// Check if the move is correct
export const checkMove = (rowIndex, colIndex, correctPath) => {
  return correctPath[rowIndex] === colIndex
}

  