import { text } from "stream/consumers";
import { mcp } from "../client.js";
import { handleMemoryTool } from "../utils/helperFunction.js";
import { detectHabitOrGoal } from "../utils/gemini-tasks.js";
import { error } from "console";

export async function saveMemory(req : any, res : any){
   handleMemoryTool(req, res);
}

export async function queryMemory(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function deleteMemory(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function episodicMemory(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function queryEpisodic(req: any, res : any){
    handleMemoryTool(req, res);
}

export async function saveRelationship(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function relationshipQuery(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function isGoalOrHabbit(req: any, res: any){
    try {
        const text = req.body.text;
        const response = await detectHabitOrGoal(text);
        if(!response){
            return res.json({
                error : "Not able to detect the habbit or goal"
            })
        }

        return res.json({
            type : response,
            intent : req.body.intent,
            text : req.body.text
        })
    } catch (error) {
        return res.json({
            error : `${error}`
        })
    }
}

export async function saveGoalOrHabbit(req: any, res: any){
    try {
        handleMemoryTool(req, res);
    } catch (error) {
        return res.json({
            error : `${error}`
        })
    }
}

export async function parseSms(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function parseManualExpense(req: any, res : any){
    handleMemoryTool(req, res);
}

export async function getTransaction(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function getTranactiononType(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function getLatestBalance(req : any, res : any){
    handleMemoryTool(req, res);
}

export async function getupsertBudget(req : any, res : any){
    handleMemoryTool(req, res);
}