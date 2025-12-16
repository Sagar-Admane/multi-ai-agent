import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, generateText } from "ai";
import OpenAI from "openai";
import cleanJSON from "./utils.js";
import env from "dotenv"
import { error } from "console";

env.config({
    path : "./.env"
});


const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})

export async function generateTasks(text : string){
    const response1 = await openai.chat.completions.create({
        model : "google/gemma-2-9b-it",
        messages : [
            {
                "role" : "user",
                "content" : `Extract 3-5 concise keywords from this text, as an array of strings : ${text} `
            }
        ]
    })

    const response2 = await openai.chat.completions.create({
        model : "google/gemma-2-9b-it",
        messages : [{
            role : "user",
            content : `Claasify the following text based on the categories I am providing. If none of them matched give me the category. Do remeber to provide the response in single word : 
        text : ${text},
        categories : profile, preference, goal, habit, task, knowledge, health, finance, schedule, episodic, relationship, other`
        }]
    })

    const rawJson = response1.choices[0].message.content;
    const cleaned = cleanJSON(rawJson);
    console.log(cleaned)

    const rawJson1 = response2.choices[0].message.content;
    const cleaned1 = cleanJSON(rawJson1);

    return { 
        tags : cleaned,
        category : cleaned1
    }
}


export async function generateEmbeddings(text : string) : Promise<number[]>{
    try {
        const response = await openai.embeddings.create({
            model : "text-embedding-3-small",
            input : text
        })

        console.log(response.data[0].embedding);
        return response.data[0].embedding;
    } catch (error) {
        return []
    }
}

export async function generateAIRespone(text : string){
    try {
        const response = await openai.chat.completions.create({
            model : "google/gemma-2-9b-it",
            messages : [
                {
                    role : "user",
                    content : `Give me a simple no further moving conversational response for the following text : ${text}`
                }
            ]
        })

        const res = response.choices[0].message.content;
        console.log(cleanJSON(res))
        return res;
    } catch (error) {
        console.log(error)
        return error
    }
}

export async function generateImportanceScore(text : string) : Promise<number> {
    try {

        const response = await openai.chat.completions.create({
            model : "google/gemma-2-9b-it",
            messages : [
                {
                    role : "user",
                    content : `
                Rate the importance of this memory on a scale of 1-5:
                1 = unimportant
                5 = critical / permanent

                Memory: "${text}"

                Remember to return only the number (1-5).`
                }
            ]
        })

        console.log(cleanJSON(response.choices[0].message.content));
        const result = cleanJSON(response.choices[0].message.content);
        return parseInt(result);

    } catch (error) {
        return 0;
    }
}


