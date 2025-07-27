import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt, { hash } from 'bcryptjs';
import User from './Schema/User.js';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccountKey = require("./quicktale-2d287-firebase-adminsdk-fbsvc-1240e5de82.json");
import { getAuth } from "firebase-admin/auth";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const server = express();
server.use(express.json());
server.use(cors())

const PORT = process.env.PORT || 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
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

// Setting up AWS S3 bucket
const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  const command = new PutObjectCommand({
    Bucket: 'quicktale',
    Key: imageName,
    ContentType: "image/jpeg"
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 1000 })
  return url;
}

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

server.get('/get-upload-url', (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// Route for user signup
server.post("/signup", (req, res) => {
  try {
    
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
    
    if(!user.google_auth) {
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
    }else {
      return res.status(403).json({ "error" : "Account was created using google. Try logging in with google instead" });
    }

  })
  .catch(err => {
    return res.status(500).json({ "error" : err.message })
  })
})

server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  getAuth()
  .verifyIdToken(access_token)
  .then(async (decodedUser) => {
    let { email, name, picture } = decodedUser;

    let profile_img = picture ? picture.replace("s96-c", "s400-c") : undefined;

    let user = await User.findOne({"personal_info.email": email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((user) => {
      return user || null;
    })
    .catch(err => {
      return res.status(500).json({ error: err.message});
    })

    if(user) {
      if(!user.google_auth) {
        return res.status(403).json({ error: "THis email was signed up without google. Please log in with passwoed to access the account"})
      }
    }else {
      let username = await generateUsername(email);

      user = new User({
        personal_info: { fullname: name, email, profile_img, username },
        google_auth: true
      })

      await user.save().then((u) => {
        user = u;
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message})
      })

    }

    return res.status(200).json(formatDatatoSend(user));

  })
  .catch((err) => {
    return res.status(500).json({ error: "Failed to authenticate you with google. Try with some other account" });
  })

})

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});