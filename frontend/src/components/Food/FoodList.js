"use client"

import "./Food.css"

function FoodList({ foods, onFoodClick }) {
  // Function to convert file path to usable URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=200&width=200"

    // Extract filename from path
    const parts = imagePath.split("/")
    const filename = parts[parts.length - 1]

    // Return a relative URL to the backend server
    return `http://localhost:3001/images/food/${filename}`
  }

  return (
    <div className="food-grid">
      {foods.map((food) => (
        <div key={food.food_id} className="food-card" onClick={() => onFoodClick(food)}>
          <div className="food-image">
            <img
              src={getImageUrl(food.image_url) || "/placeholder.svg"}
              alt={food.name}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=200&width=200"
              }}
            />
          </div>
          <div className="food-info">
            <h3 className="food-name">{food.name}</h3>
            <p className="food-price">₹{Number.parseFloat(food.price).toFixed(2)}</p>
            <p className="food-category">{food.category}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FoodList

