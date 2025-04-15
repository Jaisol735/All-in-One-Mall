"use client"

import { useState, useEffect } from "react"
import "./Admin.css"

function RewardManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState("")
  const [rewardPoints, setRewardPoints] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/admin/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Error loading users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRewardPoints = async (e) => {
    e.preventDefault()

    if (!userId || !rewardPoints) {
      setError("Please enter both user ID and reward points")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/users/update-rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          rewardPoints: Number.parseInt(rewardPoints),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update reward points")
      }

      setSuccessMessage("Reward points updated successfully!")
      setUserId("")
      setRewardPoints("")
      fetchUsers()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating reward points:", err)
      setError("Error updating reward points. Please try again.")
    }
  }

  return (
    <div className="admin-section">
      <h2>Reward Points Management</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-form">
        <h3>Update Reward Points</h3>
        <form onSubmit={handleUpdateRewardPoints}>
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input type="text" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="rewardPoints">Reward Points</label>
            <input
              type="number"
              id="rewardPoints"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(e.target.value)}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              Update Points
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading users...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Reward Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.reward_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default RewardManagement

