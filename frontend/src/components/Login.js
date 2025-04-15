"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Login.css"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Check for admin login
    if (username === "Jainam Solanki" && password === "12345") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: username,
          id: 3,
          isAdmin: true,
        }),
      )
      return navigate("/home")
    }

    // For demo purposes, allow a hardcoded login
    if (username === "Jainam" && password === "Jaisol@735") {
      localStorage.setItem("user", JSON.stringify({ name: username, id: 1 }))
      return navigate("/home")
    }

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.userId,
            name: username,
            isAdmin: data.isAdmin || false,
          }),
        )
        navigate("/home")
      } else {
        setError(data.message || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    }
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form onSubmit={handleSubmit} className="login-form">
          <h1>Login</h1>
          {error && <div className="error-message">{error}</div>}

          <div className="input-box">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            Login
          </button>

          <div className="register-link">
            <p>
              Don't have an account? <Link to="/signup">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

