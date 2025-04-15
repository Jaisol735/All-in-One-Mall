"use client"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../Navbar";
import "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Game/Wordguess/WordGuessGame.css";
const words = [
    "Amazon", "Archive", "Alaska", "Alchemy", "Almonds", "Anagram", "Android", "Antique", "Average", "Avenues",
    "Banquet", "Bargain", "Battery", "Boulder", "Buffalo", "Bridges", "Bandage", "Balance", "Billard", "Bonfire",
    "Capture", "Canvas", "Cabbage", "Cactus", "Caliber", "Candies", "Capital", "Caramel", "Caution", "Chamber",
    "Dancing", "Dangers", "Dazzled", "Daytime", "Decades", "Defense", "Delight", "Dolphin", "Dynamic", "Diamond",
    "Eclipse", "Elastic", "Emerald", "Erosion", "Example", "Excited", "Explore", "Express", "Element", "Endless",
    "Factory", "Fashion", "Festival", "Fighter", "Fortune", "Furnace", "Flavour", "Failure", "Feature", "Fiction",
    "Gateway", "Garment", "Genesis", "General", "Giraffe", "Glacier", "Gravity", "Grocery", "Garnish", "Grammar",
    "Harvest", "Harmony", "Heading", "Horizon", "Hostage", "Hustler", "Holiday", "Hollow", "Hunters", "Hurdles",
    "Illness", "Imagine", "Initial", "Iceberg", "Indulge", "Impacts", "Insight", "Involve", "Infused", "Install",
    "Jackpot", "January", "Jasmine", "Jealous", "Journey", "Juggler", "Justice", "Junction", "Javelin", "Jumping",
    "Kangaro", "Keeping", "Kindred", "Kingdom", "Kitchen", "Knights", "Knowing", "Keyhole", "Kernels", "Krypton",
    "Ladders", "Lantern", "Landing", "Lawyers", "Library", "Lighter", "Lizards", "Loyalty", "Luggage", "Lullaby",
    "Magical", "Masters", "Maximum", "Melting", "Message", "Migrant", "Minimal", "Mission", "Mobiles", "Mystery",
    "Natural", "Navigate", "Network", "Neutron", "Nostalg", "Nucleus", "Nomadic", "Nurture", "Numbers", "Novices",
    "Oatmeal", "Obscure", "Observe", "Octagon", "Offline", "Operate", "Opinion", "Organic", "Ostrich", "Outlook",
    "Package", "Paladin", "Panther", "Paradox", "Parking", "Passage", "Peacock", "Pioneer", "Plastic", "Popular",
    "Quartz", "Quality", "Quarter", "Quicker", "Quoting", "Quirky", "Quietly", "Quester", "Quested", "Quilted",
    "Rainbow", "Rangers", "Reality", "Recharge", "Reflect", "Regular", "Remove", "Reshape", "Respect", "Rushing",
    "Sailors", "Salvage", "Sandbox", "Scanner", "Scenery", "Scepter", "Seagull", "Serpent", "Shelter", "Shuffle",
    "Tandems", "Tension", "Texture", "Theater", "Thunder", "Tigers", "Tourism", "Trading", "Treason", "Tropics",
    "Umbrella", "Uncover", "Uniform", "Ultimate", "Undying", "Unicorn", "Upwards", "Useful", "Urgency", "Utility",
    "Vacation", "Vagrant", "Venture", "Verdant", "Version", "Vibrant", "Victory", "Village", "Vintage", "Volcano",
    "Waffles", "Wander", "Warrior", "Weather", "Welcome", "Western", "Whisper", "Wishing", "Wonder", "Workout",
    "Xanthan", "Xenogen", "Xenopus", "Xeroxed", "Xenakis", "Xylitol", "Xenopus", "Xylogen", "Xenonym", "Xylonic",
    "Yachts", "Yanking", "Yelling", "Yellow", "Yogurts", "Younger", "Younker", "Yuppies", "Yanking", "Yearned",
    "Zapping", "Zealots", "Zephyrs", "Ziggzag", "Zippers", "Zombies", "Zonally", "Zymotic", "Zestful", "Zillion"
  ];


