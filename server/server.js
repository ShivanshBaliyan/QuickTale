import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt, { hash } from 'bcryptjs';
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

// Importing the schema
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';

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

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token == null) {
    return res.status(401).json({ error: "No access token" })
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if(err) {
      return res.status(403).json({ error: "Invalid access token" });
    }

    req.user = user.id;
    next();

  })
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

// Google authentication route
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
        personal_info: { fullname: name, email, username },
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

// Get latest blogs
server.post('/latest-blogs', (req, res) => {
  let { page } = req.body;

  let maxLimit = 5;

  Blog.find({ draft: false })
  .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
  .sort({ "publishedAt": -1 })
  .select("blog_id title des banner activity tags publishedAt -_id")
  .skip((page - 1) * maxLimit)
  .limit(maxLimit)
  .then(blogs => {
    return res.status(200).json({ blogs })
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });
  })

})

// all latest blogs count
server.post('/all-latest-blogs-count', (req, res) => {
  Blog.countDocuments({ draft: false })
  .then(count => {
    return res.status(200).json({ totalDocs: count })
  })
  .catch(err => {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  })

})

// Trending blogs
server.get('/trending-blogs', (req, res) => {
  Blog.find({ draft: false })
  .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
  .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
  .select("blog_id title publishedAt -_id")
  .limit(5)
  .then(blogs => {
    return res.status(200).json({ blogs })
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });
  })
})

// escape helper
function escapeRegExp(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// search blogs
server.post('/search-blogs', async (req, res) => {
  // console.log('[SERVER] /search-blogs body ->', req.body);

  let { tag, query, page = 1, author } = req.body;
  let findQuery = { draft: false };

  if (tag) {
    findQuery.tags = tag;
  } else if (query) {
    const safe = escapeRegExp(query);
    // match title (regex) OR tags array (case-insensitive exact match)
    findQuery = {
      draft: false,
      $or: [
        { title: new RegExp(safe, 'i') },
        { tags: { $in: [ new RegExp(`^${safe}$`, 'i') ] } }
      ]
    };
  }
  else if (author) {
    // Check if author is a valid ObjectId (MongoDB ID) or username
    if (mongoose.Types.ObjectId.isValid(author)) {
      // author is already a user ID
      findQuery.author = author;
    } else {
      // author is a username, find user by username
      const user = await User.findOne({ "personal_info.username": author }).select("_id");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      findQuery.author = user._id;
    }
  }

  let maxLimit = 5;

  Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
      // console.log('[SERVER] /search-blogs returning count ->', Array.isArray(blogs) ? blogs.length : 0);
      return res.status(200).json({ blogs });
    })
    .catch(err => {
      // console.error('[SERVER] /search-blogs error ->', err.message);
      return res.status(500).json({ error: err.message });
    });
});

// search blogs count
server.post('/search-blogs-count', async (req, res) => {
  let { tag, query, author } = req.body;
  let findQuery = { draft: false };

  if (tag) {
    findQuery.tags = tag;
  } else if (query) {
    const safe = escapeRegExp(query);
    findQuery = {
      draft: false,
      $or: [
        { title: new RegExp(safe, 'i') },
        { tags: { $in: [ new RegExp(`^${safe}$`, 'i') ] } }
      ]
    };
  } else if (author) {
    // Check if author is a valid ObjectId (MongoDB ID) or username
    if (mongoose.Types.ObjectId.isValid(author)) {
      // author is already a user ID
      findQuery.author = author;
    } else {
      // author is a username, find user by username
      const user = await User.findOne({ "personal_info.username": author }).select("_id");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      findQuery.author = user._id;
    }
  }

  Blog.countDocuments(findQuery)
    .then(count => res.status(200).json({ totalDocs: count }))
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// search users
server.post('/search-users', (req, res) => {
  
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(escapeRegExp(query), 'i') })
  .limit(50)
  .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
  .then(users => {
    return res.status(200).json({ users });
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });
  })

})

// user profile
server.post('/get-profile', (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
  .select("-google_auth -updatedAt -blogs -personal_info.password")
  .then(user => {
    // console.log("Sending user profile:", user);
    return res.status(200).json({ user });
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });
  })

})

// create blog route
server.post("/create-blog", verifyJWT , (req, res) => {
  let authorId = req.user;

  let { title, des, banner, tags, content, draft } = req.body;
  
  if(!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if(!draft) {
    if(!des || des.length>200) {
      return res.status(400).json({ error: "Description is required and should be less than 200 characters" });
    } 

    if(!banner) {
      return res.status(400).json({ error: "Banner image is required" });
    }

    if(!content.blocks || content.blocks.length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    if(!tags || tags.length > 10 || tags.length < 1) {
      return res.status(400).json({ error: "At least one tag is required. Maximum 10 tags are allowed." });
    }
  }

  tags = tags.map(tag => tag.toLowerCase());

  let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();
  
  let blog = new Blog({
    title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
  })

  blog.save().then(blog => {
    let incrementVal = draft ? 0 : 1;
    
    User.findOneAndUpdate({ _id: authorId }, { $inc: { "account.info.total_posts" : incrementVal }, $push : { "blogs": blog._id } })
    .then(user => {
      return res.status(200).json({ id: blog.blog_id })
    })
    .catch(err => {
      return res.status(500).json({ error: "Failed to update total posts number" });
    })
  })
  .catch(err => { 
    return res.status(500).json({ error: err.message });
  })
  
})

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});