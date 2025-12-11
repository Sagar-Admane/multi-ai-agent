import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, generateText } from "ai";
import OpenAI from "openai";
import cleanJSON from "./utils.js";
import env from "dotenv"

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
