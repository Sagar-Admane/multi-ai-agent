import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, generateText } from "ai";

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

export async function generateEmbeddings(text: string){
    try {

        const {embedding} = await embed({
            model : google.textEmbeddingModel("text-embedding-004"),
            value : text
        })

        return embedding;

    } catch (error) {
        console.log("Error while generating the embedding")
    }
}