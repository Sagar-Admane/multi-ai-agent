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

RULES (strict priority order):

1. If the text describes a personal event that happened at a specific time
(today, yesterday, last week, this morning, last night, etc.),
classify as: episodic-memory.

   Examples:
   - “I went to college today.”
   - “Yesterday I met my friend.”

2. If the text ASKS about the user's own past events at a specific time,
classify as: query-episodic.

   Examples:
   - “What did I do yesterday?”
   - “Where did I go last week?”

3. If the text is asking about the user's OWN general stored info 
(not time-specific),
classify as: query-memory.

   Examples:
   - “Where did I work?”
   - “Which company I interned at?”
   - “What is my background?”

4. If the text is a personal fact, identity, biography, or long-term information,
classify as: save-memory.

   Examples:
   - “I study at LPU.”
   - “My favorite food is pizza.”
   - “I live in Punjab.”

5. Questions about ANOTHER person → relationship-query.
   Examples:
   - “What does Rahul do?”
   - “Where does John work?”

6. Info ABOUT another person → save-relationship.
   Examples:
   - “My brother likes cricket.”

7. New goal or habit → save-goalorhabbit.

8. Progress update → update-goalProgress.

9. Daily habit completion → habit-checkin.

10. Explicit requests to forget/delete → delete-memory.

11. Any code, logs, technical content → save-memory.

Fallback rules (must be used if ambiguous):
- If it looks like a retrieval about the user's past actions and contains time markers → "query-episodic".
- If it uses "I/my/me" but no time marker and is a question → "query-memory".
- Otherwise choose the closest intent from allowed list; do NOT output empty intent.

Output ONLY the intent name. No punctuation. No explanations.

Now classify this:
"${text}"`


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