export async function genereateRelationship(text : string){

        const personId = await openai.chat.completions.create({
            model : "google/gemma-2-9b-it",
            messages : [
                {
                    role : "user",
                    content : `Extract the relationship of the main subject in the text with the user (Sagar).

Rules:
- If the subject refers to: I, me, my, mine, myself, Sagar → return: "user"
- If the text mentions a specific relationship (mom, mother, dad, father, brother, sister,
  friend, cousin, teacher, boss, girlfriend, boyfriend, wife, husband, colleague, etc.)
  → return exactly that relationship (lowercase).
- If none of the above appear → return: "unknown".

Strict Output Rules:
- Return exactly ONE word.
- No newline, no extra spaces, no punctuation.
- Output must be on a single line.

Text: ${text}

Return only the final one-word answer.`
                }
            ]
        })

        console.log(cleanJSON(personId.choices[0].message.content));

        const name = await openai.chat.completions.create({
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
        console.log(cleanJSON(name.choices[0].message.content));

        return {
            personId : cleanJSON(personId.choices[0].message.content),
            name : cleanJSON(name.choices[0].message.content)
        }
    
}


export async function detectHabitOrGoal(text : String){
    try {

        const response = await openai.chat.completions.create({
            model : "google/gemma-2-9b-it",
            messages : [
                {
                    role : "user",
                    content : `You are a classifier. Decide whether the following user statement is:
                    - a GOAL (long-term objective, multi-step, months/weeks),
                    - a HABIT (recurring action or routine, daily/weekly),

                    Return exactly one word: goal, habit, or none.
                    STRICT RULES - 
                    - No newline, no extra spaces, no punctuation.
                    - Output must be on a single line.
                    Statement: ${text}`
                }
            ]            
        })
        console.log(cleanJSON(response.choices[0].message.content));
        return cleanJSON(response.choices[0].message.content);

    } catch (error) {
        return "Error while detecting habit or Goal"
    }
}


export async function extractHabitFrequency(text : String){
    try {
        const response = await openai.chat.completions.create({
            model : "google/gemma-2-9b-it",
            messages : [
                {
                    role : "user",
                    content : `Extract the repetition frequency conveyed by this statement. Return one word:
                    "daily, weekly, monthly, custom, none"

                    Statement: ${text} `
                }
            ]
        })


            console.log(cleanJSON(response.choices[0].message.content))
            return cleanJSON(response.choices[0].message.content)
    } catch (error) {
        return "Error while extracting habitFrequency"
    }
}

export async function extractGoalDeadline(text : string){
    try {
        const date = new Date().toISOString().split("T")[0];

        const response =  await openai.chat.completions.create({
            model : "meta-llama/llama-3.1-8b-instruct",
            messages : [
                {
                    role : "user",
                    content : `
Your task is to extract a deadline.

Return ONLY a valid ISO date (YYYY-MM-DD) or "none".

STRICT RULES:
- No explanation.
- No code.
- No examples.
- No comments.
- No extra words.
- No newline.
- Output must be EXACTLY one of:
  - a date in YYYY-MM-DD format
  - the word: none

Interpretation Rules:
- "today" = Current date
- "tomorrow" = Current date + 1 day
- "next week" = current date + 7 days
- "next month" = last day of next month
- "end of month" = last day of current month
- "in X days" = add X days
- If ambiguous → return "none"

Current date: ${date}
Text: ${text}

Return ONLY the final date or "none".
`
                }
            ]
        })
            console.log(cleanJSON(response.choices[0].message.content))
            return new Date(cleanJSON(response.choices[0].message.content))

    } catch (error) {
        const date = new Date().toISOString().split("T")[0];
        return new Date(date);
    }
}

export async function generateGoalProgress(text : string){

    const prompt = `You are a progress analyzer. Based on the user's progress update text, estimate the percentage of goal completion from 0 to 100.

Rules:
- Output ONLY a single number between 0 and 100.
- No explanation, no percent sign, no additional text.
- If the text includes explicit fractions (like 3/10), convert to percentage (3/10 → 30).
- If the text includes explicit percentages (like 40%), return that number.
- If the text includes quantitative updates (like “solved 5 more problems”), estimate moderately (e.g., +5–10%).
- If the text indicates major milestones (e.g. "halfway done", "midway"), return around 50.
- If the user says “completed”, “finished”, “done”, return 100.
- If the user says “barely made progress”, “little progress”, “slow progress”, return between 5 and 20.
- If the user says they missed the task today or did nothing, return 0–5.
- If the progress cannot be determined, estimate a reasonable value based on tone.

Return only one number.

User update: "${text}"
`

    try {
        const response = await openai.chat.completions.create({
            model : "meta-llama/llama-3.1-8b-instruct",
            messages : [
                {
                    role : "user",
                    content : prompt
                }
            ]
        })
        return parseInt(cleanJSON(response.choices[0].message.content));
    } catch (error) {
        return 0
    }
}

export async function getTasks(text : string){
    try {
        var date = new Date().toISOString();
        date = date.slice(0, 10);

        console.log(date);

    const response = await openai.chat.completions.create({
        model : "meta-llama/llama-3.1-8b-instruct",
        messages : [
            {
                role : "developer",
                content : `In the following text what is the task I am asked to do, what are the key things that I can take out from the following text : ${text}
                
                if asked for date, respond in the date structure DD/MM/YYYY on the basis of current date : ${date}
                Date Interpretation Rules:
- "today" = Current date
- "tomorrow" = Current date + 1 day
- "next week" = current date + 7 days
- "next month" = last day of next month
- "end of month" = last day of current month
- "in X days" = add X days
- If ambiguous → return "none"
                {
                "task": "Set a reminder for a meeting",
                "date" : "12/01/2025",
                "time" : "12:00pm"
                }
                create a json response and add all the important keys from the text, 
                Remeber it there can be other keys like time person location meeting etc.
                Do get those text and send me
                remember there can be other keys too, this was just for example, add as many keys as you want like name, location, people, time range etc.

                Also on the basis of text classify reminderFrequency as : Daily, Weekly, Monthy, Yearly

                STRICT RULES:
                Do not provide any extra information
                Do not give any new punctuation marks or slash or new line or any kind of symbol
                Directly provide the response in the given format as above
                Do not add anything extra
                Just provide me the json response and nothing extra information not anything extra
                
                

 Use EXACTLY this schema:
 {
   "task": string,
   "date": string (DD/MM/YYYY or empty),
   "startTime": string (HH:mm in 24h or empty),
   "endTime": string (HH:mm in 24h or empty),
   "timeRange": string,
   "person": string,
   "location": string,
   "people": string,
   "agenda": string,
   "reminder_frequency" : string
 }

 STRICT RULES:  
                Use the exact schema don't miss anything
                Do not provide any extra information
                Do not give any new punctuation marks or slash or new line or any kind of symbol
                Directly provide the response in the given format as above
                Do not add anything extra
                Just provide me the json response and nothing extra information not anything extra`

            }
        ]
    })

    const content = response.choices[0].message.content;
    if(!content){
        throw new Error("Cannot derive content from the text")
    }
    console.log(content);

    const result = JSON.parse(content);
    const [h,m] = result.startTime.split(":");
    console.log(h,m)
    const date1 = result.date.split("/").reverse().join("-");
    const t1 = new Date(date1).setHours(parseInt(h), parseInt(m), 0, 0);
    result.date = t1;

    return result
    } catch (error) {
        console.log(error);
        return error
    }
}


export async function getBankStatementParser(text : string) {
    try {
        //A/c X2700 credited with Rs. 20.00 on 16-Dec-25 from JITENDER RANA RRN: 115725617997 -Bank of Maharashtra (Incoming - AX-MAHABK-S )
        const date = new Date();
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