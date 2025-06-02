// import express from 'express';
// import mongoose from 'mongoose';
// import 'dotenv/config'

// const server = express()
// let PORT = 3000;

// server.use(express.json())

// mongoose.connect(process.env.DB_LOCATION, {
//     autoIndex:  true
// })


// server.post("/signup", (req, res) => {
//     console.log(req.body)

//     let { fullname, email, password } = req.body;

//     if (!fullname || fullname.length < 3) {
//         return res.status(403).json({ error: "Fullname must be at least 3 letters long" });
//     }
    
//     if (typeof email !== "string" || email.trim() === "") {
//         return res.status(403).json({ error: "Email is required" });
//     }

//     return res.status(200).json({ status: "okay" });
// });


// server.listen(PORT, () => {
//     console.log('listening the port -> ' + PORT)
// })





// server.js
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

const server = express();
server.use(express.json()); // ✅ Important for parsing JSON bodies
const PORT = process.env.PORT || 3000;

// Middleware
server.use((req, res, next) => {
  console.log('Raw request body:', req.body);
  next();
});

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// Route for user signup
// ...existing code...
server.post("/signup", (req, res) => {
  try {
    console.log("Received signup request:", req.body);
    
    const { fullname, email, password } = req.body;

    // Fullname validation
    if (!fullname || typeof fullname !== "string") {
      return res.status(400).json({ error: "Fullname is required" });
    }
    if (fullname.trim().length < 3) {
      return res.status(400).json({ error: "Fullname must be at least 3 letters long" });
    }

    // Email validation
    if (!email || typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({ error: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // Password validation
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // All validations passed
    return res.status(200).json({ 
      status: "success", 
      message: "User validation successful" 
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// ...existing code...

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});