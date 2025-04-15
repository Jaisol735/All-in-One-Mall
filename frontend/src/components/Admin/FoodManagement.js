"use client"

import { useState, useEffect } from "react"
import "./Admin.css"

function FoodManagement() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeAction, setActiveAction] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    category: "Fast Food",
    price: "",
    stock: "50",
    image_url: "",
    description: "",
  })
  const [foodId, setFoodId] = useState("")
  const [foodToUpdate, setFoodToUpdate] = useState(null)

  useEffect(() => {
    fetchFoods()
  }, [])

  const fetchFoods = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/foods")

      if (!response.ok) {
        throw new Error("Failed to fetch foods")
      }

      const data = await response.json()
      setFoods(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching foods:", err)
      setError("Error loading foods. Please try again.")
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

  const handleAddFood = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/food/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add food")
      }

      setSuccessMessage("Food item added successfully!")
      setFormData({
        name: "",
        category: "Fast Food",
        price: "",
        stock: "50",
        image_url: "",
        description: "",
      })
      setActiveAction(null)
      fetchFoods()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding food:", err)
      setError("Error adding food. Please try again.")
    }
  }

  const handleDeleteFood = async (e) => {
    e.preventDefault()

    if (!foodId) {
      setError("Please enter a food ID")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/food/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ foodId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete food")
      }

      setSuccessMessage("Food item deleted successfully!")
      setFoodId("")
      setActiveAction(null)
      fetchFoods()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error deleting food:", err)
      setError("Error deleting food. Please try again.")
    }
  }

  const handleFindFood = async (e) => {
    e.preventDefault()

    if (!foodId) {
      setError("Please enter a food ID")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/foods/${foodId}`)

      if (!response.ok) {
        throw new Error("Failed to find food")
      }

      const food = await response.json()
      setFoodToUpdate(food)
      setFormData({
        name: food.name,
        category: food.category,
        price: food.price,
        stock: food.stock,
        image_url: food.image_url,
        description: food.description,
      })
    } catch (err) {
      console.error("Error finding food:", err)
      setError("Error finding food. Please try again.")
    }
  }

  const handleUpdateFood = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/food/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodId: foodToUpdate.food_id,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update food")
      }

      setSuccessMessage("Food item updated successfully!")
      setFoodToUpdate(null)
      setFoodId("")
      setFormData({
        name: "",
        category: "Fast Food",
        price: "",
        stock: "50",
        image_url: "",
        description: "",
      })
      setActiveAction(null)
      fetchFoods()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating food:", err)
      setError("Error updating food. Please try again.")
    }
  }

  return (
    <div className="admin-section">
      <h2>Food Management</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-actions">
        <button
          className="action-button"
          onClick={() => {
            setActiveAction("add")
            setFoodToUpdate(null)
            setFormData({
              name: "",
              category: "Fast Food",
              price: "",
              stock: "50",
              image_url: "",
              description: "",
            })
          }}
        >
          Add Food
        </button>
        <button
          className="action-button delete"
          onClick={() => {
            setActiveAction("delete")
            setFoodToUpdate(null)
          }}
        >
          Delete Food
        </button>
        <button
          className="action-button update"
          onClick={() => {
            setActiveAction("update")
            setFoodToUpdate(null)
          }}
        >
          Update Food
        </button>
      </div>

      {activeAction === "add" && (
        <div className="admin-form">
          <h3>Add New Food Item</h3>
          <form onSubmit={handleAddFood}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="Fast Food">Fast Food</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Main Course">Main Course</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Add Food
              </button>
              <button type="button" className="cancel-button" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeAction === "delete" && (
        <div className="admin-form">
          <h3>Delete Food Item</h3>
          <form onSubmit={handleDeleteFood}>
            <div className="form-group">
              <label htmlFor="foodId">Food ID</label>
              <input type="text" id="foodId" value={foodId} onChange={(e) => setFoodId(e.target.value)} required />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button delete">
                Delete Food
              </button>
              <button type="button" className="cancel-button" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeAction === "update" && !foodToUpdate && (
        <div className="admin-form">
          <h3>Find Food to Update</h3>
          <form onSubmit={handleFindFood}>
            <div className="form-group">
              <label htmlFor="foodId">Food ID</label>
              <input type="text" id="foodId" value={foodId} onChange={(e) => setFoodId(e.target.value)} required />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Find Food
              </button>
              <button type="button" className="cancel-button" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeAction === "update" && foodToUpdate && (
        <div className="admin-form">
          <h3>Update Food Item</h3>
          <form onSubmit={handleUpdateFood}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="Fast Food">Fast Food</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Main Course">Main Course</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button update">
                Update Food
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setFoodToUpdate(null)
                  setActiveAction("update")
                }}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading foods...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.food_id}>
                <td>{food.food_id}</td>
                <td>{food.name}</td>
                <td>{food.category}</td>
                <td>₹{Number.parseFloat(food.price).toFixed(2)}</td>
                <td>{food.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default FoodManagement

