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
      model: "gemini-flash-latest"
    })

    // Fetch MongoDB data
    const products = await Product.find({}).limit(50)

    let dbText = "No records found"

    if (products && products.length > 0) {
      dbText = JSON.stringify(products, null, 2)
    }

    const prompt = `
You are an intelligent AI assistant. 

SOURCE DATA:
DATABASE Records: ${dbText}
YOUR KNOWLEDGE: Use your general knowledge for all other questions.

INSTRUCTIONS:
1. If the user asks for a chart (bar, pie, line), you MUST include a JSON block in your response:
   { "chart": { "type": "bar|pie|line", "labels": ["label1", "label2"], "values": [10, 20] } }
2. If the user asks for a diagram or flowchart, you MUST include a JSON block in your response:
   { "diagram": "mermaid syntax here" }
3. You can provide a text explanation along with the JSON.
4. If it's a general question, just answer normally.

USER QUESTION: ${message}
`

    const result = await model.generateContent(prompt)
    let reply = result.response.text().trim()
    console.log("AI Reply received, length:", reply.length)


    try {
      // Robust JSON extraction - find the first { } block that contains "chart" or "diagram"
      const jsonRegex = /\{[\s\S]*?\}/g;
      let match;
      while ((match = jsonRegex.exec(reply)) !== null) {
        try {
          const jsonResponse = JSON.parse(match[0]);
          if (jsonResponse.chart || jsonResponse.diagram) {
            console.log("Extracted Visualization JSON:", jsonResponse);
            return res.json(jsonResponse);
          }
        } catch (e) {
          // Continue searching if this block isn't valid JSON
        }
      }

      // 2. If it's a raw mermaid block
      const mermaidMatch = reply.match(/```mermaid\n([\s\S]*?)```/);
      if (mermaidMatch) {
        return res.json({ diagram: mermaidMatch[1].trim() });
      }

    } catch (e) {
      console.log("Could not parse visualization data from reply.");
    }

    res.json({ reply })




  } catch (error) {


    console.error("Gemini Error:", error)

    if (error.status === 429) {
      console.error("❌ Quota Exceeded (429):", error.message)
      return res.json({
        reply: "AI request limit reached. This is likely due to your Google AI Studio quota. Please try again in a few minutes or check your API key status."
      })
    }

    res.status(500).json({
      reply: "Error contacting AI server"
    })

  }

})

export default router