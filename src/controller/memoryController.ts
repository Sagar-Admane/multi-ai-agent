import { text } from "stream/consumers";
import { mcp } from "../client.js";
import { handleMemoryTool } from "../utils/helperFunction.js";

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