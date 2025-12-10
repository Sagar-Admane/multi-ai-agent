import OpenAI from "openai"
import env from "dotenv"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
env.config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})

async function generateRelation(text){
    try {
        const response = await openai.chat.completions.create({
            model : "tngtech/deepseek-r1t2-chimera:free",
            messages : [
                {
                    role : "user",
                    content : `In the below text based on who i am referring to determine the name of the referred person : ${text}
                    Rules - 
                    Do not add anything extra
                    Do not add any extra symbol
                    Just share the name in the response`
                }
            ]
        })

        console.log(response.choices[0].message.content);
    } catch (error) {
        console.log(error)
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

generateRelation("My mother's name is Madhuri")