import { prismaClient } from "@repo/db/client";
import express from "express"
import {CreateRoomSchema} from "@repo/common/types"
import jwt from "jsonwebtoken"
import 'dotenv/config'
import cors from "cors"
import { middleware } from "./middleware";
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import session from "express-session"

const app = express()

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "your-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

app.use(passport.initialize())
app.use(passport.session())

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id: googleId, displayName: name, emails, photos } = profile
    const email = emails?.[0]?.value

    if (!email) {
      return done(new Error("No email found in Google profile"), undefined)
    }

    // Find or create user
    let user = await prismaClient.user.findUnique({
      where: { googleId }
    })

    if (!user) {
      // Check if email already exists (from old system)
      const existingUser = await prismaClient.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        // Update existing user with Google ID
        user = await prismaClient.user.update({
          where: { email },
          data: {
            googleId,
            name: name || existingUser.name,
            image: photos?.[0]?.value || null
          }
        })
      } else {
        // Create new user
        user = await prismaClient.user.create({
          data: {
            googleId,
            email,
            name: name || email.split("@")[0],
            image: photos?.[0]?.value || null
          }
        })
      }
    } else {
      // Update user info in case it changed
      user = await prismaClient.user.update({
        where: { googleId },
        data: {
          name: name || user.name,
          image: photos?.[0]?.value || user.image
        }
      })
    }

    return done(null, user)
  } catch (error) {
    return done(error, undefined)
  }
}))

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prismaClient.user.findUnique({ where: { id } })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Google OAuth routes
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}))

app.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/error`)
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET! || "123123", {
      expiresIn: "7d"
    })

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}`)
  }
)

// Get current user
app.get("/auth/me", middleware, async (req, res) => {
  try {
    const userId = req.userId

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        room: true,
        shapes: true
      }
    })

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      })
    }

    res.json({ user })
  } catch (error) {
    res.status(500).json({
      error: "Internal server error"
    })
  }
})

// Room endpoints
app.post("/room", middleware , async (req, res)=> {
    const validRoom = CreateRoomSchema.safeParse(req.body)

    if(!validRoom.success){
        res.status(400).json({
            error: "Invalid Room Name"
        })
        return;
    }

    const userId = req.userId

    if(!userId){
        res.status(401).json({
            error: "User doesn't exist!"
        })
        return;
    }

    const { roomName } = validRoom.data

    const existingRoom = await prismaClient.room.findFirst({
        where: {
            roomName
        }
    })

    if(existingRoom){
        res.status(409).json({
            error: "Room already exists!"
        })
        return;
    }

    const room = await prismaClient.room.create({
        data: {
            roomName,
            userId
        }
    })

    res.json({
        room
    })
})

app.get("/room/:roomName", async (req, res)=> {
    const roomName = req.params.roomName

    const room = await prismaClient.room.findFirst({
        where:{
            roomName
        },
        include: {
            shape: true
        }
    })

    res.json({
        room
    })
})

// Legacy /user endpoint for compatibility
app.get("/user", middleware , async (req, res)=>{
    const userId = req.userId

    const user = await prismaClient.user.findUnique({
        where:{
            id: userId
        },
        select:{
            id: true,
            email: true,
            name: true,
            image: true,
            room: true,
            shapes: true
        }
    })

    res.json({
        user
    })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{
    console.log(`HTTP Server listening on port ${PORT}`)
})
