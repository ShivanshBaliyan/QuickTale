import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt, { hash } from 'bcryptjs';
import User from './Schema/User.js';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';


const server = express();
server.use(express.json());
const PORT = process.env.PORT || 3000;

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

const formatDatatoSend = (user) => {

  const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname
  }
}

//Generate unique usename based on email
const generateUsername = async (email) => {
  let username = email.split('@')[0];
  let userExists = await User.exists({ 'personal_info.username': username }).then((result) => result)
  userExists ? username += nanoid(5) : "";
  return username;
}

// Route for user signup
server.post("/signup", (req, res) => {
  try {
    // console.log("Received signup request:", req.body);
    
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
    bcrypt.hash(password, 10, async (err, hashed_password) => {
      
      let username = await generateUsername(email);

      let user = new User({
        personal_info: {  fullname, email,  password: hashed_password,  username}
      })

      user.save().then((u) => {
        const userObj = u.toObject ? u.toObject() : u;
        return res.status(200).json(formatDatatoSend(userObj));
      })
      .catch(err => {
        if(err.code === 11000) {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message || "Internal server error" });
      })
      
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// signin route
server.post("/signin", (req, res) => {
  let {email, password} = req.body; 
  User.findOne({ "personal_info.email": email })
  .then((user) => {
    if(!user) {
      return res.status(403).json({ "error" : "Email not found"});
    }
    
    bcrypt.compare(password, user.personal_info.password, (err, result) => {
      if(err) {
        return res.json({ "error" : "Error Occured while login please try again"})
      }

      if(!result) {
        return res.status(403).json({ Error : "Incorrect Password"})
      }else{
        return res.status(200).json(formatDatatoSend(user))
      }

    })

  })
  .catch(err => {
    return res.status(500).json({ "error" : err.message })
  })
})

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});