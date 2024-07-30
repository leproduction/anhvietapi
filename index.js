const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const RegisterModel = require('./Register');

const app = express();

app.use(cors({
    origin: "https://anhviet.vercel.app",
    methods: ["POST", "GET"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // For legacy browser support
}));

app.use(express.json());

mongoose.connect('mongodb+srv://portfolio:port@portfolio.rsdq3hc.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("Network Error", error);
    });

app.post('/submit', (req, res) => {
    const { name, email, tel, note } = req.body;
    console.log("Received submit request:", req.body);

    RegisterModel.findOne({ email: email })
        .then(user => {
            if (user) {
                console.log("Email already submitted:", email);
                res.json("Already submitted");
            } else {
                RegisterModel.create({ name, email, tel, note })
                    .then(result => {
                        console.log("New record created:", result);
                        res.json(result);
                    })
                    .catch(err => {
                        console.error("Error creating record:", err);
                        res.status(500).json({ message: "Error creating record", error: err.message });
                    });
            }
        })
        .catch(err => {
            console.error("Database error:", err);
            res.status(500).json({ message: "Database Error", error: err.message });
        });
});

app.post('/signup', async (req, res) => {
    const { name, email, tel, password } = req.body;
    console.log("Received signup request:", req.body);

    try {
        const existingUser = await RegisterModel.findOne({ email });
        if (existingUser) {
            console.log("User already exists with email:", email);
            return res.status(400).json({ message: "User already exists" });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new RegisterModel({ name, email, tel, password: hashedPassword });
            await newUser.save();
            console.log("New user created:", newUser);
            return res.status(201).json(newUser);
        }
    } catch (err) {
        console.error("Error during signup:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    console.log("Received signin request:", req.body);

    try {
        const existingUser = await RegisterModel.findOne({ email });
        if (existingUser) {
            const matchedPassword = await bcrypt.compare(password, existingUser.password);
            if (matchedPassword) {
                console.log("Verified Password");
                res.status(200).json("Sign in successfully");
            } else {
                console.log("Incorrect Password");
                res.status(401).json("Incorrect Password");
            }
        } else {
            console.log("User is not Found");
            res.status(404).json("User is not Found");
        }
    } catch (error) {
        console.error("Error during sign-in:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.post('/admin', async (req, res) => {
    const { email, password } = req.body;
    console.log("Received admin signin request:", req.body);

    try {
        const existingUser = await RegisterModel.findOne({ email: 'admin@gmail.com' });
        if (existingUser) {
            const matchedPassword = await bcrypt.compare(password, existingUser.password);
            if (matchedPassword) {
                console.log("Verified Password");
                res.status(200).json("Sign in successfully");
            } else {
                console.log("Incorrect Password");
                res.status(401).json("Incorrect Password");
            }
        } else {
            console.log("User is not Found");
            res.status(404).json("User is not Found");
        }
    } catch (error) {
        console.error("Error during admin sign-in:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await RegisterModel.find();
        res.json(users);
        console.log(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.listen(3002, () => {
    console.log("Server is Running on port 3002");
});
