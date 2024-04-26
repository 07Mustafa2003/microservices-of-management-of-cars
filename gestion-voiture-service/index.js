const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/carsDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

// Define a schema for cars
const carSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    availability: { type: Boolean, default: true } // Default availability to true
});

// Define a model based on the schema
const Car = mongoose.model('Car', carSchema);

// Middleware to authenticate the user
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    // Verify JWT token
    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Endpoint for adding cars
app.post('/cars', authenticateToken, async (req, res) => {
    const { brand, model } = req.body;
    try {
        // Create a new car instance
        const car = new Car({ brand, model });
        // Save the car to the database
        await car.save();
        res.status(201).send('Car added successfully');
    } catch (err) {
        res.status(500).send(err.message || 'Error adding car');
    }
});

// Endpoint for deleting cars
app.delete('/cars/:id', authenticateToken, async (req, res) => {
    try {
        // Find and delete the car by ID
        await Car.findByIdAndDelete(req.params.id);
        res.send('Car deleted successfully');
    } catch (err) {
        res.status(500).send(err.message || 'Error deleting car');
    }
});

// Endpoint for updating car availability
app.put('/cars/:id/availability', authenticateToken, async (req, res) => {
    try {
        // Find and update the car's availability
        const car = await Car.findByIdAndUpdate(req.params.id, { availability: req.body.availability }, { new: true });
        if (!car) {
            return res.status(404).send('Car not found');
        }
        res.send('Car availability updated successfully');
    } catch (err) {
        res.status(500).send(err.message || 'Error updating car availability');
    }
});

// Endpoint for checking car availability
app.get('/cars/:id/availability', authenticateToken, async (req, res) => {
    try {
        // Find the car by ID and send its availability
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).send('Car not found');
        }
        res.send(car.availability.toString()); // Convert to string for response
    } catch (err) {
        res.status(500).send(err.message || 'Error retrieving car availability');
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
