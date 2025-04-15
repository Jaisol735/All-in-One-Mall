CREATE DATABASE MALL;
USE MALL;

-- Users Table (Stores user details and balance)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each user
    name VARCHAR(255) NOT NULL, -- User's full name
    email VARCHAR(255) UNIQUE NOT NULL, -- Unique email for user login
    phone_number VARCHAR(15) NOT NULL, -- Contact number for user verification
    password VARCHAR(255) NOT NULL, -- Encrypted password for authentication
    balance DECIMAL(10,2) DEFAULT 1000.00, -- User's wallet balance for transactions
    reward_points INT DEFAULT 0, -- Points earned through purchases for discounts
    address TEXT NOT NULL, -- User's default delivery address
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Account creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Last update timestamp
);

-- Orders Table (Stores all types of orders: Shop, Food, Movie)
CREATE TABLE Orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- Unique order ID
    user_id INT NOT NULL, -- References the user who placed the order
    purchase_type ENUM('Shop', 'Food', 'Movie') NOT NULL, -- Type of purchase
    purchase_id INT NOT NULL, -- Stores the specific product/food/movie ID
    amount DECIMAL(10,2) NOT NULL, -- Total amount of the order
    status ENUM('Upcoming', 'Pending', 'Completed', 'Cancelled') DEFAULT 'Upcoming', -- Order status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Order creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last status update
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE -- If user is deleted, their orders are also deleted
);

-- Transaction History Table (Logs all payments)
CREATE TABLE Transaction_History (
    history_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique transaction ID
    user_id INT NOT NULL, -- References the user making the payment
    order_id BIGINT NOT NULL, -- References the related order
    amount DECIMAL(10,2) NOT NULL, -- Transaction amount
    payment_method ENUM('Card', 'UPI', 'Wallet', 'Cash') NOT NULL, -- Payment mode used
    status ENUM('Success', 'Failed', 'Refunded') DEFAULT 'Success', -- Payment status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the transaction
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE, -- Deletes transactions when user is removed
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE -- Deletes transaction if order is removed
);
SELECT * FROM Transaction_History;
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique feedback ID
    user_id INT NOT NULL, -- References the user giving feedback
    history_id INT, -- history of the transaction
    category_type ENUM('Food', 'Product', 'Movie') NOT NULL, -- Category type
    category_name VARCHAR(255) NOT NULL, -- name of item
    description TEXT NOT NULL CHECK (CHAR_LENGTH(description) <= 2000), -- Problem description
    status ENUM('Resolved', 'Unresolved') DEFAULT 'Unresolved', -- Feedback status tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when feedback was submitted
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE, -- Cascade delete
    FOREIGN KEY (history_id) REFERENCES Transaction_History(history_id) ON DELETE CASCADE -- Cascade delete
);

CREATE TABLE Admin_Feedback (
    admin_feedback_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID for admin feedback tracking
    feedback_id INT NOT NULL, -- Links to Feedback table
    status ENUM('New', 'In Progress', 'Resolved') DEFAULT 'New', -- Tracks resolution status
    started_at TIMESTAMP DEFAULT NULL, -- Timestamp when status changes to 'In Progress'
    completed_at TIMESTAMP DEFAULT NULL, -- Timestamp when feedback is marked 'Resolved'
    FOREIGN KEY (feedback_id) REFERENCES Feedback(feedback_id) ON DELETE CASCADE -- Ensures dependency with Feedback table
);

CREATE TABLE Shop (
    item_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique product ID
    category ENUM('Electronics', 'Clothing', 'Vehicles') NOT NULL, -- Category of product
    name VARCHAR(255) NOT NULL, -- Product name
    price DECIMAL(10,2) NOT NULL, -- Product price
    stock INT NOT NULL DEFAULT 0, -- Number of units available
    image_url VARCHAR(500) NOT NULL, -- Link to product image
    description TEXT NOT NULL CHECK (CHAR_LENGTH(description) <= 6000), -- Product details (limited to 6000 chars)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Product listing timestamp
);

