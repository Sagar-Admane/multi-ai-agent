import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, generateText } from "ai";
import env from "dotenv"

env.config()

const google = createGoogleGenerativeAI({
    apiKey : process.env.GEMINI_API_KEY 
})

export async function generateGoalProgress(text){

    const prompt = `You are a progress analyzer. Based on the user's progress update text, estimate the percentage of goal completion from 0 to 100.

Rules:
- Output ONLY a single number between 0 and 100.
- No explanation, no percent sign, no additional text.
- If the text includes explicit fractions (like 3/10), convert to percentage (3/10 → 30).
- If the text includes explicit percentages (like 40%), return that number.
- If the text includes quantitative updates (like “solved 5 more problems”), estimate moderately (e.g., +5–10%).
- If the text indicates major milestones (e.g. "halfway done", "midway"), return around 50.
- If the user says “completed”, “finished”, “done”, return 100.
- If the user says “barely made progress”, “little progress”, “slow progress”, return between 5 and 20.
- If the user says they missed the task today or did nothing, return 0–5.
- If the progress cannot be determined, estimate a reasonable value based on tone.

Return only one number.

User update: "${text}"
`

    try {
        const response = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : prompt
        })
        console.log(parseInt(response.text))
        return response.text;
    } catch (error) {
        return 0
    }
}

generateGoalProgress("I have learnt dsa and finished only array from my whole dsa syllabus");