import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    // Check for GOOGLE_AI_API_KEY as per user's .env.local
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
        console.error("Server Error: GOOGLE_AI_API_KEY is not set in environment variables.")
        return NextResponse.json(
            { error: "Server configuration error: GOOGLE_AI_API_KEY is missing. Please check .env.local and restart the server." },
            { status: 500 }
        )
    }

    console.log("Using Gemini API Key:", apiKey.substring(0, 5) + "...") // Debug log

    const genAI = new GoogleGenerativeAI(apiKey)

    try {
        const { audio, mimeType } = await req.json()

        if (!audio) {
            return NextResponse.json({ error: "No audio data provided" }, { status: 400 })
        }

        // Use model from env or default to gemini-2.0-flash
        const modelName = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash"
        console.log("Using Gemini Model:", modelName)

        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        })

        const prompt = `
      Analyze this voice request for disaster relief assistance. 
      
      If the audio is too quiet, unclear, noisy, or does not contain a valid request, return a JSON object with a single key "error" set to "unintelligible".

      Otherwise, extract the following information into a JSON object:
      - title: A short summary of the request (e.g., "Cần lương thực tại Quận 1").
      - description: A detailed description of the situation, including number of people if mentioned.
      - address: The specific address mentioned.
      - urgency: A number from 0 (Low) to 3 (Critical/Life-threatening).
      - contact: The phone number if mentioned.
      
      If any field is missing, leave it as an empty string or 1 for urgency.
    `

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType || "audio/webm",
                    data: audio,
                },
            },
        ])

        const response = await result.response
        const text = response.text()
        console.log("Gemini Raw Response:", text) // Debug log

        // Clean up markdown code blocks if present (just in case, though responseMimeType should handle it)
        const jsonStr = text.replace(/```json\n|\n```/g, "").trim()
        const data = JSON.parse(jsonStr)

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Gemini Analysis Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to analyze audio" },
            { status: 500 }
        )
    }
}
