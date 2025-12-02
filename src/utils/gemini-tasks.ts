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


export async function genereateRelationship(text : string){
        const personId = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : `Determine the relationship of the main subject in the text with the user (Sagar).
                    If the main subject refers to ‘I’, ‘me’, or ‘Sagar’, or 'my' return user.
                    Otherwise, return friend.
                    Output only one word: user or friend.
                    Text: ${text}`
                })


        const name = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : `Based on the following text, if mention in the text return me the name of the main Subject user, if not mention return me with the empty string :
                    Now but when the name is I or me or user or my return as "Sagar"
                    ${text}. Return response in one word`
        })

        return {
            personId : personId.text,
            name : name.text
        }
    
}


export async function detectHabitOrGoal(text : String){
    try {
        const response = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : `You are a classifier. Decide whether the following user statement is:
                    - a GOAL (long-term objective, multi-step, months/weeks),
                    - a HABIT (recurring action or routine, daily/weekly),
                    - or NONE.

                    Return exactly one word: goal, habit, or none.

                    Statement: ${text}`
        })

        return response.text;
    } catch (error) {
        return "Error while detecting habit or Goal"
    }
}


export async function extractHabitFrequency(text : String){
    try {
        const response = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : `Extract the repetition frequency conveyed by this statement. Return one word:
                    "daily, weekly, monthly, custom, none"

                    Statement: ${text} `
            });

            return response.text
    } catch (error) {
        return "Error while extracting habitFrequency"
    }
}

export async function extractGoalDeadline(text : string){
    try {

        const response = await generateText({
            model : google("gemini-2.0-flash"),
            prompt :   `Extract the goal deadline from the following text.
                    Return the deadline as a date in YYYY-MM-DD format.
                    If the text mentions words like “today”, “tomorrow”, or “next week”, convert them to an actual date in YYYY-MM-DD format based on the current date.
                    If no deadline is mentioned, return "none".
                    Output must contain only the date (one token, no explanation, no punctuation).

                    Text: ${text}`
                })
            return response.text;

    } catch (error) {
        return "Cannot extract goal deadline"
    }
}


