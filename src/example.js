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
        //A/c X2700 credited with Rs. 20.00 on 16-Dec-25 from JITENDER RANA RRN: 115725617997 -Bank of Maharashtra (Incoming - AX-MAHABK-S )

        const response =  await openai.chat.completions.create({
            model : "meta-llama/llama-3.1-8b-instruct",
            messages : [
                {
                    role : "assistant",
                    content : `I am providing you with the text you have to respond with the output in the following format : 
                    {
                        type : "string" -> credited/debited,
                        amount : integer,
                        date : "date",
                        merchant : "string" -> name of to whom money is sent or who has sent the money,
                        bankName : "string"
                    } 
                        Now on the basis of text give me response in above json structure : ${text}
                        ONLY RESPOND WITH THE JSON NOT ANY EXTRA INFORMATION OR BACKSLASH OR NEWLINE ETC`,   
                }
            ]
        })

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

getBankStatementParser("A/c X2700 credited with Rs. 20.00 on 16-Dec-25 from JITENDER RANA RRN: 115725617997 -Bank of Maharashtra (Incoming - AX-MAHABK-S )");