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

    var date = new Date().toISOString();
    date = date.slice(0, 10);

    const response = await openai.chat.completions.create({
        model : "meta-llama/llama-3.1-8b-instruct",
        messages : [
            {
                role : "developer",
                content : `In the following text what is the task I am asked to do, what are the key things that I can take out from the following text : ${text}
                
                if asked for date respond in the date structure DD/MM/YYYY on the basis of current date : ${date}
                
                Response in the form of json and key value for example : 
                {
                "task": "Set a reminder for a meeting",
                "date" : "12/01/2025",
                "time" : "12:00pm"
                }
                remember there can be other keys too, this was just for example, add as many keys as you want like name, location, people, time range etc.

                STRICT RULES:
                Do not provide any extra information
                Do not give any new punctuation marks or slash or new line or any kind of symbol
                Directly provide the response in the given format as above
                Do not add anything extra
                `

            }
        ]
    })

    console.log(JSON.parse(response.choices[0].message.content));
    console.log(date.slice(0, 10));
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

generateRelation("Set a reminder for tomorrow's meeting with AMC motors on 12:00 pm")