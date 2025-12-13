import OpenAI from "openai"
import env from "dotenv"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
env.config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey : process.env.openrouter,
})
export async function intentOfText(text){
        try {
            
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
    task-intent
    
    RULES (strict priority order):
    
    1. If the text describes a personal event that happened at a specific time
    (today, yesterday, last week, this morning, last night, etc.),
    classify as: episodic-memory.
    
    2. If the text ASKS about the user's own past events at a specific time,
    classify as: query-episodic.
    
    3. If the text is asking about the user's OWN general stored info (not time-specific),
    classify as: query-memory.
    
    4. If the text is a personal fact, identity, biography, or long-term information
    about the USER ONLY, classify as: save-memory.
    
    4.5. If the text provides information ABOUT ANOTHER PERSON
    (family member, friend, colleague, etc.),
    classify as: save-relationship.
    
    5. Questions about ANOTHER person → relationship-query.
    
    6. New goal or habit → save-goalorhabbit.
    
    7. Progress update → update-goalProgress.
    
    8. Daily habit completion → habit-checkin.
    
    9. Explicit requests to forget/delete → delete-memory.
    
    10. Any code, logs, or technical content → save-memory.
    
    11. If the text instructs to perform a task such as:
    - setting a meeting or reminder,
    - scheduling something,
    - writing or sending an email,
    - adding to calendar,
    - booking something,
    - or any explicit task/action command
    
    classify as: task-intent.
    
    12.If intent : save-goalorhabbit
    - classify text as habit or goal
            type : habit
            type : goal
    
    Fallback rules:
    - Time-marker + question about the user’s past → query-episodic.
    - “I/my/me” + question + no time marker → query-memory.
    - Otherwise choose the closest valid intent.
    
    Output ONLY the intent name and if applicable intent type. No punctuation. No explanations.
    
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


    console.log(response.choices)
            var reached = (cleanJSON(response.choices[0].message.content));
            reached = reached.split(" ");
            console.log(reached);
            var type;
            if(reached[2]){
                type = reached[2];
            } else {
                type = reached[1] ? reached[1].split(":")[1] : "";
            }
            var intent = reached[0];
            console.log(type);
            console.log(intent);
            // return res.json({
            //     intent : cleanJSON(response.choices[0].message.content),
            //     text : text
            // })
        } catch (error) {
            console.log(error)
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

intentOfText("I have a habit to go to gym everyday at 7:00 am")