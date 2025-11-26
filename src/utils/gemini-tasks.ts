// import {GoogleGenAI} from "@google/genai"
// import env from "dotenv"

// env.config({
//     path : "../.env"
// })

// const ai = new GoogleGenAI({apiKey : process.env.GEMIN_API_KEY || "AIzaSyDeb9vgImtXz4cY7eWfmh-TzYyyFvXYZ38"})

// export async function generateTasks(text : string){
//     const response = await ai.models.generateContent({
//         model : "gemini-2.0-flash",
//         contents : `Extract 3-5 concise keywords from this text, as an array of strings : ${text} `
//     })
//     console.log(response.text);
// }


import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import env from "dotenv"

env.config();
const google = createGoogleGenerativeAI({
    apiKey : process.env.GEMINI_API_KEY || ""
})


export async function generateTasks(text : string){
    const response = await generateText({
        model : google("gemini-2.0-flash"),
        prompt : `Extract 3-5 concise keywords from this text, as an array of strings : ${text} `
    })

    return response.text;
}