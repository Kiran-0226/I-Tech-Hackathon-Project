import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

router.post("/", async (req, res) => {

  const { message } = req.body

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    })

    const result = await model.generateContent(message)

    const response = result.response
    const reply = response.text()

    res.json({ reply })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      reply: "Error generating response"
    })

  }

})

export default router