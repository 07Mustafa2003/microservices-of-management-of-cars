const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // For JWT management
const cors = require("cors");
const Location = require("./Location"); // Import the location model
const verifyCarAvailability = require("./VerifyCarAvailability"); // Car availability verification service

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/CarsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("CarsDB connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse requests as JSON

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing token." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = decoded; // Store token information in the request
    next(); // Move to the next middleware or route
  });
};

// Route to add a rental, protected by JWT middleware
app.post("/rentals", authenticateToken, async (req, res) => {
  const { carId, customerName, startDate, endDate, price } = req.body;

  try {
    // Check if the car is available before adding the rental
    const carAvailable = await verifyCarAvailability(carId);

    if (!carAvailable) {
      return res.status(400).json({ message: "The car is not available." });
    }

    // Create a new rental
    const newRental = new Location({
      carId,
      customerName,
      startDate,
      endDate,
      price,
    });

    // Save the rental to the database
    await newRental.save();

    res.status(201).json({ message: "Rental added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error adding rental.", error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Gestion-Location is running on port ${PORT}`);
});


/*const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const secretKey = 'your_secret_key';
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let rentalsCollection;
let carsCollection;

// Connect to MongoDB
client.connect((err) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');

    // Set up collections for rentals and cars
    const db = client.db('carsDB');
    rentalsCollection = db.collection('rentals');
    carsCollection = db.collection('cars');
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    // Verify the JWT token
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Middleware to check car availability
async function checkCarAvailability(req, res, next) {
    try {
        // Get the carId from the request body
        const carId = req.body.carId;
        // Find the car in the database
        const car = await carsCollection.findOne({ _id: carId });
        // Check if the car exists and is available
        if (!car || !car.availability) {
            return res.status(400).send('Car not available');
        }
        next(); // Move to the next middleware or route handler
    } catch (err) {
        console.error('Error checking car availability:', err);
        res.status(500).send('Error checking car availability');
    }
}

// Route to add a rental
app.post('/rentals', authenticateToken, checkCarAvailability, async (req, res) => {
    try {
        // Create a rental object from the request body
        const rental = req.body;
        // Insert the rental into the rentals collection
        const result = await rentalsCollection.insertOne(rental);
        res.status(201).send('Rental added successfully');
    } catch (err) {
        console.error('Error adding rental:', err);
        res.status(500).send('Error adding rental');
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
*/

