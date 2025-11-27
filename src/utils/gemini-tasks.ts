import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
const google = createGoogleGenerativeAI({
    apiKey : process.env.GEMINI_API_KEY 
})


export async function generateTasks(text : string){
    const response = await generateText({
        model : google("gemini-2.0-flash"),
        prompt : `Extract 3-5 concise keywords from this text, as an array of strings : ${text} `
    })

    return response.text;
}