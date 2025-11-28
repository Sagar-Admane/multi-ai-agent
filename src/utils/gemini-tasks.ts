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

    const response1 = await generateText({
        model : google("gemini-2.0-flash"),
        prompt : `Claasify the following text based on the categories I am providing. If none of them matched give me the category. Do remeber to provide the response in single word : 
        text : ${text},
        categories : profile, preference, goal, habit, task, knowledge, health, finance, schedule, episodic, relationship, other`
    })

    return {
        tags : response.text,
        category : response1.text
    };
}

export async function generateEmbeddings(text: string) : Promise<number[]>{
    try {

        const {embedding} = await embed({
            model : google.textEmbeddingModel("text-embedding-004"),
            value : text
        })

        return embedding;

    } catch (error) {
        console.log("Error while generating the embedding");
        return [];
    }
}


export async function generateAIRespone(text: string){
    try {
        const response = await generateText({
            model: google("gemini-2.0-flash"),
            prompt : `Give me a simple no further moving conversational response for the following text : ${text}`
        })

        return response.text;
    } catch (error) {
        return error;
    }
}

export async function generateImportanceScore(text : string) : Promise<number> {
    try {
        const response = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : `
                Rate the importance of this memory on a scale of 1-5:
                1 = unimportant
                5 = critical / permanent

                Memory: "${text}"

                Remember to return only the number (1-5).`
        })

        return parseInt(response.text);

    } catch (error) {
        return 0;
    }
}