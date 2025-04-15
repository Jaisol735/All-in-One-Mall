"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import SearchBar from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Shop/SearchBar"
import ProductList from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Shop/ProductList"
import ProductModal from "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Shop/ProductModal.js"
import "C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/frontend/src/components/Signup.css"

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem("user")
    if (!loggedInUser) {
      navigate("/")
      return
    }

    fetchProducts()
  }, [navigate])

  // Fetch products from backend
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
      setError("Error fetching products. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = async (term) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/search?term=${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error("Failed to search products")
      }
      const data = await response.json()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError("Error searching products. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Open product modal
  const openProductModal = (product) => {
    setSelectedProduct(product)
  }

  // Close product modal
  const closeProductModal = () => {
    setSelectedProduct(null)
  }

  // Add to cart
  const addToCart = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      const response = await fetch("http://localhost:3001/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: product.item_id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add item to cart")
      }

      alert(`Added ${product.name} to cart!`)
      closeProductModal()
    } catch (err) {
      console.error("Error adding to cart:", err)
      alert("Error adding item to cart. Please try again.")
    }
  }

  return (
    <div className="shop-page">
      <Navbar />

      <div className="shop-container">
      <h1 style={{ textAlign: "center", marginTop: "20px" }}>Shop anything you want</h1>
        <SearchBar onSearch={handleSearch} />

          {loading && <div className="loading">Loading products...</div>}

          {error && <div className="error">{error}</div>}

          {!loading && !error && products.length === 0 && <div className="no-results">No items found</div>}

          {!loading && !error && products.length > 0 && (
            <ProductList products={products} onProductClick={openProductModal} />
          )}

          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={closeProductModal}
              onAddToCart={() => addToCart(selectedProduct)}
            />
          )}
      </div>
    </div>
  )
}

export default Shop