-- Cart Table (Tracks shopping cart items before checkout)
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique cart item ID
    user_id INT NOT NULL, -- User who added the item
    order_id BIGINT DEFAULT NULL, -- Assigned after checkout
    purchase_type ENUM('Shop', 'Food', 'Movie') NOT NULL, -- Type of purchase
    purchase_id INT NOT NULL, -- References either Shop, Food, or Movie
    seat_id INT DEFAULT NULL, -- Only for movie ticket bookings
    quantity INT NOT NULL DEFAULT 1, -- Quantity of the item
    UNIQUE (user_id, purchase_id, seat_id), -- Prevents duplicate cart entries
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES Shop(item_id) ON DELETE CASCADE, -- Shop reference remains
    FOREIGN KEY (seat_id) REFERENCES Movie_Seat(seat_id) ON DELETE CASCADE -- Seat reference remains
);

-- Food Table (Stores food items from restaurants)
CREATE TABLE Food (
    food_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each food item
    name VARCHAR(255) NOT NULL, -- Name of the food item (e.g., Burger, Pizza)
    category ENUM('Fast Food', 'Beverages', 'Desserts', 'Main Course', 'Snacks') NOT NULL, -- Type of food for filtering and display
    price DECIMAL(10,2) NOT NULL, -- Price per unit (decimal for precise values)
    stock INT NOT NULL DEFAULT 50, -- Available quantity of the food item
    image_url VARCHAR(500) NOT NULL, -- URL of the food item's image for UI display
    description TEXT NOT NULL CHECK (CHAR_LENGTH(description) <= 6000), -- Short description of the food item
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when the food item was added
);

-- Movies Table (Stores available movies)
CREATE TABLE Movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique movie ID
    name VARCHAR(255) NOT NULL, -- Movie name
    description TEXT NOT NULL CHECK (CHAR_LENGTH(description) <= 2500), -- Short description (max 1000 chars)
    available_tickets INT NOT NULL DEFAULT 50, -- Total available tickets
    booked_tickets INT NOT NULL DEFAULT 0, -- Number of tickets booked
    price DECIMAL(10,2) NOT NULL, -- Ticket price
    image_url VARCHAR(500) NOT NULL, -- Poster image link
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp when movie was added
);

-- Showtimes Table (Stores different movie showtimes)
CREATE TABLE Showtimes (
    showtime_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique showtime ID
    movie_id INT NOT NULL, -- References the movie
    show_time DATETIME NOT NULL, -- Date and time of the show
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE -- If movie is deleted, its showtimes are too
);

-- Movie Seat Table (Tracks seat reservations per showtime)
CREATE TABLE Movie_Seat (
    seat_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique seat ID
    showtime_id INT NOT NULL, -- References the specific showtime
    seat_number VARCHAR(3) NOT NULL CHECK (seat_number REGEXP '^[A-E][1-9]$|^[A-E]10$'), -- Seat format (A1 - E10)
    user_id INT DEFAULT NULL, -- Stores user ID when booked
    FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE CASCADE, -- Deletes seats if showtime is removed
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL, -- If user account is deleted, seat remains open
    UNIQUE (showtime_id, seat_number) -- Ensures the same seat is not double-booked
);
DESC Movie_Seat;

