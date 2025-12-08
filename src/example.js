import OpenAI from "openai"
import env from "dotenv"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
env.config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})


export async function generateEmbeddings(text){
    try {
        const response = await openai.embeddings.create({
            model : "text-embedding-3-small",
            input : text
        })

        console.log(response.data[0].embedding);
        return response.data[0].embedding;
    } catch (error) {
        console.log(error)
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

generateEmbeddings("I have completed learning half of my syllabus")