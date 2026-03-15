import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"
import Product from "../models/Product.js"

dotenv.config()

const router = express.Router()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

router.post("/", async (req, res) => {

  try {

    const { message } = req.body

    console.log("User Question:", message)

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    })

    // Fetch MongoDB Data
    const products = await Product.find({})

    console.log("MongoDB Data:", products)

    if (!products || products.length === 0) {
      return res.json({ reply: "No data found in database" })
    }

    const dbText = products.map(p =>
      `Name:${p.name}, Age:${p.age}, Location:${p.location}, Industry:${p.industry}, Price:${p.price}`
    ).join("\n")

    const prompt = `
You are an AI assistant analyzing a database.

DATABASE:
${dbText}

QUESTION:
${message}

Answer only using the database.
`

    const result = await model.generateContent(prompt)

    const reply = result.response.text()

    res.json({ reply })

  } catch (error) {

    console.error("Gemini Error:", error)

    res.status(500).json({
      reply: "Error contacting AI server"
    })

  }

})

export default router