DROP TABLE IF EXISTS Admin_Feedback;
DROP TABLE IF EXISTS Feedback;
DROP TABLE IF EXISTS Transaction_History;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS Movie_Seat;
DROP TABLE IF EXISTS Showtimes;
DROP TABLE IF EXISTS Movies;
DROP TABLE IF EXISTS Shop;
DROP TABLE IF EXISTS Food;
DROP TABLE IF EXISTS Users;
INSERT INTO Feedback (user_id, history_id, category_type, category_name, description, status)
VALUES (1, 2, 'Movie', 'Yeh Jawani Heh Diwani', 'The movie experience was not as expected.', 'Unresolved');
SELECT * FROM Feedback;
SELECT * FROM Food;
-- Insert into Admin_Feedback table (linking with the inserted feedback)
INSERT INTO Admin_Feedback (feedback_id, status)
VALUES (LAST_INSERT_ID(), 'New');
-- Shop Table (Stores available products)
UPDATE Users 
SET reward_points = 15 
WHERE user_id = 1;
INSERT INTO Users (name, email, phone_number,password, balance, reward_points, address) 
VALUES ('Jainam', 'solankijainam07@gmail.com', '9136291039','Jaisol@735', 200000.00, 5, '703/A, Landsend Bldg., Lokhandwala Complex Andheri (W), Mumbai, Maharashtra 400053, India');
INSERT INTO Users (name, email, phone_number, password, balance, reward_points, address) 
VALUES ('Aryan', 'aryan.sharma24@gmail.com', '9876543210', 'Ary@9987', 150000.00, 10, '405/B, Sunflower Heights, Powai, Mumbai, Maharashtra 400076, India');
INSERT INTO Users (name, email, phone_number,password, balance, reward_points, address) 
VALUES ('Jainam Solanki', 'jainamsolanki735@gmail.com', '9829826222','12345', 200000.00, 5, 'Shree Krishna Building
45, Marine Lines Road,
Near Metro Cinema,
Mumbai, Maharashtra - 400020,
India.');
SET SQL_SAFE_UPDATES = 0;
UPDATE Users 
SET name = 'Jainam Solanki' 
WHERE name = 'Admin';
SET SQL_SAFE_UPDATES = 0;
DELETE FROM Users WHERE name = 'Sahil';
SELECT * FROM Users;
SELECT * FROM Transaction_History;
INSERT INTO Shop (item_id, category, name, price, stock, image_url, description) VALUES
(1, 'Electronics', 'iPhone', 89999, 10, 
'C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\Iphone.jpg', 
'📱 Apple iPhone (256GB) - E Overview: The Apple iPhone (256GB) is the epitome of cutting-edge technology, featuring the A16 Bionic chip for lightning-fast performance. Apple has consistently set benchmarks in the smartphone industry, and this latest model is no exception. With a sleek aluminum and glass design, robust durability, and an enhanced camera system, this device is ideal for professionals, photographers, and everyday users who demand the best. 

Key Features: 
- 6.7-inch Super Retina XDR Display for crystal-clear visuals. 
- Pro-grade camera system with Night Mode and 8K video recording. 
- Long-lasting battery with fast charging support. 
- 5G-enabled for ultra-fast connectivity. 
- Sleek aluminum & glass design with enhanced durability.'),

(2, 'Electronics', 'Sony TV', 54999.99, 5, 
'C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\Sony_TV.webp', 
'📺 Sony 55-inch 4K Ultra HD Smart LED TV – Overview: The Sony 55-inch 4K Ultra HD Smart LED TV delivers a premium viewing experience with stunning HDR resolution and intelligent features like Google TV and voice control. Whether you are a movie enthusiast, gamer, or casual TV viewer, this television offers an immersive experience with Dolby Atmos and DTS surround sound. 

Key Features: 
- Stunning 4K HDR resolution with X-Reality PRO. 
- Dolby Atmos & DTS surround sound for cinematic audio. 
- Google TV with built-in Chromecast for seamless streaming. 
- Motionflow XR ensures ultra-smooth frame transitions. 
- Energy-efficient design with power-saving mode.'),

(3, 'Vehicles', 'TATA Hexa', 1800000, 2, 
'C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\Tata_Hexa.avif', 
'🚙 TATA Hexa SUV - Overview: The TATA Hexa is a feature-packed 7-seater SUV designed for adventure and luxury. With a powerful 2.2L VARICOR Diesel Engine, premium leather interiors, and an infotainment system that supports Android Auto & Apple CarPlay, this SUV is perfect for long drives and tough terrains. 

Key Features: 
- 2.2L VARICOR Diesel Engine with automatic transmission. 
- Premium leather interior with captain seats. 
- 10-inch infotainment system with Android Auto & Apple CarPlay. 
- 6 airbags, ABS, and ESP for enhanced safety. 
- Off-road mode with all-wheel-drive for challenging terrains.'),

(4, 'Vehicles', 'BMW E7', 8500000, 1, 
'C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\BMW_E7.avif', 
'🚗 BMW E7 Luxury Sedan - Overview: The BMW E7 Luxury Sedan offers an unparalleled driving experience, combining performance, luxury, and cutting-edge technology. With a powerful Twin-Turbo V8 engine, self-parking capabilities, and plush Nappa leather interiors, this sedan is for those who seek prestige and comfort. 

Key Features: 
- 4.4L Twin-Turbo V8 engine with 600 HP. 
- Adaptive LED headlights with laser technology. 
- Intelligent Driving Assistance with self-parking. 
- Plush Nappa leather seats with massage function. 
- Panoramic sunroof with ambient lighting.'),

(5, 'Clothing', 'Black Shirt', 999, 50, 
'C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\B_Tshirt.webp', 
'👕 Premium Men''s Black Shirt – Overview: A wardrobe essential, the premium men black shirt is crafted with high-quality cotton, ensuring breathability and comfort. Designed for both formal and casual wear, this slim-fit shirt complements every occasion with style and elegance. 

Key Features: 
- Made from 100% breathable cotton fabric. 
- Slim-fit design for a modern and stylish look. 
- Wrinkle-resistant & easy-to-maintain material. 
- Available in sizes S to XXL. 
- Perfect for formal and casual wear.'),

(6, 'Clothing', '3 Piece Suit', 6999, 20, 
'C:\\Users\\jaina\\OneDrive\\Desktop\\Jainam\\programs\\Project\\backend\\Images\\Shop\\3PS.jpg', 
'🤵 Classic 3-Piece Suit – Overview: A timeless 3-piece suit perfect for business meetings, weddings, and special occasions. This elegant ensemble includes a blazer, waistcoat, and trousers tailored for a premium fit, ensuring comfort and sophistication. 

Key Features: 
- Includes blazer, waistcoat, and trousers. 
- Tailored fit with high-quality polyester blend fabric. 
- Breathable inner lining for all-day comfort. 
- Available in multiple sizes with custom fitting options. 
- Timeless and elegant design with premium craftsmanship.');

INSERT INTO Movies (name, description, available_tickets, booked_tickets, price, image_url) VALUES
('Yeh Jawani Hai Deewani', 
'Yeh Jawani Hai Deewani is a Bollywood romantic drama directed by Ayan Mukerji, featuring Ranbir Kapoor and Deepika Padukone in lead roles. The film explores love, friendship, self-discovery, and the choices that shape our lives. 
The story follows Kabir "Bunny" Thapar, an ambitious and free-spirited young man who dreams of traveling the world, and Naina Talwar, a studious and introverted medical student. When they meet during a trekking trip to Manali, their lives change forever. Bunny’s infectious energy inspires Naina to embrace life beyond books, while Naina’s warmth makes Bunny experience the beauty of deep connections. However, their paths diverge as Bunny pursues his global dreams, leaving Naina behind. 
Years later, they reunite at their friend’s wedding, reigniting old sparks and bringing unresolved emotions to the surface. As Bunny and Naina navigate love and ambition, they must decide whether their bond is strong enough to overcome their differences.
The film beautifully captures youthful aspirations, heartbreak, and the value of friendship. Featuring stunning cinematography, an unforgettable soundtrack, and powerful performances, Yeh Jawani Hai Deewani remains one of Bollywood’s most beloved films.
', 150, 0, 250, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Movie/YJHD.jpg'),
('3 Idiots', 
'3 Idiots is a heartwarming and thought-provoking comedy-drama directed by Rajkumar Hirani, starring Aamir Khan, R. Madhavan, and Sharman Joshi. The film critiques the pressures of the Indian education system while celebrating friendship, passion, and innovation.
Set in the prestigious Imperial College of Engineering, the film follows three students: Rancho, an intelligent and unconventional thinker; Farhan, a photography enthusiast forced into engineering by parental pressure; and Raju, a nervous student burdened by financial struggles. Rancho’s unique perspective on education, where learning should be about understanding rather than rote memorization, challenges the rigid system enforced by the strict director, Viru Sahastrabuddhe, aka "Virus."
As the story unfolds through flashbacks and present-day sequences, Farhan and Raju set out to find Rancho, who mysteriously disappeared after graduation. Their journey leads to an emotional and surprising revelation that changes their lives forever.
With its humor, emotional depth, and powerful social message, 3 Idiots is an inspiring film that encourages viewers to follow their passion and redefine success. The film remains a cultural phenomenon, influencing students and educators alike.
', 150, 0, 300, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Movie/3-idiots.avif'),
('Fighter', 
'Fighter is a high-octane action thriller featuring Hrithik Roshan and Deepika Padukone in lead roles. Directed by Siddharth Anand, this film takes viewers on an adrenaline-fueled journey through intense combat sequences, breathtaking aerial stunts, and an emotionally gripping storyline.
The film revolves around a team of elite fighter pilots in the Indian Air Force, tasked with defending the nation from an imminent terrorist attack. Squadron Leader Aryan "Fighter" Sharma (Hrithik Roshan) is a fearless and highly skilled pilot known for his unmatched precision and strategic brilliance. His partner, Captain Riya Verma (Deepika Padukone), is a tough, determined officer who has worked her way up in a male-dominated field.
As they embark on a mission to thwart a major security threat, they face personal and professional challenges that test their courage and resilience. The film delves into themes of patriotism, teamwork, and sacrifice while delivering some of the most spectacular aerial dogfights ever seen in Indian cinema.
With stunning cinematography, heart-pounding action sequences, and a gripping narrative, Fighter promises to be a cinematic experience unlike any other.
', 150, 0, 350, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Movie/Fighter.jpg'),
('Dilwale', 
'Dilwale is a Bollywood action-romance directed by Rohit Shetty, starring Shah Rukh Khan, Kajol, Varun Dhawan, and Kriti Sanon. The film blends high-energy action sequences, heartwarming romance, and comedy in a classic Bollywood entertainer.
The story follows Raj (Shah Rukh Khan) and Meera (Kajol), two lovers from rival gangster families who are torn apart by betrayal. Years later, their younger siblings Veer (Varun Dhawan) and Ishita (Kriti Sanon) cross paths, reigniting old wounds and bringing past conflicts back to the surface.
With a mix of thrilling car chases, light-hearted humor, and intense emotional moments, Dilwale is a story of love, redemption, and second chances. The electrifying chemistry between Shah Rukh Khan and Kajol, coupled with stunning visuals and a chart-topping soundtrack, makes this film a must-watch.
Dilwale captures the essence of Bollywood’s grandeur, making it a perfect blend of romance, action, and drama.
', 150, 0, 280, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Movie/Dilwale.jpg'),
('Phir Hera Pheri', 
'Phir Hera Pheri is a comedy sequel directed by Neeraj Vora, featuring the iconic trio of Akshay Kumar, Sunil Shetty, and Paresh Rawal. The film is a hilarious rollercoaster ride packed with unforgettable punchlines, laugh-out-loud moments, and unpredictable twists.
Picking up from where Hera Pheri left off, Raju, Shyam, and Baburao are now living a lavish life after acquiring a large sum of money. However, their greed leads them to a fraudulent investment scheme, leaving them in massive debt. Desperate to recover their fortune, they embark on a series of misadventures involving gangsters, mistaken identities, and side-splitting chaos.
Filled with sharp dialogues, brilliant comic timing, and a fast-paced plot, Phir Hera Pheri is one of the most loved comedy films in Indian cinema. The film continues to be a cult favorite, with its humorous scenes and dialogues still widely quoted by fans.
', 150, 0, 270, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Movie/PHP.jpg'),
('Singham', 
'Singham is an action-packed police drama directed by Rohit Shetty, featuring Ajay Devgn in the lead role. The film is known for its high-octane action sequences, powerful dialogues, and a gripping storyline that highlights corruption and justice.
Bajirao Singham (Ajay Devgn) is an honest and fearless police officer who upholds the law with unwavering dedication. When he is transferred to a city controlled by the corrupt politician and criminal Jaykant Shikre (Prakash Raj), he finds himself facing a powerful adversary who believes he is above the law.
As Singham takes on the corrupt system, he faces immense challenges that test his morals and resilience. With thrilling action sequences, intense confrontations, and a strong message about integrity, Singham is a mass entertainer that showcases the power of righteousness.
Ajay Devgn’s strong screen presence, coupled with Rohit Shetty’s signature action-packed direction, makes Singham a must-watch film for action lovers.
', 150, 0, 290, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Movie/Singham.jpg');

INSERT INTO Showtimes (movie_id, show_time) VALUES
-- Yeh Jawani Hai Deewani Showtimes
(1, '2025-03-12 10:00:00');
INSERT INTO Showtimes (movie_id, show_time) VALUES
-- Yeh Jawani Hai Deewani Showtimes
(1, '2025-04-12 10:00:00'),
(1, '2025-04-13 14:00:00'),
(1, '2025-04-14 18:00:00'),
-- 3 Idiots Showtimes
(2, '2025-04-12 11:00:00'),
(2, '2025-04-13 15:00:00'),
(2, '2025-04-14 19:00:00'),
-- Fighter Showtimes
(3, '2025-04-12 12:00:00'),
(3, '2025-04-13 16:00:00'),
(3, '2025-04-14 20:00:00'),
-- Dilwale Showtimes
(4, '2025-04-12 09:30:00'),
(4, '2025-04-13 13:30:00'),
(4, '2025-04-14 17:30:00'),
-- Phir Hera Pheri Showtimes
(5, '2025-04-12 10:45:00'),
(5, '2025-04-13 14:45:00'),
(5, '2025-04-14 18:45:00'),
-- Singham Showtimes
(6, '2025-04-12 11:15:00'),
(6, '2025-04-13 15:15:00'),
(6, '2025-04-14 19:15:00');

INSERT INTO Food (name, category, price, stock, image_url, description) VALUES
('Pizza', 'Main Course', 299.99, 50, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Food/Pizza.jpg', 'A delicious cheesy pizza with a variety of toppings, baked to perfection.'),
('Burger', 'Fast Food', 149.99, 50, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Food/Burger.webp', 'A juicy burger with a crispy patty, fresh veggies, and special sauce.'),
('Frankie', 'Snacks', 99.99, 50, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Food/Frankie.webp', 'A spicy and tasty roll filled with flavorful stuffing, wrapped in a soft roti.'),
('Grilled Sandwich', 'Snacks', 129.99, 50, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Food/Sandwich.webp', 'A crispy and cheesy grilled sandwich packed with fresh veggies.'),
('Fries', 'Fast Food', 79.99, 50, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Food/Fries.jpg', 'Crispy golden fries, lightly salted and served hot.'),
('Momos', 'Snacks', 109.99, 50, 'C:/Users/jaina/OneDrive/Desktop/Jainam/programs/Project/backend/Images/Food/Momos.jpg', 'Steamed or fried dumplings filled with flavorful stuffing and served with spicy sauce.');
