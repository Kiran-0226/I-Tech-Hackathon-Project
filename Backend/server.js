import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

import chatRoute from "./routes/chat.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

async function startServer() {

  try {

    await mongoose.connect(process.env.MONGO_URI)

    console.log("MongoDB Connected")

    app.use("/api/chat", chatRoute)

    app.get("/", (req, res) => {
      res.send("API is running")
    })

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

  } catch (error) {

    console.error("MongoDB connection error:", error)

  }

}

startServer()