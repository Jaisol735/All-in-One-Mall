"use client"

import { useState, useEffect } from "react"
import "./Admin.css"

function ShopManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeAction, setActiveAction] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    category: "Electronics",
    name: "",
    price: "",
    stock: "",
    image_url: "",
    description: "",
  })
  const [productId, setProductId] = useState("")
  const [productToUpdate, setProductToUpdate] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Error loading products. Please try again.")
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

  const handleAddProduct = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/shop/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add product")
      }

      setSuccessMessage("Product added successfully!")
      setFormData({
        category: "Electronics",
        name: "",
        price: "",
        stock: "",
        image_url: "",
        description: "",
      })
      setActiveAction(null)
      fetchProducts()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Error adding product. Please try again.")
    }
  }

  const handleDeleteProduct = async (e) => {
    e.preventDefault()

    if (!productId) {
      setError("Please enter a product ID")
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/shop/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setSuccessMessage("Product deleted successfully!")
      setProductId("")
      setActiveAction(null)
      fetchProducts()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Error deleting product. Please try again.")
    }
  }

  const handleFindProduct = async (e) => {
    e.preventDefault()

    if (!productId) {
      setError("Please enter a product ID")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}`)

      if (!response.ok) {
        throw new Error("Failed to find product")
      }

      const product = await response.json()
      setProductToUpdate(product)
      setFormData({
        category: product.category,
        name: product.name,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url,
        description: product.description,
      })
    } catch (err) {
      console.error("Error finding product:", err)
      setError("Error finding product. Please try again.")
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/api/admin/shop/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productToUpdate.item_id,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      setSuccessMessage("Product updated successfully!")
      setProductToUpdate(null)
      setProductId("")
      setFormData({
        category: "Electronics",
        name: "",
        price: "",
        stock: "",
        image_url: "",
        description: "",
      })
      setActiveAction(null)
      fetchProducts()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Error updating product. Please try again.")
    }
  }

  return (
    <div className="admin-section">
      <h2>Shop Management</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-actions">
        <button
          className="action-button"
          onClick={() => {
            setActiveAction("add")
            setProductToUpdate(null)
            setFormData({
              category: "Electronics",
              name: "",
              price: "",
              stock: "",
              image_url: "",
              description: "",
            })
          }}
        >
          Add Product
        </button>
        <button
          className="action-button delete"
          onClick={() => {
            setActiveAction("delete")
            setProductToUpdate(null)
          }}
        >
          Delete Product
        </button>
        <button
          className="action-button update"
          onClick={() => {
            setActiveAction("update")
            setProductToUpdate(null)
          }}
        >
          Update Product
        </button>
      </div>

      {activeAction === "add" && (
        <div className="admin-form">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Vehicles">Vehicles</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
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
                Add Product
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
          <h3>Delete Product</h3>
          <form onSubmit={handleDeleteProduct}>
            <div className="form-group">
              <label htmlFor="productId">Product ID</label>
              <input
                type="text"
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button delete">
                Delete Product
              </button>
              <button type="button" className="cancel-button" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeAction === "update" && !productToUpdate && (
        <div className="admin-form">
          <h3>Find Product to Update</h3>
          <form onSubmit={handleFindProduct}>
            <div className="form-group">
              <label htmlFor="productId">Product ID</label>
              <input
                type="text"
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Find Product
              </button>
              <button type="button" className="cancel-button" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeAction === "update" && productToUpdate && (
        <div className="admin-form">
          <h3>Update Product</h3>
          <form onSubmit={handleUpdateProduct}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Vehicles">Vehicles</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
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
                Update Product
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setProductToUpdate(null)
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
        <div className="loading-spinner">Loading products...</div>
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
            {products.map((product) => (
              <tr key={product.item_id}>
                <td>{product.item_id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{Number.parseFloat(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ShopManagement

