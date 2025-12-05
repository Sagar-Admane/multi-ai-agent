import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import env from "dotenv"
env.config()

const google = createGoogleGenerativeAI({
    apiKey : process.env.GEMINI_API_KEY
})

export async function intentOfText(req : any, res : any){
    try {
        const text = req.body.text;
        const prompt = `You are an intent classifier for a personal AI memory system.

Your job: Read the user text and return ONLY one intent from the list below.
Do NOT return explanations or extra words. Return only the intent name exactly.

Here are the available intents and what they mean:

1. save-memory  
   - When the user shares information they want remembered.
   - Example: “I moved to a new apartment”, “My favorite food is dosa”.

2. query-memory  
   - When the user asks for something they saved earlier.
   - Example: “What did I say about my job?”, “Do you remember my preferences?”

3. delete-memory  
   - When user wants to delete something they stored.
   - Example: “Forget my old phone number”, “Delete that memory about gym”.

4. episodic-memory  
   - When user describes a personal experience, event, or story.
   - Example: “Today I went to the mall with friends”.

5. query-episodic  
   - When user asks about things that happened or events they shared earlier.
   - Example: “What did I do last week?”, “Do you remember what I said yesterday?”

6. save-relationship  
   - When the text mentions a person and some info about them.
   - Example: “My friend Rahul loves cricket”.

7. relationship-query  
   - When user asks something about a person stored earlier.
   - Example: “What do you know about Rahul?”, “Tell me facts about John”.

8. save-goalorhabbit  
   - When user states a new goal or habit.
   - Example: “I want to learn DSA in 30 days”, “I will drink water daily”.

9. update-goalProgress  
   - When user reports progress about an existing goal.
   - Example: “I finished 20% of my DSA prep”, “Today I studied arrays”.

10. habit-checkin  
   - When user marks a daily habit check-in.
   - Example: “I completed today’s meditation session.”

---

### Output format:
Return ONLY one word: the intent name.

### Now classify the following user text:
"${text}"
`
        const response = await generateText({
            model : google("gemini-2.0-flash"),
            prompt : `${prompt}`
        })

        console.log(response.text)
        return res.json({
            intent : response.text.trim(),
            text : text
        })
    } catch (error) {
        console.log(error)
        return res.json({error : `${error}`})
    }
}