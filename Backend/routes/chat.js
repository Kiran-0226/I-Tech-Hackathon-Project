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

    if (!message) {
      return res.json({ reply: "Please enter a question." })
    }

    console.log("User Question:", message)

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    })

    // Fetch MongoDB data
    const products = await Product.find({}).limit(50)

    let dbText = "No records found"

    if (products && products.length > 0) {
      dbText = JSON.stringify(products, null, 2)
    }

    const prompt = `
You are an intelligent AI assistant.

You have two sources of knowledge:
1. DATABASE records
2. Your GENERAL KNOWLEDGE

DATABASE:
${dbText}

Instructions:
- If the user's question relates to the database (name, age, location, industry, price), answer using the database.
- If the question is general (history, politics, science, etc.), answer using your general knowledge.
- If the user asks about database information that does not exist, respond: "No matching data found in database."

USER QUESTION:
${message}

Answer clearly and concisely.
`

    const result = await model.generateContent(prompt)

    const reply = result.response.text()

    res.json({ reply })

  } catch (error) {

    console.error("Gemini Error:", error)

    if (error.status === 429) {
      return res.json({
        reply: "AI request limit reached. Please try again later."
      })
    }

    res.status(500).json({
      reply: "Error contacting AI server"
    })

  }

})

export default router