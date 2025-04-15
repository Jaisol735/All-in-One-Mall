import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Home from "./components/Home"
import Account from "./components/Account"
import Game from "./components/Game"
import Shop from "./components/Shop"
import Cart from "./components/Cart"
import TransactionHistory from "./components/TransactionHistory"
import GameReward from "./components/GameReward"
import SnakeAndLadder from "./components/Game/SnakeAndLadder/SnakeAndLadder"
import Sudoku from "./components/Game/Sudoku/Sudoku"
import Wordguess from "./components/Game/Wordguess/WordGuessGame"
import Squidgame from "./components/Game/SquidGame/SquidGame"
import Movies from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Movie/Movies.js"
import MovieDetails from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Movie/MovieDetails.js"
import Food from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Food/Food.js"
import Admin from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Admin/Admin.js"
import Orders from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Orders.js"
import DataAnalysis from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/DataAnalysis.js"
import Feedback from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Feedback.js"
import AdminFeedback from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/AdminFeedback.js"
import WelcomeAnimation from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/WelcomeAnimation.js"
import Landing from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Landing/LandingPage.js"
import "./App.css"

function App() {
  return (
    <div className="App">
      <div className="background-gradient">
        <div className="yellow-triangle"></div>
        <div className="black-triangle"></div>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeAnimation />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/game" element={<Game />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/rewards" element={<GameReward />} />
          <Route path="/game/snake-and-ladder" element={<SnakeAndLadder />} />
          <Route path="/game/sudoku" element={<Sudoku />} />
          <Route path="/game/word-guess" element={<Wordguess />} />
          <Route path="/game/squid-game" element={<Squidgame />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:movieId" element={<MovieDetails />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/food" element={<Food />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin-feedback" element={<AdminFeedback />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App


          