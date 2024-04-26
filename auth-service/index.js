const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/carsDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

// Define a schema for users
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // username field is unique
    password: String
});

// Define a model based on the schema
const User = mongoose.model('User', userSchema);

const secretKey = 'your_secret_key';

// Endpoint for registering a user
app.post('/auth/register', async (req, res) => {
    try {
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        // Handle errors during registration
        if (err.code === 11000) {
            res.status(400).send('Username already exists');
        } else {
            res.status(500).send('Failed to register user');
        }
    }
});

// Endpoint for user login and generating JWT token
app.post('/auth/login', async (req, res) => {
    try {
        // Find the user by username in the database
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send('Cannot find user');
        }
        // Compare the provided password with the hashed password stored in the database
        if (await bcrypt.compare(req.body.password, user.password)) {
            // If the passwords match, generate and send a JWT token
            const accessToken = jwt.sign({ username: user.username }, secretKey);
            res.json({ accessToken: accessToken });
        } else {
            // If the passwords don't match, send an error response
            res.status(401).send('Incorrect password');
        }
    } catch {
        // Handle errors during login
        res.status(500).send('Internal server error');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Authentication microservice is running on port ${PORT}`);
});
