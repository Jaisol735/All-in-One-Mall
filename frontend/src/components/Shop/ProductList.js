"use client"
import "./ProductList.css"

function ProductList({ products, onProductClick }) {
  // Function to convert file path to usable URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=200&width=200"

    // Extract filename from path
    const parts = imagePath.split("\\")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/shop/${filename}`
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.item_id} className="product-card" onClick={() => onProductClick(product)}>
          <div className="product-image">
            <img
              src={getImageUrl(product.image_url) || "/placeholder.svg"}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=200&width=200"
              }}
            />
          </div>
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">₹{Number.parseFloat(product.price).toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductList

