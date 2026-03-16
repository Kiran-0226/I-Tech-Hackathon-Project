import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

import chatRoute from "./routes/chat.js"

dotenv.config()

const app = express()

/* Middleware */
app.use(cors())
app.use(express.json())

/* Routes */
app.use("/api/chat", chatRoute)

app.get("/", (req, res) => {
  res.send("API is running")
})

const PORT = process.env.PORT || 5000

async function startServer() {

  try {

    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI)

    console.log("✅ MongoDB Connected")

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })

  } catch (error) {

    console.error("❌ MongoDB connection error:", error)
    process.exit(1)

  }

}

startServer()