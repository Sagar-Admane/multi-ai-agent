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
        const prompt = `You are an intent classifier AND tool router.

Your job is to:
1. First decide if the user intent matches one of the AVAILABLE TOOLS.
2. If a tool matches, return the TOOL NAME.
3. If no tool matches, fall back to MEMORY / TASK intents exactly as defined below.

--------------------------------------------------
AVAILABLE TOOLS (HIGH PRIORITY)
--------------------------------------------------

If the user intent matches ANY of the following, return ONLY the tool name.

TOOLS & WHEN TO USE THEM:

1. parse-sms  
Use when:
- User provides a bank SMS
- Mentions debit / credit SMS
- Says things like:
  "I got an SMS from bank"
  "Parse this transaction message"
  "This message says debited/credited"

2. parse-manualExpense  
Use when:
- User manually describes an expense
- No SMS format
- Examples:
  "I spent 200 on food today"
  "Add expense 500 for groceries"
  "Manually add an expense"

3. get-transactions  
Use when:
- User asks to see transactions
- Mentions date ranges
- Examples:
  "Show my transactions"
  "Expenses from yesterday"
  "Transactions from last month"
  "What did I spend this week?"

4. get-TransactionOnType  
Use when:
- User asks for only credit or debit transactions
- Examples:
  "Show credited transactions"
  "Debits from last week"
  "Money received today"

5. getLatestBalance  
Use when:
- User asks for balance
- Examples:
  "What is my balance?"
  "How much money do I have?"
  "Remaining balance"
  "Current bank balance"

6. upsertBudget  
Use when:
- User sets or updates budget
- Examples:
  "Set my budget to 5000"
  "Update budget to 10k"
  "My monthly budget is 8000"

IMPORTANT:
- If a tool matches → RETURN ONLY THE TOOL NAME
- Do NOT return memory intents if a tool matches
- Do NOT add explanations
- Do NOT return JSON

--------------------------------------------------
FALLBACK: MEMORY & TASK CLASSIFICATION
--------------------------------------------------

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
If intent is save-goalorhabbit:
- classify as habit or goal

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

classify as: task-intent.

Fallback rules:
- Time-marker + question about the user’s past → query-episodic.
- “I/my/me” + question + no time marker → query-memory.
- Otherwise choose the closest valid intent.

--------------------------------------------------
FINAL OUTPUT RULE
--------------------------------------------------
Output ONLY ONE of:
- Tool name (preferred)
- OR intent name (+ type if applicable)

No punctuation.
No explanations.

Now classify this:
"${text}"
`


        const response = await openai.chat.completions.create({
         model : "google/gemma-2-9b-it",
         messages : [
            {
               role : "user",
               content : prompt
            }
         ]
        })

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
            var intent = reached[0];
        return res.json({
            intent : intent,
            type : type,
            text : text
        })
    } catch (error) {
        console.log(error)
        return res.json({error : `${error}`})
    }
}

