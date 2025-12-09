import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import env from "dotenv"
import OpenAI from "openai";
import cleanJSON from "../utils/utils.js";
env.config()

const google = createGoogleGenerativeAI({
    apiKey : process.env.GEMINI_API_KEY
})

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})

export async function intentOfText(req : any, res : any){
    try {
        const text = req.body.text;
        const prompt = `You are an intent classifier.

Return EXACTLY one of the following intents and nothing else:
save-memory
query-memory
delete-memory
episodic-memory
query-episodic
save-relationship
relationship-query
save-goalorhabbit
update-goalProgress
habit-checkin

RULES:

1. episodic-memory is ONLY for events that happened at a specific time 
   (today, yesterday, last week, this morning, etc.)
   These describe experiences or activities.

   Examples of episodic-memory:
   - “I went to college today.”
   - “Yesterday I met my friend.”
   - “This morning I drank coffee.”

2. If the text is a personal fact, identity, preference, or long-term information,
   classify it as save-memory, NOT episodic-memory.

   Examples of save-memory:
   - “I am a student in Lovely Professional University.”
   - “My favorite food is pizza.”
   - “I live in Punjab.”
   - “My birthday is on July 14.”

3. Code, logs, configs, tool definitions, or technical text = save-memory.

4. Output ONLY the exact intent name. No punctuation. No extra text.

5. If the text is asking about the user's OWN past info or memories 
(e.g., “Where did I work?”, “Which company I interned at?”, 
“What did I say about my projects?”, “What is my background?”),
then ALWAYS classify it as query-memory.
It is NOT a relationship-query unless the question is about SOMEONE ELSE.

Examples:
“What did Rahul study?” → relationship-query
“What did I study?” → query-memory
“In which company I was intern?” → query-memory

Now classify this:
"{${text}}"`

        const response = await openai.chat.completions.create({
         model : "google/gemma-2-9b-it",
         messages : [
            {
               role : "user",
               content : prompt
            }
         ]
        })

        console.log(cleanJSON(response.choices[0].message.content));
        return res.json({
            intent : cleanJSON(response.choices[0].message.content),
            text : text
        })
    } catch (error) {
        console.log(error)
        return res.json({error : `${error}`})
    }
}