const WordGuessGame = () => {
  const [word, setWord] = useState("")
  const [guesses, setGuesses] = useState(Array(6).fill(""))
  const [currentRow, setCurrentRow] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState("")
  const [letterStates, setLetterStates] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    generateNewWord()
  }, [navigate])

  const generateNewWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)]
    setWord(randomWord.toUpperCase())
    setGuesses(Array(6).fill(""))
    setCurrentRow(0)
    setGameOver(false)
    setMessage("")
    setLetterStates({})
  }

  const handleKeyDown = (rowIndex, colIndex, event) => {
    if (rowIndex !== currentRow || gameOver) return

    if (event.key === "Backspace" && colIndex > 0) {
      // Move to previous input on backspace
      event.target.previousElementSibling?.focus()
    } else if (event.key === "Enter") {
      submitGuess()
    } else if (event.key === "ArrowLeft" && colIndex > 0) {
      // Move left
      event.target.previousElementSibling?.focus()
    } else if (event.key === "ArrowRight" && colIndex < word.length - 1) {
      // Move right
      event.target.nextElementSibling?.focus()
    }
  }

  const handleInput = (rowIndex, colIndex, event) => {
    if (rowIndex !== currentRow || gameOver) return

    const value = event.target.value.toUpperCase()
    if (!/^[A-Z]$/.test(value) && value !== "") return

    const newGuesses = [...guesses]
    const newGuess = newGuesses[rowIndex].padEnd(word.length, " ").split("")
    newGuess[colIndex] = value
    newGuesses[rowIndex] = newGuess.join("").trim()
    setGuesses(newGuesses)

    // Move to next input if a letter was entered
    if (value && colIndex < word.length - 1) {
      event.target.nextElementSibling?.focus()
    }
  }

  const submitGuess = () => {
    const currentGuess = guesses[currentRow]

    // Check if the guess is complete
    if (currentGuess.length !== word.length) {
      setMessage("Please enter a complete word")
      return
    }

    // Update letter states for coloring
    const newLetterStates = { ...letterStates }

    // First mark all correct positions
    for (let i = 0; i < word.length; i++) {
      if (currentGuess[i] === word[i]) {
        newLetterStates[currentGuess[i]] = "correct"
      }
    }

    // Then mark wrong positions (only if not already marked as correct)
    for (let i = 0; i < word.length; i++) {
      if (currentGuess[i] !== word[i] && word.includes(currentGuess[i])) {
        if (newLetterStates[currentGuess[i]] !== "correct") {
          newLetterStates[currentGuess[i]] = "wrong-position"
        }
      } else if (!newLetterStates[currentGuess[i]]) {
        newLetterStates[currentGuess[i]] = "incorrect"
      }
    }

    setLetterStates(newLetterStates)

    // Check if the guess is correct
    if (currentGuess === word) {
      setGameOver(true)
      setMessage("Congratulations! You guessed the word!")
      increaseRewardPoints()
    } else if (currentRow === 5) {
      setGameOver(true)
      setMessage(`Game over! The word was ${word}`)
    } else {
      setCurrentRow(currentRow + 1)
    }
  }

  const increaseRewardPoints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user || !user.id) return

      const response = await fetch("http://localhost:3001/api/word-guess-win", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Reward points increased:", data.rewardPoints)
        alert(`You earned a reward point! Total reward points: ${data.rewardPoints}`)
      }
    } catch (error) {
      console.error("Error increasing reward points:", error)
    }
  }

  const getLetterClass = (rowIndex, colIndex) => {
    if (rowIndex > currentRow || guesses[rowIndex].length <= colIndex) return ""

    const letter = guesses[rowIndex][colIndex]
    if (!letter) return ""

    if (rowIndex < currentRow || gameOver) {
      if (letter === word[colIndex]) return "correct"
      if (word.includes(letter)) return "wrong-position"
      return "incorrect"
    }

    return ""
  }

  return (
    <div className="word-guess-container">
      <Navbar />

      <div className="word-guess-game">
        <div className="game-header">
          <h1>Word Guess Game</h1>
          <button className="back-button" onClick={() => navigate("/game")}>
            Back to Games
          </button>
        </div>

        <div className="game-board" style={{marginLeft: "150px"}}>
          {Array(6)
            .fill()
            .map((_, rowIndex) => (
              <div key={rowIndex} className="guess-row">
                {Array(word.length)
                  .fill()
                  .map((_, colIndex) => (
                    <input
                      key={colIndex}
                      type="text"
                      maxLength="1"
                      value={guesses[rowIndex][colIndex] || ""}
                      onChange={(e) => handleInput(rowIndex, colIndex, e)}
                      onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                      className={`letter-box ${getLetterClass(rowIndex, colIndex)}`}
                      disabled={rowIndex !== currentRow || gameOver}
                      autoFocus={rowIndex === currentRow && colIndex === 0}
                    />
                  ))}
              </div>
            ))}
        </div>

        {message && <p className="message">{message}</p>}

        <div className="game-controls">
          <button className="new-game-button" onClick={generateNewWord}>
            New Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default WordGuessGame

