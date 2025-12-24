import OpenAI from "openai"
import env from "dotenv"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
env.config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})

export async function getMonthAndYear(text){
    try {
        const date = new Date();

        const prompt = `### System:
You are a precise data extraction assistant. Your task is to identify the specific month and year referenced in a user's request based on a provided "Current Date."

### Context:
Current Date: ${date}

### Instructions:
1. Analyze the User Input to determine if they are referring to the current month, a past month, or a future month.
2. If the user uses relative terms like "this month," "last month," or "next month," calculate the result based on the Current Date.
3. Output the result strictly in JSON format with the keys "month" (full name) and "year" (YYYY).
4. If no specific month/year can be determined, return null for both values.

### User Input:
"${text}"

RULES -
Only provide with the month and year no extra information, Use max to max 5 tokens

### Response:`

        const result = await openai.chat.completions.create({
            model : "meta-llama/llama-3.1-8b-instruct",
            messages : [
                {
                    role : "user",
                    content : `${prompt}`
                }
            ]
        })

        console.log(JSON.parse(cleanJSON(result.choices[0].message.content)));
        const res = JSON.parse(cleanJSON(result.choices[0].message.content));
        return res;
    } catch (error) {
        console.log(error);
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

getMonthAndYear("Update this month's budget to 860 rs");