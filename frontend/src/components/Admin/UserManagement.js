"use client"

import { useState, useEffect } from "react"
import "./Admin.css"

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    balance: 1000,
    reward_points: 0,
  })
  const [deleteUserId, setDeleteUserId] = useState("")
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAddUser = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add user")
      }

      setSuccessMessage("User added successfully!")
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        address: "",
        balance: 1000,
        reward_points: 0,
      })
      setShowAddForm(false)
      fetchUsers()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding user:", err)
      setError("Error adding user. Please try again.")
    }
  }

  const handleDeleteUser = async (e) => {
    e.preventDefault()

    if (!deleteUserId) {
      setError("Please enter a user ID")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: deleteUserId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      setSuccessMessage("User deleted successfully!")
      setDeleteUserId("")
      setShowDeleteForm(false)
      fetchUsers()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("Error deleting user. Please try again.")
    }
  }

  return (
    <div className="admin-section">
      <h2>User Management</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-actions">
        <button
          className="action-button"
          onClick={() => {
            setShowAddForm(true)
            setShowDeleteForm(false)
          }}
        >
          Add User
        </button>
        <button
          className="action-button delete"
          onClick={() => {
            setShowDeleteForm(true)
            setShowAddForm(false)
          }}
        >
          Delete User
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form">
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="balance">Balance</label>
              <input
                type="number"
                id="balance"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reward_points">Reward Points</label>
              <input
                type="number"
                id="reward_points"
                name="reward_points"
                value={formData.reward_points}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Add User
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteForm && (
        <div className="admin-form">
          <h3>Delete User</h3>
          <form onSubmit={handleDeleteUser}>
            <div className="form-group">
              <label htmlFor="deleteUserId">User ID</label>
              <input
                type="text"
                id="deleteUserId"
                value={deleteUserId}
                onChange={(e) => setDeleteUserId(e.target.value)}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button delete">
                Delete User
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowDeleteForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading users...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Reward Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone_number}</td>
                <td>₹{Number.parseFloat(user.balance).toFixed(2)}</td>
                <td>{user.reward_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default UserManagement

