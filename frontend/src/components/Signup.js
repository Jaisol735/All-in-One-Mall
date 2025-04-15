"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Signup.css"

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone_number: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Account created successfully! Please login.")
        navigate("/")
      } else {
        setError(data.message || "Signup failed. Please try again.")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred during signup. Please try again.")
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <form onSubmit={handleSubmit} className="signup-form">
          <h1>Sign Up</h1>
          {error && <div className="error-message">{error}</div>}

          <div className="input-box">
            <label htmlFor="name">Username</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your username"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number"
              type="tel"
              name="phone_number"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn">
            Sign Up
          </button>

          <div className="login-link">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup

