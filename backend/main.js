import http from "http"
import mysql from "mysql2/promise"
import { parse as parseUrl } from "url"
import { randomBytes } from "crypto"
import fs from "fs"

// Use a hardcoded port instead of environment variable
const PORT = 3001

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Jaisol@735', // Add your MySQL password here
  database: 'MALL',
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Connected to MySQL database successfully!")
    connection.release()
  } catch (error) {
    console.error("Error connecting to database:", error)
    process.exit(1)
  }
}

// This function checks and removes expired showtimes without refunding
async function checkAndRemoveExpiredShowtimes() {
  try {
    const connection = await pool.getConnection()

    // Get current date and time
    const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ")

    // First, identify expired showtimes
    const [expiredShowtimes] = await connection.query(
      "SELECT showtime_id, movie_id, show_time FROM Showtimes WHERE show_time < ?",
      [currentDateTime],
    )

    if (expiredShowtimes.length > 0) {
      console.log(`Found ${expiredShowtimes.length} expired showtimes to remove`)

      // Start transaction to ensure data consistency
      await connection.beginTransaction()

      try {
        // For each expired showtime, simply delete it without refunding
        for (const showtime of expiredShowtimes) {
          // Delete the showtime (this will cascade delete related seats due to foreign key constraints)
          await connection.query("DELETE FROM Showtimes WHERE showtime_id = ?", [showtime.showtime_id])
          console.log(`Deleted expired showtime ID: ${showtime.showtime_id}, time: ${showtime.show_time}`)
        }

        // Commit the transaction
        await connection.commit()
        console.log("Successfully removed expired showtimes")
      } catch (error) {
        // Rollback in case of error
        await connection.rollback()
        console.error("Error processing expired showtimes:", error)
      }
    }

    connection.release()
  } catch (error) {
    console.error("Error checking expired showtimes:", error)
  }
}

// Helper function to parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString()
    })
    req.on("end", () => {
      try {
        const parsedBody = body ? JSON.parse(body) : {}
        resolve(parsedBody)
      } catch (error) {
        reject(error)
      }
    })
    req.on("error", (error) => {
      reject(error)
    })
  })
}

// Helper function to format user data
const formatUserData = (userData) => {
  if (!userData) return null

  return {
    ...userData,
    balance: Number.parseFloat(userData.balance) || 0,
    reward_points: Number.parseInt(userData.reward_points) || 0,
  }
}

// Helper function to generate a unique transaction ID
const generateTransactionId = () => {
  return `TXN-${randomBytes(8).toString("hex").toUpperCase()}`
}

// Helper function to generate a unique order ID
const generateOrderId = () => {
  return `ORD-${randomBytes(6).toString("hex").toUpperCase()}`
}

// Helper function to serve static files
const serveStaticFile = (res, filePath, contentType) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath)
      res.writeHead(200, { "Content-Type": contentType })
      res.end(data)
      return true
    }
    return false
  } catch (error) {
    console.error("Error serving static file:", error)
    return false
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  // Parse URL and query parameters
  const parsedUrl = parseUrl(req.url, true)
  const path = parsedUrl.pathname
  const query = parsedUrl.query

  try {
    // Handle static file requests
    if (path.startsWith("/images/")) {
      const imagePath = path.replace(/^\/images\//, "")
      const [category, filename] = imagePath.split("/")

      let fullPath
      if (category === "shop") {
        fullPath = `C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\${filename}`
      } else if (category === "food") {
        fullPath = `C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Food\\${filename}`
      } else if (category === "movie") {
        fullPath = `C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Movie\\${filename}`
      }

      if (fullPath) {
        const contentType = filename.endsWith(".jpg")
          ? "image/jpeg"
          : filename.endsWith(".png")
            ? "image/png"
            : filename.endsWith(".webp")
              ? "image/webp"
              : filename.endsWith(".avif")
                ? "image/avif"
                : "application/octet-stream"

        if (serveStaticFile(res, fullPath, contentType)) {
          return
        }
      }

      // If file not found, return 404
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "File not found" }))
      return
    }

    // API endpoints
    if (path === "/api/products" && req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM Shop LIMIT 6")

      // Format price to ensure it's a number
      const formattedRows = rows.map((item) => ({
        ...item,
        price: Number.parseFloat(item.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedRows))
    }
    // Get product by ID
    else if (path.match(/^\/api\/products\/\d+$/) && req.method === "GET") {
      const productId = path.split("/").pop()
      const [rows] = await pool.query("SELECT * FROM Shop WHERE item_id = ?", [productId])

      if (rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Product not found" }))
        return
      }

      // Format price to ensure it's a number
      const product = {
        ...rows[0],
        price: Number.parseFloat(rows[0].price) || 0,
      }

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(product))
    }
    // Search endpoint
    else if (path === "/api/search" && req.method === "GET") {
      const searchTerm = query.term || ""
      const searchQuery = `
        SELECT * FROM Shop 
        WHERE description LIKE ? 
        OR name LIKE ?
      `
      const searchPattern = `%${searchTerm}%`
      const [rows] = await pool.query(searchQuery, [searchPattern, searchPattern])

      // Format price to ensure it's a number
      const formattedRows = rows.map((item) => ({
        ...item,
        price: Number.parseFloat(item.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedRows))
    }
    // User endpoint by ID
    else if (path.match(/^\/api\/user\/\d+$/) && req.method === "GET") {
      const userId = path.split("/").pop()
      const [rows] = await pool.query("SELECT * FROM Users WHERE user_id = ?", [userId])

      if (rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User not found" }))
        return
      }

      // Format user data to ensure numeric values
      const userData = formatUserData(rows[0])

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(userData))
    }
    // Login endpoint
    else if (path === "/api/login" && req.method === "POST") {
      const body = await parseBody(req)
      const { username, password } = body

      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Username and password are required" }))
        return
      }

      // Use exact match for name and password to avoid ambiguity with similar names
      const [rows] = await pool.query("SELECT * FROM Users WHERE name = ? AND password = ?", [username, password])

      if (rows.length === 0) {
        res.writeHead(401, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Invalid credentials" }))
        return
      }

      const user = rows[0]

      // Check if this is the admin user
      const isAdmin = username === "Jainam Solanki" && password === "12345"

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          success: true,
          userId: user.user_id,
          name: user.name,
          isAdmin: isAdmin,
        }),
      )
    }
    // Signup endpoint
    else if (path === "/api/signup" && req.method === "POST") {
      const body = await parseBody(req)
      const { name, email, password, address, phone_number } = body

      if (!name || !email || !password || !address || !phone_number) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      // Check if user already exists
      const [existingUsers] = await pool.query("SELECT * FROM Users WHERE email = ?", [email])

      if (existingUsers.length > 0) {
        res.writeHead(409, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User with this email already exists" }))
        return
      }

      // Insert new user
      const [result] = await pool.query(
        "INSERT INTO Users (name, email, password, address, phone_number, balance, reward_points) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, email, password, address, phone_number, 1000.0, 0],
      )

      res.writeHead(201, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          message: "User created successfully",
          userId: result.insertId,
        }),
      )
    }
    // Update reward points endpoint
    else if (path === "/api/update-reward-points" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId, points = 1 } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Update reward points in Users table
        await pool.query("UPDATE Users SET reward_points = reward_points + ? WHERE user_id = ?", [points, userId])

        // Get updated user data
        const [rows] = await pool.query("SELECT reward_points FROM Users WHERE user_id = ?", [userId])

        if (rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            rewardPoints: Number.parseInt(rows[0].reward_points) || 0,
          }),
        )
      } catch (error) {
        console.error("Error updating reward points:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating reward points", error: error.message }))
      }
    }
    // Word Guess Game win endpoint
    else if (path === "/api/word-guess-win" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Update reward points in Users table
        await pool.query("UPDATE Users SET reward_points = reward_points + 1 WHERE user_id = ?", [userId])

        // Get updated user data
        const [rows] = await pool.query("SELECT reward_points FROM Users WHERE user_id = ?", [userId])

        if (rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            rewardPoints: Number.parseInt(rows[0].reward_points) || 0,
          }),
        )
      } catch (error) {
        console.error("Error updating reward points:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating reward points", error: error.message }))
      }
    }
    // Snake and Ladder win endpoint
    else if (path === "/api/snake-ladder-win" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Update reward points in Users table
        await pool.query("UPDATE Users SET reward_points = reward_points + 1 WHERE user_id = ?", [userId])

        // Get updated user data
        const [rows] = await pool.query("SELECT reward_points FROM Users WHERE user_id = ?", [userId])

        if (rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            rewardPoints: Number.parseInt(rows[0].reward_points) || 0,
          }),
        )
      } catch (error) {
        console.error("Error updating reward points:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating reward points", error: error.message }))
      }
    }
    // Squid Game win endpoint
    else if (path === "/api/squid-game-win" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Update reward points (5 points for Squid Game) in Users table
        await pool.query("UPDATE Users SET reward_points = reward_points + 5 WHERE user_id = ?", [userId])

        // Get updated user data
        const [rows] = await pool.query("SELECT reward_points FROM Users WHERE user_id = ?", [userId])

        if (rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            rewardPoints: Number.parseInt(rows[0].reward_points) || 0,
          }),
        )
      } catch (error) {
        console.error("Error updating reward points:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating reward points", error: error.message }))
      }
    }
    // Get user name endpoint
    else if (path === "/api/user-name" && req.method === "GET") {
      const userId = query.userId

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      const [rows] = await pool.query("SELECT name FROM Users WHERE user_id = ?", [userId])

      if (rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User not found" }))
        return
      }

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ name: rows[0].name }))
    }
    // Convert reward points to balance
    else if (path === "/api/convert-rewards" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      // Get current reward points
      const [userRows] = await pool.query("SELECT reward_points FROM Users WHERE user_id = ?", [userId])

      if (userRows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User not found" }))
        return
      }

      const rewardPoints = Number.parseInt(userRows[0].reward_points) || 0

      if (rewardPoints <= 0) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "No reward points to convert" }))
        return
      }

      // Update balance and reset reward points
      await pool.query("UPDATE Users SET balance = balance + ?, reward_points = 0 WHERE user_id = ?", [
        rewardPoints,
        userId,
      ])

      // Generate a transaction ID and order ID
      const transactionId = generateTransactionId()
      const orderId = generateOrderId()

      // Create an order record
      await pool.query(
        "INSERT INTO Orders (user_id, purchase_type, purchase_id, amount, status) VALUES (?, ?, ?, ?, ?)",
        [userId, "Shop", 0, rewardPoints, "Completed"],
      )

      // Get the inserted order ID
      const [orderResult] = await pool.query("SELECT LAST_INSERT_ID() as orderId")
      const insertedOrderId = orderResult[0].orderId

      // Add transaction record
      try {
        await pool.query(
          "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
          [userId, insertedOrderId, rewardPoints, "Wallet", "Success"],
        )
      } catch (error) {
        console.error("Error recording transaction:", error)
        // Continue with the response even if transaction recording fails
      }

      // Get updated user data
      const [updatedUser] = await pool.query("SELECT balance FROM Users WHERE user_id = ?", [userId])

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          success: true,
          convertedAmount: rewardPoints,
          newBalance: Number.parseFloat(updatedUser[0].balance) || 0,
        }),
      )
    }
    // Get cart items
    else if (path === "/api/cart" && req.method === "GET") {
      const userId = query.userId

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      // Get shop items
      const [shopItems] = await pool.query(
        `SELECT c.cart_id, c.user_id, c.purchase_id as item_id, c.quantity, s.name, s.price, s.image_url, s.description, 'Shop' as item_type
         FROM Cart c
         JOIN Shop s ON c.purchase_id = s.item_id
         WHERE c.user_id = ? AND c.purchase_type = 'Shop'`,
        [userId],
      )

      // Get food items
      const [foodItems] = await pool.query(
        `SELECT c.cart_id, c.user_id, c.purchase_id as item_id, c.quantity, f.name, f.price, f.image_url, f.description, 'Food' as item_type
         FROM Cart c
         JOIN Food f ON c.purchase_id = f.food_id
         WHERE c.user_id = ? AND c.purchase_type = 'Food'`,
        [userId],
      )

      // Get movie items
      const [movieItems] = await pool.query(
        `SELECT c.cart_id, c.user_id, c.purchase_id as item_id, c.seat_id, c.quantity, 
          m.name, m.price, m.image_url, 'Movie' as item_type,
          ms.seat_number, st.show_time
         FROM Cart c
         JOIN Movies m ON c.purchase_id = m.movie_id
         JOIN Movie_Seat ms ON c.seat_id = ms.seat_id
         JOIN Showtimes st ON ms.showtime_id = st.showtime_id
         WHERE c.user_id = ? AND c.purchase_type = 'Movie'`,
        [userId],
      )

      // Combine and format items
      const allItems = [...shopItems, ...foodItems, ...movieItems].map((item) => ({
        ...item,
        price: Number.parseFloat(item.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(allItems))
    }
    // Add to cart
    else if (path === "/api/cart/add" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId, itemId, quantity = 1, purchaseType = "Shop" } = body

      if (!userId || !itemId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID and Item ID are required" }))
        return
      }

      // Check if item already in cart
      const [existingItems] = await pool.query(
        "SELECT * FROM Cart WHERE user_id = ? AND purchase_id = ? AND purchase_type = ?",
        [userId, itemId, purchaseType],
      )

      if (existingItems.length > 0) {
        // Update quantity
        await pool.query(
          "UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND purchase_id = ? AND purchase_type = ?",
          [quantity, userId, itemId, purchaseType],
        )
      } else {
        // Add new item to cart
        await pool.query("INSERT INTO Cart (user_id, purchase_type, purchase_id, quantity) VALUES (?, ?, ?, ?)", [
          userId,
          purchaseType,
          itemId,
          quantity,
        ])
      }

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ success: true }))
    }
    // Add movie seat to cart
    else if (path === "/api/cart/add-movie-seat" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId, movieId, showtimeId, seatNumber } = body

      if (!userId || !movieId || !showtimeId || !seatNumber) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID, Movie ID, Showtime ID, and Seat Number are required" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Check if seat already exists
        const [existingSeat] = await connection.query(
          "SELECT * FROM Movie_Seat WHERE showtime_id = ? AND seat_number = ?",
          [showtimeId, seatNumber],
        )

        let seatId

        if (existingSeat.length > 0) {
          // Check if seat is already booked
          if (existingSeat[0].user_id !== null) {
            await connection.rollback()
            res.writeHead(400, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "This seat is already booked" }))
            return
          }

          seatId = existingSeat[0].seat_id
        } else {
          // Create new seat
          const [insertResult] = await connection.query(
            "INSERT INTO Movie_Seat (showtime_id, seat_number, user_id) VALUES (?, ?, NULL)",
            [showtimeId, seatNumber],
          )
          seatId = insertResult.insertId
        }

        // Check if seat is already in cart
        const [existingCartItem] = await connection.query(
          "SELECT * FROM Cart WHERE user_id = ? AND purchase_type = 'Movie' AND seat_id = ?",
          [userId, seatId],
        )

        if (existingCartItem.length > 0) {
          await connection.rollback()
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "This seat is already in your cart" }))
          return
        }

        // Add to cart
        await connection.query(
          "INSERT INTO Cart (user_id, purchase_type, purchase_id, seat_id, quantity) VALUES (?, 'Movie', ?, ?, 1)",
          [userId, movieId, seatId],
        )

        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ success: true, seatId }))
      } catch (error) {
        await connection.rollback()
        console.error("Error adding movie seat to cart:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error adding movie seat to cart", error: error.message }))
      } finally {
        connection.release()
      }
    }
    // Remove from cart
    else if (path === "/api/cart/remove" && req.method === "POST") {
      const body = await parseBody(req)
      const { cartId } = body

      if (!cartId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Cart ID is required" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Check if it's a movie ticket
        const [cartItem] = await connection.query("SELECT * FROM Cart WHERE cart_id = ? AND purchase_type = 'Movie'", [
          cartId,
        ])

        // If it's a movie ticket, we need to handle the seat
        if (cartItem.length > 0 && cartItem[0].seat_id) {
          // Delete the seat record completely
          await connection.query("DELETE FROM Movie_Seat WHERE seat_id = ?", [cartItem[0].seat_id])
        }

        // Remove from cart
        await connection.query("DELETE FROM Cart WHERE cart_id = ?", [cartId])

        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ success: true }))
      } catch (error) {
        await connection.rollback()
        console.error("Error removing item from cart:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error removing item from cart", error: error.message }))
      } finally {
        connection.release()
      }
    }
    // Checkout
    else if (path === "/api/checkout" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      // Get shop cart items
      const [shopItems] = await pool.query(
        `SELECT c.cart_id, c.purchase_id as item_id, c.quantity, c.purchase_type, s.price, s.name
       FROM Cart c
       JOIN Shop s ON c.purchase_id = s.item_id
       WHERE c.user_id = ? AND c.purchase_type = 'Shop'`,
        [userId],
      )

      // Get food cart items
      const [foodItems] = await pool.query(
        `SELECT c.cart_id, c.purchase_id as item_id, c.quantity, c.purchase_type, f.price, f.name
       FROM Cart c
       JOIN Food f ON c.purchase_id = f.food_id
       WHERE c.user_id = ? AND c.purchase_type = 'Food'`,
        [userId],
      )

      // Get movie cart items
      const [movieItems] = await pool.query(
        `SELECT c.cart_id, c.purchase_id as item_id, c.seat_id, c.quantity, c.purchase_type, 
        m.price, m.name, ms.seat_number, st.show_time
       FROM Cart c
       JOIN Movies m ON c.purchase_id = m.movie_id
       JOIN Movie_Seat ms ON c.seat_id = ms.seat_id
       JOIN Showtimes st ON ms.showtime_id = st.showtime_id
       WHERE c.user_id = ? AND c.purchase_type = 'Movie'`,
        [userId],
      )

      // Combine all cart items
      const cartItems = [...shopItems, ...foodItems, ...movieItems]

      if (cartItems.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Cart is empty" }))
        return
      }

      // Calculate total price
      let totalPrice = 0
      for (const item of cartItems) {
        totalPrice += (Number.parseFloat(item.price) || 0) * item.quantity
      }

      // Check if user has enough balance
      const [userRows] = await pool.query("SELECT balance FROM Users WHERE user_id = ?", [userId])

      if (userRows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User not found" }))
        return
      }
      const userBalance = Number.parseFloat(userRows[0].balance) || 0

      if (userBalance < totalPrice) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Insufficient balance" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Update user balance
        await connection.query("UPDATE Users SET balance = balance - ? WHERE user_id = ?", [totalPrice, userId])

        // Create an order for each cart item
        for (const item of cartItems) {
          const itemPrice = (Number.parseFloat(item.price) || 0) * item.quantity
          let orderStatus = "Upcoming" // Default status

          // Set initial status based on purchase type
          if (item.purchase_type === "Movie") {
            // For movies, check if the showtime is in the past
            if (item.show_time && new Date(item.show_time) < new Date()) {
              orderStatus = "Completed"
            }
          }

          // Create order
          await connection.query(
            "INSERT INTO Orders (user_id, purchase_type, purchase_id, amount, status) VALUES (?, ?, ?, ?, ?)",
            [userId, item.purchase_type, item.item_id, itemPrice, orderStatus],
          )

          // Get the inserted order ID
          const [orderResult] = await connection.query("SELECT LAST_INSERT_ID() as orderId")
          const orderId = orderResult[0].orderId

          // Create transaction record
          await connection.query(
            "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
            [userId, orderId, itemPrice, "Wallet", "Success"],
          )

          // If it's a movie ticket, update the seat to mark as booked
          if (item.purchase_type === "Movie") {
            await connection.query("UPDATE Movie_Seat SET user_id = ? WHERE seat_id = ?", [userId, item.seat_id])
          }
        }

        // Clear cart
        await connection.query("DELETE FROM Cart WHERE user_id = ?", [userId])

        // Commit transaction
        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            totalPrice,
            newBalance: userBalance - totalPrice,
          }),
        )
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback()
        console.error("Checkout error:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error during checkout", error: error.message }))
      } finally {
        connection.release()
      }
    }
    // Get foods
    else if (path === "/api/foods" && req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM Food LIMIT 6")

      // Format price to ensure it's a number
      const formattedRows = rows.map((food) => ({
        ...food,
        price: Number.parseFloat(food.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedRows))
    }
    // Get food by ID
    else if (path.match(/^\/api\/foods\/\d+$/) && req.method === "GET") {
      const foodId = path.split("/").pop()
      const [rows] = await pool.query("SELECT * FROM Food WHERE food_id = ?", [foodId])

      if (rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Food not found" }))
        return
      }

      // Format price to ensure it's a number
      const food = {
        ...rows[0],
        price: Number.parseFloat(rows[0].price) || 0,
      }

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(food))
    }
    // Search foods
    else if (path === "/api/foods/search" && req.method === "GET") {
      const searchTerm = query.term || ""
      const searchQuery = `
SELECT * FROM Food 
WHERE name LIKE ? 
OR description LIKE ?
`
      const searchPattern = `%${searchTerm}%`
      const [rows] = await pool.query(searchQuery, [searchPattern, searchPattern])

      // Format price to ensure it's a number
      const formattedRows = rows.map((food) => ({
        ...food,
        price: Number.parseFloat(food.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedRows))
    }
    // Get transaction history
    else if (path === "/api/transactions" && req.method === "GET") {
      const userId = query.userId

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Get transactions from the Transaction_History table
        const [rows] = await pool.query(
          `SELECT th.*, o.purchase_type as transaction_type, o.purchase_id,
          CASE 
            WHEN o.purchase_type = 'Shop' THEN (SELECT name FROM Shop WHERE item_id = o.purchase_id)
            WHEN o.purchase_type = 'Food' THEN (SELECT name FROM Food WHERE food_id = o.purchase_id)
            WHEN o.purchase_type = 'Movie' THEN (SELECT name FROM Movies WHERE movie_id = o.purchase_id)
            ELSE 'Unknown'
          END as item_name
         FROM Transaction_History th
         JOIN Orders o ON th.order_id = o.order_id
         WHERE th.user_id = ?
         ORDER BY th.created_at DESC`,
          [userId],
        )

        // Format transaction data
        const formattedTransactions = rows.map((transaction) => {
          return {
            ...transaction,
            amount: Number.parseFloat(transaction.amount) || 0,
            transaction_date: transaction.created_at,
          }
        })

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(formattedTransactions))
      } catch (error) {
        console.error("Error fetching transactions:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching transaction history", error: error.message }))
      }
    }
    // Get movies
    else if (path === "/api/movies" && req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM Movies LIMIT 6")

      // Format price to ensure it's a number
      const formattedRows = rows.map((movie) => ({
        ...movie,
        price: Number.parseFloat(movie.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedRows))
    }
    // Search movies
    else if (path === "/api/movies/search" && req.method === "GET") {
      const searchTerm = query.term || ""
      const searchQuery = `
      SELECT * FROM Movies 
      WHERE name LIKE ? 
      OR description LIKE ?
    `
      const searchPattern = `%${searchTerm}%`
      const [rows] = await pool.query(searchQuery, [searchPattern, searchPattern])

      // Format price to ensure it's a number
      const formattedRows = rows.map((movie) => ({
        ...movie,
        price: Number.parseFloat(movie.price) || 0,
      }))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedRows))
    }
    // Get movie details
    else if (path.match(/^\/api\/movies\/\d+$/) && req.method === "GET") {
      const movieId = path.split("/").pop()
      const [movieRows] = await pool.query("SELECT * FROM Movies WHERE movie_id = ?", [movieId])

      if (movieRows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Movie not found" }))
        return
      }

      // Get showtimes for the movie
      const [showtimeRows] = await pool.query("SELECT * FROM Showtimes WHERE movie_id = ?", [movieId])

      // Format price to ensure it's a number
      const movie = {
        ...movieRows[0],
        price: Number.parseFloat(movieRows[0].price) || 0,
        showtimes: showtimeRows,
      }

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(movie))
    }
    // Get movie seats
    else if (path.match(/^\/api\/movies\/\d+\/seats$/) && req.method === "GET") {
      const movieId = path.split("/")[3]
      const showtimeId = query.showtimeId

      if (!showtimeId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Showtime ID parameter is required" }))
        return
      }

      const [rows] = await pool.query(
        `SELECT ms.* 
       FROM Movie_Seat ms
       WHERE ms.showtime_id = ?`,
        [showtimeId],
      )

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(rows))
    }
    // Get seat by order ID
    else if (path.match(/^\/api\/orders\/\d+\/seat$/) && req.method === "GET") {
      const orderId = path.split("/")[3]

      try {
        // First, get the purchase_id (movie_id) from the order
        const [orderRows] = await pool.query(
          "SELECT purchase_id, user_id FROM Orders WHERE order_id = ? AND purchase_type = 'Movie'",
          [orderId],
        )

        if (orderRows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Movie order not found" }))
          return
        }

        const movieId = orderRows[0].purchase_id
        const userId = orderRows[0].user_id

        // Find the seat associated with this movie and user
        const [seatRows] = await pool.query(
          `SELECT ms.seat_id, ms.seat_number, ms.showtime_id, st.show_time 
           FROM Movie_Seat ms
           JOIN Showtimes st ON ms.showtime_id = st.showtime_id
           WHERE st.movie_id = ? AND ms.user_id = ?
           LIMIT 1`,
          [movieId, userId],
        )

        if (seatRows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Seat not found for this order" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(seatRows[0]))
      } catch (error) {
        console.error("Error fetching seat for order:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching seat information", error: error.message }))
      }
    }
    // Deposit funds endpoint
    else if (path === "/api/deposit" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId, amount } = body

      if (!userId || !amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Valid user ID and amount are required" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Update user balance
        await connection.query("UPDATE Users SET balance = balance + ? WHERE user_id = ?", [
          Number.parseFloat(amount),
          userId,
        ])

        // Create an order record for the deposit
        await connection.query(
          "INSERT INTO Orders (user_id, purchase_type, purchase_id, amount, status) VALUES (?, ?, ?, ?, ?)",
          [userId, "Shop", 0, Number.parseFloat(amount), "Completed"],
        )

        // Get the inserted order ID
        const [orderResult] = await connection.query("SELECT LAST_INSERT_ID() as orderId")
        const orderId = orderResult[0].orderId

        // Create transaction record
        await connection.query(
          "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
          [userId, orderId, Number.parseFloat(amount), "Wallet", "Success"],
        )

        // Get updated balance
        const [userRows] = await connection.query("SELECT balance FROM Users WHERE user_id = ?", [userId])

        if (userRows.length === 0) {
          throw new Error("User not found")
        }

        // Commit transaction
        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            newBalance: Number.parseFloat(userRows[0].balance) || 0,
          }),
        )
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback()
        console.error("Deposit error:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error processing deposit", error: error.message }))
      } finally {
        connection.release()
      }
    }

    // ADMIN API ENDPOINTS

    // Get all users
    else if (path === "/api/admin/users" && req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM Users")

      // Format user data
      const formattedUsers = rows.map((user) => formatUserData(user))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify(formattedUsers))
    }

    // Add user
    else if (path === "/api/admin/users/add" && req.method === "POST") {
      const body = await parseBody(req)
      const { name, email, phone_number, password, address, balance, reward_points } = body

      if (!name || !email || !phone_number || !password || !address) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All required fields must be provided" }))
        return
      }

      try {
        // Check if user already exists
        const [existingUsers] = await pool.query("SELECT * FROM Users WHERE email = ?", [email])

        if (existingUsers.length > 0) {
          res.writeHead(409, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User with this email already exists" }))
          return
        }

        // Insert new user
        const [result] = await pool.query(
          "INSERT INTO Users (name, email, phone_number, password, address, balance, reward_points) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, email, phone_number, password, address, balance || 1000, reward_points || 0],
        )

        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "User added successfully",
            userId: result.insertId,
          }),
        )
      } catch (error) {
        console.error("Error adding user:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error adding user", error: error.message }))
      }
    }

    // Delete user
    else if (path === "/api/admin/users/delete" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId } = body

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Delete user
        const [result] = await pool.query("DELETE FROM Users WHERE user_id = ?", [userId])

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "User deleted successfully",
          }),
        )
      } catch (error) {
        console.error("Error deleting user:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error deleting user", error: error.message }))
      }
    }

    // Update user reward points
    else if (path === "/api/admin/users/update-rewards" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId, rewardPoints } = body

      if (!userId || rewardPoints === undefined) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID and reward points are required" }))
        return
      }

      try {
        // Update reward points
        const [result] = await pool.query("UPDATE Users SET reward_points = ? WHERE user_id = ?", [
          rewardPoints,
          userId,
        ])

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Reward points updated successfully",
          }),
        )
      } catch (error) {
        console.error("Error updating reward points:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating reward points", error: error.message }))
      }
    }

    // Add shop product
    else if (path === "/api/admin/shop/add" && req.method === "POST") {
      const body = await parseBody(req)
      const { category, name, price, stock, image_url, description } = body

      if (!category || !name || !price || !stock || !image_url || !description) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Insert new product
        const [result] = await pool.query(
          "INSERT INTO Shop (category, name, price, stock, image_url, description) VALUES (?, ?, ?, ?, ?, ?)",
          [category, name, price, stock, image_url, description],
        )

        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Product added successfully",
            productId: result.insertId,
          }),
        )
      } catch (error) {
        console.error("Error adding product:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error adding product", error: error.message }))
      }
    }

    // Delete shop product
    else if (path === "/api/admin/shop/delete" && req.method === "POST") {
      const body = await parseBody(req)
      const { productId } = body

      if (!productId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Product ID is required" }))
        return
      }

      try {
        // Delete product
        const [result] = await pool.query("DELETE FROM Shop WHERE item_id = ?", [productId])

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Product not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Product deleted successfully",
          }),
        )
      } catch (error) {
        console.error("Error deleting product:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error deleting product", error: error.message }))
      }
    }

    // Update shop product
    else if (path === "/api/admin/shop/update" && req.method === "POST") {
      const body = await parseBody(req)
      const { productId, category, name, price, stock, image_url, description } = body

      if (!productId || !category || !name || !price || !stock || !image_url || !description) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Update product
        const [result] = await pool.query(
          "UPDATE Shop SET category = ?, name = ?, price = ?, stock = ?, image_url = ?, description = ? WHERE item_id = ?",
          [category, name, price, stock, image_url, description, productId],
        )

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Product not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Product updated successfully",
          }),
        )
      } catch (error) {
        console.error("Error updating product:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating product", error: error.message }))
      }
    }

    // Add food item
    else if (path === "/api/admin/food/add" && req.method === "POST") {
      const body = await parseBody(req)
      const { name, category, price, stock, image_url, description } = body

      if (!name || !category || !price || !stock || !image_url || !description) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Insert new food item
        const [result] = await pool.query(
          "INSERT INTO Food (name, category, price, stock, image_url, description) VALUES (?, ?, ?, ?, ?, ?)",
          [name, category, price, stock, image_url, description],
        )

        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Food item added successfully",
            foodId: result.insertId,
          }),
        )
      } catch (error) {
        console.error("Error adding food item:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error adding food item", error: error.message }))
      }
    }

    // Delete food item
    else if (path === "/api/admin/food/delete" && req.method === "POST") {
      const body = await parseBody(req)
      const { foodId } = body

      if (!foodId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Food ID is required" }))
        return
      }

      try {
        // Delete food item
        const [result] = await pool.query("DELETE FROM Food WHERE food_id = ?", [foodId])

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Food item not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Food item deleted successfully",
          }),
        )
      } catch (error) {
        console.error("Error deleting food item:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error deleting food item", error: error.message }))
      }
    }

    // Update food item
    else if (path === "/api/admin/food/update" && req.method === "POST") {
      const body = await parseBody(req)
      const { foodId, name, category, price, stock, image_url, description } = body

      if (!foodId || !name || !category || !price || !stock || !image_url || !description) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Update food item
        const [result] = await pool.query(
          "UPDATE Food SET name = ?, category = ?, price = ?, stock = ?, image_url = ?, description = ? WHERE food_id = ?",
          [name, category, price, stock, image_url, description, foodId],
        )

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Food item not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Food item updated successfully",
          }),
        )
      } catch (error) {
        console.error("Error updating food item:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating food item", error: error.message }))
      }
    }

    // Add movie
    else if (path === "/api/admin/movies/add" && req.method === "POST") {
      const body = await parseBody(req)
      const { name, description, available_tickets, booked_tickets, price, image_url } = body

      if (!name || !description || !available_tickets || !price || !image_url) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All required fields must be provided" }))
        return
      }

      try {
        // Insert new movie
        const [result] = await pool.query(
          "INSERT INTO Movies (name, description, available_tickets, booked_tickets, price, image_url) VALUES (?, ?, ?, ?, ?, ?)",
          [name, description, available_tickets, booked_tickets || 0, price, image_url],
        )

        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Movie added successfully",
            movieId: result.insertId,
          }),
        )
      } catch (error) {
        console.error("Error adding movie:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error adding movie", error: error.message }))
      }
    }

    // Delete movie
    else if (path === "/api/admin/movies/delete" && req.method === "POST") {
      const body = await parseBody(req)
      const { movieId } = body

      if (!movieId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Movie ID is required" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Check if there are any booked seats for this movie
        const [showtimes] = await connection.query("SELECT showtime_id FROM Showtimes WHERE movie_id = ?", [movieId])

        // For each showtime, check if there are booked seats
        for (const showtime of showtimes) {
          const [seats] = await connection.query(
            "SELECT ms.seat_id, ms.user_id, m.price FROM Movie_Seat ms JOIN Showtimes s ON ms.showtime_id = s.showtime_id JOIN Movies m ON s.movie_id = m.movie_id WHERE ms.showtime_id = ? AND ms.user_id IS NOT NULL",
            [showtime.showtime_id],
          )

          // Refund users who booked seats
          for (const seat of seats) {
            if (seat.user_id) {
              // Update user balance
              await connection.query("UPDATE Users SET balance = balance + ? WHERE user_id = ?", [
                seat.price,
                seat.user_id,
              ])

              // Create refund order
              const [orderResult] = await connection.query(
                "INSERT INTO Orders (user_id, purchase_type, purchase_id, amount, status) VALUES (?, ?, ?, ?, ?)",
                [seat.user_id, "Movie", movieId, seat.price, "Cancelled"],
              )

              // Create refund transaction
              await connection.query(
                "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
                [seat.user_id, orderResult.insertId, seat.price, "Wallet", "Refunded"],
              )
            }
          }
        }

        // Delete movie (this will cascade delete showtimes and seats)
        const [result] = await connection.query("DELETE FROM Movies WHERE movie_id = ?", [movieId])

        if (result.affectedRows === 0) {
          await connection.rollback()
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Movie not found" }))
          return
        }

        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Movie deleted successfully",
          }),
        )
      } catch (error) {
        await connection.rollback()
        console.error("Error deleting movie:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error deleting movie", error: error.message }))
      } finally {
        connection.release()
      }
    }

    // Update movie
    else if (path === "/api/admin/movies/update" && req.method === "POST") {
      const body = await parseBody(req)
      const { movieId, name, description, available_tickets, booked_tickets, price, image_url } = body

      if (!movieId || !name || !description || !available_tickets || !price || !image_url) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Update movie
        const [result] = await pool.query(
          "UPDATE Movies SET name = ?, description = ?, available_tickets = ?, booked_tickets = ?, price = ?, image_url = ? WHERE movie_id = ?",
          [name, description, available_tickets, booked_tickets, price, image_url, movieId],
        )

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Movie not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Movie updated successfully",
          }),
        )
      } catch (error) {
        console.error("Error updating movie:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating movie", error: error.message }))
      }
    }

    // Get all showtimes
    else if (path === "/api/admin/showtimes" && req.method === "GET") {
      try {
        const [rows] = await pool.query(`
        SELECT s.*, m.name as movie_name 
        FROM Showtimes s 
        JOIN Movies m ON s.movie_id = m.movie_id
      `)

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(rows))
      } catch (error) {
        console.error("Error fetching showtimes:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching showtimes", error: error.message }))
      }
    }

    // Get showtime by ID
    else if (path.match(/^\/api\/admin\/showtimes\/\d+$/) && req.method === "GET") {
      const showtimeId = path.split("/").pop()

      try {
        const [rows] = await pool.query(
          `
        SELECT s.*, m.name as movie_name 
        FROM Showtimes s 
        JOIN Movies m ON s.movie_id = m.movie_id
        WHERE s.showtime_id = ?
      `,
          [showtimeId],
        )

        if (rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Showtime not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(rows[0]))
      } catch (error) {
        console.error("Error fetching showtime:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching showtime", error: error.message }))
      }
    }

    // Add showtime
    else if (path === "/api/admin/showtimes/add" && req.method === "POST") {
      const body = await parseBody(req)
      const { movie_id, show_time } = body

      if (!movie_id || !show_time) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Movie ID and show time are required" }))
        return
      }

      try {
        // Check if movie exists
        const [movieRows] = await pool.query("SELECT * FROM Movies WHERE movie_id = ?", [movie_id])

        if (movieRows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Movie not found" }))
          return
        }

        // Insert new showtime
        const [result] = await pool.query("INSERT INTO Showtimes (movie_id, show_time) VALUES (?, ?)", [
          movie_id,
          show_time,
        ])

        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Showtime added successfully",
            showtimeId: result.insertId,
          }),
        )
      } catch (error) {
        console.error("Error adding showtime:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error adding showtime", error: error.message }))
      }
    }

    // Delete showtime
    else if (path === "/api/admin/showtimes/delete" && req.method === "POST") {
      const body = await parseBody(req)
      const { showtimeId } = body

      if (!showtimeId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Showtime ID is required" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Check if there are any booked seats for this showtime
        const [seats] = await connection.query(
          "SELECT ms.seat_id, ms.user_id, m.price FROM Movie_Seat ms JOIN Showtimes s ON ms.showtime_id = s.showtime_id JOIN Movies m ON s.movie_id = m.movie_id WHERE ms.showtime_id = ? AND ms.user_id IS NOT NULL",
          [showtimeId],
        )

        // Refund users who booked seats
        for (const seat of seats) {
          if (seat.user_id) {
            // Update user balance
            await connection.query("UPDATE Users SET balance = balance + ? WHERE user_id = ?", [
              seat.price,
              seat.user_id,
            ])

            // Create refund order
            const [orderResult] = await connection.query(
              "INSERT INTO Orders (user_id, purchase_type, purchase_id, amount, status) VALUES (?, ?, ?, ?, ?)",
              [seat.user_id, "Movie", 0, seat.price, "Cancelled"],
            )

            // Create refund transaction
            await connection.query(
              "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
              [seat.user_id, orderResult.insertId, seat.price, "Wallet", "Refunded"],
            )
          }
        }

        // Delete showtime (this will cascade delete seats)
        const [result] = await connection.query("DELETE FROM Showtimes WHERE showtime_id = ?", [showtimeId])

        if (result.affectedRows === 0) {
          await connection.rollback()
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Showtime not found" }))
          return
        }

        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Showtime deleted successfully",
          }),
        )
      } catch (error) {
        await connection.rollback()
        console.error("Error deleting showtime:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error deleting showtime", error: error.message }))
      } finally {
        connection.release()
      }
    }

    // Update showtime
    else if (path === "/api/admin/showtimes/update" && req.method === "POST") {
      const body = await parseBody(req)
      const { showtimeId, movie_id, show_time } = body

      if (!showtimeId || !movie_id || !show_time) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Check if movie exists
        const [movieRows] = await pool.query("SELECT * FROM Movies WHERE movie_id = ?", [movie_id])

        if (movieRows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Movie not found" }))
          return
        }

        // Update showtime
        const [result] = await pool.query("UPDATE Showtimes SET movie_id = ?, show_time = ? WHERE showtime_id = ?", [
          movie_id,
          show_time,
          showtimeId,
        ])

        if (result.affectedRows === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Showtime not found" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Showtime updated successfully",
          }),
        )
      } catch (error) {
        console.error("Error updating showtime:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating showtime", error: error.message }))
      }
    }

    // Add the following API endpoints after the existing endpoints and before the "Handle 404" section

    // Get user orders
    else if (path === "/api/orders" && req.method === "GET") {
      const userId = query.userId

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Get orders with item details
        const [rows] = await pool.query(
          `SELECT o.*, 
        CASE 
          WHEN o.purchase_type = 'Shop' THEN (SELECT name FROM Shop WHERE item_id = o.purchase_id)
          WHEN o.purchase_type = 'Food' THEN (SELECT name FROM Food WHERE food_id = o.purchase_id)
          WHEN o.purchase_type = 'Movie' THEN (SELECT name FROM Movies WHERE movie_id = o.purchase_id)
        END as item_name,
        CASE 
          WHEN o.purchase_type = 'Shop' THEN (SELECT image_url FROM Shop WHERE item_id = o.purchase_id)
          WHEN o.purchase_type = 'Food' THEN (SELECT image_url FROM Food WHERE food_id = o.purchase_id)
          WHEN o.purchase_type = 'Movie' THEN (SELECT image_url FROM Movies WHERE movie_id = o.purchase_id)
        END as image_url,
        CASE 
          WHEN o.purchase_type = 'Movie' THEN (
            SELECT ms.seat_number 
            FROM Movie_Seat ms 
            WHERE ms.user_id = o.user_id AND ms.showtime_id IN (
              SELECT st.showtime_id FROM Showtimes st WHERE st.movie_id = o.purchase_id
            )
            LIMIT 1
          )
          ELSE NULL
        END as seat_number,
        CASE 
          WHEN o.purchase_type = 'Movie' THEN (
            SELECT st.show_time 
            FROM Showtimes st 
            JOIN Movie_Seat ms ON st.showtime_id = ms.showtime_id
            WHERE ms.user_id = o.user_id AND st.movie_id = o.purchase_id
            LIMIT 1
          )
          ELSE NULL
        END as show_time
      FROM Orders o
      WHERE o.user_id = ? AND o.purchase_id != 0
      ORDER BY o.created_at DESC`,
          [userId],
        )

        // Format order data
        const formattedOrders = rows.map((order) => ({
          ...order,
          amount: Number.parseFloat(order.amount) || 0,
        }))

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(formattedOrders))
      } catch (error) {
        console.error("Error fetching orders:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching orders", error: error.message }))
      }
    }

    // Update order status
    else if (path === "/api/orders/update-status" && req.method === "POST") {
      const body = await parseBody(req)
      const { orderId, status } = body

      if (!orderId || !status) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Order ID and status are required" }))
        return
      }

      try {
        // Update order status
        await pool.query("UPDATE Orders SET status = ? WHERE order_id = ?", [status, orderId])

        // If status is completed, also update any related transaction
        await pool.query("UPDATE Transaction_History SET status = 'Success' WHERE order_id = ?", [orderId])

        // Get the updated order
        const [updatedOrder] = await pool.query("SELECT * FROM Orders WHERE order_id = ?", [orderId])

        if (updatedOrder.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Order not found after update" }))
          return
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder[0],
          }),
        )
      } catch (error) {
        console.error("Error updating order status:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating order status", error: error.message }))
      }
    }

    // Cancel order
    else if (path === "/api/orders/cancel" && req.method === "POST") {
      const body = await parseBody(req)
      const { orderId, userId, amount, purchaseType, purchaseId, seatId } = body

      if (!orderId || !userId || !amount) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Order ID, user ID, and amount are required" }))
        return
      }

      // Start transaction
      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Get order details to check if it can be cancelled
        const [orderRows] = await connection.query("SELECT * FROM Orders WHERE order_id = ?", [orderId])

        if (orderRows.length === 0) {
          await connection.rollback()
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Order not found" }))
          return
        }

        const order = orderRows[0]

        // Check if order is already cancelled or completed
        if (order.status === "Cancelled" || order.status === "Completed") {
          await connection.rollback()
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: `Order is already ${order.status.toLowerCase()}` }))
          return
        }

        // Update order status to Cancelled
        await connection.query("UPDATE Orders SET status = 'Cancelled' WHERE order_id = ?", [orderId])

        // Refund the amount to user's balance
        await connection.query("UPDATE Users SET balance = balance + ? WHERE user_id = ?", [amount, userId])

        // Create refund transaction record
        await connection.query(
          "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
          [userId, orderId, amount, "Wallet", "Refunded"],
        )

        // If it's a movie ticket, delete the seat record
        if (purchaseType === "Movie" && seatId) {
          // Delete the seat record completely instead of just setting user_id to NULL
          await connection.query("DELETE FROM Movie_Seat WHERE seat_id = ?", [seatId])
          console.log(`Deleted movie seat with ID: ${seatId}`)
        }

        await connection.commit()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ success: true, message: "Order cancelled successfully" }))
      } catch (error) {
        await connection.rollback()
        console.error("Error cancelling order:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error cancelling order", error: error.message }))
      } finally {
        connection.release()
      }
    }

    // Get analytics data for admin
    else if (path === "/api/admin/analytics" && req.method === "GET") {
      try {
        // Get monthly sales data for shop products
        const [shopMonthlySales] = await pool.query(`
          SELECT 
            DATE_FORMAT(th.created_at, '%Y-%m') as month,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          WHERE o.purchase_type = 'Shop' AND o.purchase_id != 0 AND th.status = 'Success'
          GROUP BY DATE_FORMAT(th.created_at, '%Y-%m')
          ORDER BY month
        `)

        // Get product-wise sales data for shop products
        const [shopProductSales] = await pool.query(`
          SELECT 
            s.name as product_name,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          JOIN Shop s ON o.purchase_id = s.item_id
          WHERE o.purchase_type = 'Shop' AND o.purchase_id != 0 AND th.status = 'Success'
          GROUP BY s.name
          ORDER BY total_amount DESC
        `)

        // Get monthly sales data for food products
        const [foodMonthlySales] = await pool.query(`
          SELECT 
            DATE_FORMAT(th.created_at, '%Y-%m') as month,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          WHERE o.purchase_type = 'Food' AND th.status = 'Success'
          GROUP BY DATE_FORMAT(th.created_at, '%Y-%m')
          ORDER BY month
        `)

        // Get food-wise sales data
        const [foodItemSales] = await pool.query(`
          SELECT 
            f.name as food_name,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          JOIN Food f ON o.purchase_id = f.food_id
          WHERE o.purchase_type = 'Food' AND th.status = 'Success'
          GROUP BY f.name
          ORDER BY total_amount DESC
        `)

        // Get monthly sales data for movie tickets
        const [movieMonthlySales] = await pool.query(`
          SELECT 
            DATE_FORMAT(th.created_at, '%Y-%m') as month,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          WHERE o.purchase_type = 'Movie' AND th.status = 'Success'
          GROUP BY DATE_FORMAT(th.created_at, '%Y-%m')
          ORDER BY month
        `)

        // Get movie-wise sales data
        const [movieSales] = await pool.query(`
          SELECT 
            m.name as movie_name,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          JOIN Movies m ON o.purchase_id = m.movie_id
          WHERE o.purchase_type = 'Movie' AND th.status = 'Success'
          GROUP BY m.name
          ORDER BY total_amount DESC
        `)

        // Get deposit funds data
        const [depositFunds] = await pool.query(`
          SELECT 
            DATE_FORMAT(th.created_at, '%Y-%m') as month,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          WHERE o.purchase_id = 0 AND th.status = 'Success'
          GROUP BY DATE_FORMAT(th.created_at, '%Y-%m')
          ORDER BY month
        `)

        // Get overall sales data for pie chart
        const [overallSales] = await pool.query(`
          SELECT 
            o.purchase_type,
            SUM(th.amount) as total_amount
          FROM Transaction_History th
          JOIN Orders o ON th.order_id = o.order_id
          WHERE th.status = 'Success'
          GROUP BY o.purchase_type
        `)

        // Format the data
        const formatData = (data) => {
          return data.map((item) => ({
            ...item,
            total_amount: Number.parseFloat(item.total_amount) || 0,
          }))
        }

        const analyticsData = {
          shopMonthlySales: formatData(shopMonthlySales),
          shopProductSales: formatData(shopProductSales),
          foodMonthlySales: formatData(foodMonthlySales),
          foodItemSales: formatData(foodItemSales),
          movieMonthlySales: formatData(movieMonthlySales),
          movieSales: formatData(movieSales),
          depositFunds: formatData(depositFunds),
          overallSales: formatData(overallSales),
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(analyticsData))
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching analytics data", error: error.message }))
      }
    }

    // Get user feedbacks
    else if (path === "/api/feedback/user" && req.method === "GET") {
      const userId = query.userId

      if (!userId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User ID is required" }))
        return
      }

      try {
        // Get unresolved feedbacks for the user
        const [rows] = await pool.query(
          `SELECT f.*, 
     CASE 
       WHEN f.category_type = 'Product' THEN (SELECT name FROM Shop WHERE item_id = f.category_id)
       WHEN f.category_type = 'Food' THEN (SELECT name FROM Food WHERE food_id = f.category_id)
       WHEN f.category_type = 'Movie' THEN (SELECT name FROM Movies WHERE movie_id = f.category_id)
     END as item_name
     FROM Feedback f
     WHERE f.user_id = ? 
     ORDER BY f.created_at DESC`,
          [userId],
        )

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(rows))
      } catch (error) {
        console.error("Error fetching user feedbacks:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching user feedbacks", error: error.message }))
      }
    }

    // Submit feedback
    else if (path === "/api/feedback/submit" && req.method === "POST") {
      const body = await parseBody(req)
      const { userId, categoryType, categoryId, description } = body

      if (!userId || !categoryType || !categoryId || !description) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "All fields are required" }))
        return
      }

      try {
        // Check if user exists
        const [userRows] = await pool.query("SELECT * FROM Users WHERE user_id = ?", [userId])

        if (userRows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "User not found" }))
          return
        }

        // Find a transaction history for this user and item
        let historyId = null

        if (categoryType === "Product") {
          const [transactions] = await pool.query(
            `SELECT th.history_id
         FROM Transaction_History th
         JOIN Orders o ON th.order_id = o.order_id
         WHERE th.user_id = ? AND o.purchase_type = 'Shop' AND o.purchase_id = ?
         ORDER BY th.created_at DESC
         LIMIT 1`,
            [userId, categoryId],
          )

          if (transactions.length > 0) {
            historyId = transactions[0].history_id
          }
        } else if (categoryType === "Food") {
          const [transactions] = await pool.query(
            `SELECT th.history_id
         FROM Transaction_History th
         JOIN Orders o ON th.order_id = o.order_id
         WHERE th.user_id = ? AND o.purchase_type = 'Food' AND o.purchase_id = ?
         ORDER BY th.created_at DESC
         LIMIT 1`,
            [userId, categoryId],
          )

          if (transactions.length > 0) {
            historyId = transactions[0].history_id
          }
        } else if (categoryType === "Movie") {
          const [transactions] = await pool.query(
            `SELECT th.history_id
         FROM Transaction_History th
         JOIN Orders o ON th.order_id = o.order_id
         WHERE th.user_id = ? AND o.purchase_type = 'Movie' AND o.purchase_id = ?
         ORDER BY th.created_at DESC
         LIMIT 1`,
            [userId, categoryId],
          )

          if (transactions.length > 0) {
            historyId = transactions[0].history_id
          }
        }

        // If no transaction found, create a dummy one for testing purposes
        if (!historyId) {
          // In a real application, you might want to require a valid transaction
          // For now, we'll create a dummy transaction for testing
          const [orderResult] = await pool.query(
            "INSERT INTO Orders (user_id, purchase_type, purchase_id, amount, status) VALUES (?, ?, ?, ?, ?)",
            [userId, categoryType === "Product" ? "Shop" : categoryType, categoryId, 0, "Completed"],
          )

          const orderId = orderResult.insertId

          const [transactionResult] = await pool.query(
            "INSERT INTO Transaction_History (user_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
            [userId, orderId, 0, "Wallet", "Success"],
          )

          historyId = transactionResult.insertId
        }

        // Get the item name based on category type and ID
        let itemName = ""
        if (categoryType === "Product") {
          const [productRows] = await pool.query("SELECT name FROM Shop WHERE item_id = ?", [categoryId])
          if (productRows.length > 0) {
            itemName = productRows[0].name
          }
        } else if (categoryType === "Food") {
          const [foodRows] = await pool.query("SELECT name FROM Food WHERE food_id = ?", [categoryId])
          if (foodRows.length > 0) {
            itemName = foodRows[0].name
          }
        } else if (categoryType === "Movie") {
          const [movieRows] = await pool.query("SELECT name FROM Movies WHERE movie_id = ?", [categoryId])
          if (movieRows.length > 0) {
            itemName = movieRows[0].name
          }
        }

        // Insert feedback
        const [result] = await pool.query(
          "INSERT INTO Feedback (user_id, history_id, category_type, category_name, description, status) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, historyId, categoryType, itemName, description, "Unresolved"],
        )

        // Insert into Admin_Feedback with default status 'New'
        await pool.query("INSERT INTO Admin_Feedback (feedback_id, status) VALUES (?, ?)", [result.insertId, "New"])

        res.writeHead(201, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            success: true,
            message: "Feedback submitted successfully",
            feedbackId: result.insertId,
          }),
        )
      } catch (error) {
        console.error("Error submitting feedback:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error submitting feedback", error: error.message }))
      }
    }

    // Get new feedbacks for admin
    else if (path === "/api/admin/feedback/new" && req.method === "GET") {
      try {
        const [rows] = await pool.query(
          `SELECT f.*, af.status as admin_status, af.started_at, af.completed_at, u.name as username
       FROM Feedback f
       JOIN Admin_Feedback af ON f.feedback_id = af.feedback_id
       JOIN Users u ON f.user_id = u.user_id
       WHERE af.status = 'New'
       ORDER BY f.created_at DESC`,
        )

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(rows))
      } catch (error) {
        console.error("Error fetching new feedbacks:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching new feedbacks", error: error.message }))
      }
    }

    // Get in-progress feedbacks for admin
    else if (path === "/api/admin/feedback/in-progress" && req.method === "GET") {
      try {
        const [rows] = await pool.query(
          `SELECT f.*, af.status as admin_status, af.started_at, af.completed_at, u.name as username
       FROM Feedback f
       JOIN Admin_Feedback af ON f.feedback_id = af.feedback_id
       JOIN Users u ON f.user_id = u.user_id
       WHERE af.status = 'In Progress'
       ORDER BY af.started_at DESC`,
        )

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(rows))
      } catch (error) {
        console.error("Error fetching in-progress feedbacks:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error fetching in-progress feedbacks", error: error.message }))
      }
    }

    // Start resolving feedback
    else if (path === "/api/admin/feedback/start-resolving" && req.method === "POST") {
      const body = await parseBody(req)
      const { feedbackId } = body

      if (!feedbackId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Feedback ID is required" }))
        return
      }

      try {
        // Update Admin_Feedback status to 'In Progress' and set started_at timestamp
        await pool.query(
          "UPDATE Admin_Feedback SET status = 'In Progress', started_at = CURRENT_TIMESTAMP WHERE feedback_id = ?",
          [feedbackId],
        )

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ success: true, message: "Feedback status updated to In Progress" }))
      } catch (error) {
        console.error("Error updating feedback status:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error updating feedback status", error: error.message }))
      }
    }

    // Mark feedback as resolved
    else if (path === "/api/admin/feedback/resolve" && req.method === "POST") {
      const body = await parseBody(req)
      const { feedbackId } = body

      if (!feedbackId) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Feedback ID is required" }))
        return
      }

      try {
        // Update Admin_Feedback status to 'Resolved' and set completed_at timestamp
        await pool.query(
          "UPDATE Admin_Feedback SET status = 'Resolved', completed_at = CURRENT_TIMESTAMP WHERE feedback_id = ?",
          [feedbackId],
        )

        // Update Feedback status to 'Resolved'
        await pool.query("UPDATE Feedback SET status = 'Resolved' WHERE feedback_id = ?", [feedbackId])

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ success: true, message: "Feedback marked as resolved" }))
      } catch (error) {
        console.error("Error resolving feedback:", error)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Error resolving feedback", error: error.message }))
      }
    }

    // Handle 404
    else {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Not found" }))
    }
  } catch (error) {
    console.error("Server error:", error)
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Internal server error", error: error.message }))
  }
})

// Add this code right before the server.listen() call
// Set up interval to check for expired showtimes every minute
const SHOWTIME_CHECK_INTERVAL = 60000 // 1 minute in milliseconds
setInterval(checkAndRemoveExpiredShowtimes, SHOWTIME_CHECK_INTERVAL)

// Also run it once at server startup
checkAndRemoveExpiredShowtimes().catch((err) => {
  console.error("Error during initial showtime check:", err)
})

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  testConnection()
})

