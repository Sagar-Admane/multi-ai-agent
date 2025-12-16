import OpenAI from "openai"
import env from "dotenv"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
env.config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})

export async function getTheDate(text){

    const prompt = `You are a strict date-range parser.

Your job:
Convert natural language time expressions into an exact date range.

Rules:
- Output ONLY valid minified JSON
- No text, no explanation, no markdown
- No newlines, no backticks
- Use ISO format: YYYY-MM-DD

Output schema:
{"from":"YYYY-MM-DD","to":"YYYY-MM-DD"}

Date interpretation rules:
- "today" = current date
- "yesterday" = current date - 1 day
- "tomorrow" = current date + 1 day
- "last week" = previous 7 days ending yesterday
- "this week" = start of current week to today
- "last month" = first day of previous month to last day of previous month
- "this month" = first day of current month to today
- "from X to Y" = parse both sides
- "since X" = from X to today
- "till today" = from earliest inferred date to today
- explicit dates like "2024-01-15" or "15 Jan 2024" must be parsed
- If only one date is mentioned, assume it is BOTH from and to
- If ambiguous or impossible, return {"from":"none","to":"none"}

Important:
- Always respect the provided current date
- Never guess future dates unless explicitly stated
- Never include time (only date)
`

    try {
        const response = await openai.chat.completions.create({
            model : "meta-llama/llama-3.1-8b-instruct",
            messages : [
                {
                    role : "developer",
                    content : `${prompt}
                    text : ${text},
                    date : ${new Date().toISOString().slice(0,10)}`
                }
            ]
        })

        console.log(response.choices[0].message.content)
    } catch (error) {
        return error
    }
}

function cleanJSON(str) {
    return str
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .trim();
}

// generateEmbeddings("I have completed learning half of my syllabus")

// generateRelation("Set a reminder for tomorrow's meeting with AMC motors on 12:00 pm")

getTheDate("from yesterday to today");