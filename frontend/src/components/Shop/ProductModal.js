"use client"
import "./ProductModal.css"

function ProductModal({ product, onClose, onAddToCart }) {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=200&width=200"

    // Extract filename from path
    const parts = imagePath.split("\\")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/shop/${filename}`
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="modal-product">
          <div className="modal-product-image">
            <img
              src={getImageUrl(product.image_url) || "https://via.placeholder.com/300"}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "https://via.placeholder.com/300"
              }}
            />
          </div>

          <div className="modal-product-details">
            <h2 className="modal-product-name">{product.name}</h2>
            <p className="modal-product-price">₹{Number.parseFloat(product.price).toFixed(2)}</p>
            <div className="modal-product-description">
              <h3>Description:</h3>
              <p>{product.description}</p>
            </div>

            <div className="modal-product-actions">
              <button className="add-to-cart-button" onClick={onAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal

