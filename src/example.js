import OpenAI from "openai"
import env from "dotenv"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
env.config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})
export async function getBankStatementParser(text) {
    try {
        var date = new Date();
        const response = await openai.chat.completions.create({
  model: "meta-llama/llama-3.1-8b-instruct",
  messages: [
    {
      role: "system",
      content: `
You are a strict JSON generator.

Rules:
- Output ONLY valid minified JSON
- No extra text, no explanations
- No backticks
- No newlines
- No comments
- No trailing commas

JSON schema:
{"type":"credited|debited","amount":number,"date":"string","merchant":"string","bankName":"string"}

Date rules:
- today = current date
- tomorrow = current date + 1
- next week = +7 days
- next month = last day of next month
- end of month = last day of current month
- in X days = add X days
- ambiguous = "none"
`
    },
    {
      role: "user",
      content: `Text: ${text}\nCurrent date: ${date}`
    }
  ]
});


        const valjson = cleanJSON(response.choices[0].message.content);
        const valid = JSON.parse(valjson);              
        console.log(valid);
        return valid;
    } catch (error) {
        console.log(error)
        return error;
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

getBankStatementParser("I spend 20 rs on tea today from my main account");