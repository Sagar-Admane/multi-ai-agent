import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {detectHabitOrGoal, extractGoalDeadline, extractHabitFrequency, generateAIRespone, generateEmbeddings, generateGoalProgress, generateImportanceScore, generateTasks, genereateRelationship} from "../src/utils/gemini-tasks.js"
import { connectDB } from "./utils/db.js";
import EpisodicMemory from "../src/models/episodicMemory.js";
import Memory from "../src/models/memory.js";
import Relationship from "../src/models/relationshipMemory.js";
import { cosineSimilarity } from 'ai';
import { tryLinkHabitToGoal } from './utils/helperFunction.js';

console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

const server = new McpServer({
    name : "MCP_MULTI_AGENT_SERVER",
    version : "1.0.0"
})

server.registerTool(
    "save-memory",
    {
        title : "Memory Agent",
        description : "An agent that manages and retrieves information from memory storage.",
        inputSchema : {
            text : z.string()
        }
    },
    async ({text}) => {
        try {
            const embedding : number[] = await generateEmbeddings(text);
            const {tags, category} = await generateTasks(text);

            let bestMatch : any = null;
            let bestScore = 0;

            const memories = await Memory.find();

            if(memories){
                for(const m of memories){
                    const score = cosineSimilarity(embedding, m.embeddings);
                    if(score > bestScore){
                        bestScore = score;
                        bestMatch = m;
                    }
                }
            }

            const threshold = 0.85;

            let importanceScore = await generateImportanceScore(text);
            if(bestScore > threshold){
                bestMatch.embeddings = embedding;
                bestMatch.text = text;
                const finalTags = new Set([...(bestMatch.tags || []), ...tags]);
                bestMatch.tags = [...finalTags];
                bestMatch.category = category;
                if(importanceScore > 1){
                    await bestMatch.save();
                }
            } else {
                    const memory = new Memory({
                    text : text,
                    embeddings : embedding,
                    category : category,
                    tags : tags
                })
                await memory.save();

                var ai_response : any = `await generateAIRespone(text)`
            }
            ai_response = await generateAIRespone(text)

            return{
                content : [{type : "text", text : `${ai_response} `}]
            }

        } catch (error) {
            return{
                content : [{type:"text", text : `${error}`}]
            }
        }
    }
)

server.registerTool(
    "query-memory",
    {
        title : "Query Memory Tool",
        description : "This tool helps to query from all the memory tool",
        inputSchema : {
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const topK = 3;
            const queryEmbedding : number[] = await generateEmbeddings(text);
            const memories = await Memory.find();
            const scored = memories.map((m) => ({
                memory : m,
                score : cosineSimilarity(queryEmbedding, m.embeddings)
            }))
            scored.sort((a, b) => b.score - a.score);
            const response = scored.slice(0, topK)[0].memory.text;

            return{
                content : [{type : "text", text : `${response}`}]
            }
        } catch (error) {
            return{
                content : [{type : "text", text : "Error while querying the memory"}]
            }
        }
    }
)

server.registerTool(
    "delete-memory",
    {
        title : "Deletes a memory from database",
        description : "This tool helps to delete a memory from the database",
        inputSchema :{
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const embedding = await generateEmbeddings(text)
            const memories = await Memory.find();

            const scored = memories.map((m) => ({
                memory : m,
                score : cosineSimilarity(embedding, m.embeddings)
            }))

            scored.sort((a,b) => b.score - a.score)
            const matches = scored.slice(0, 3);

            const toDelete = matches.filter(m => m.score >= 0.6);

            const best = toDelete[0].memory;
            await Memory.findByIdAndDelete(best._id);

            return{
                content : [{type : "text", text : "The memory is deleted"}]
            }
        } catch (error) {
            return {
                content : [{type : "text", text : `${error}`}]
            }
        }
    }
)


server.registerTool(
    "episodic-memory",
    {
        title : "Episodic memory",
        description : "This tool helps to store the episodic memory",
        inputSchema : {
            text : z.string()
        }
    },
    async ({text}) => {
        try {
            const embedding : number[] = await generateEmbeddings(text);
            const epi_mem = new EpisodicMemory({
                content : text,
                embedding : embedding
            })
            await epi_mem.save();

            const ai_response = await generateAIRespone(text);

            return{
                content : [{type : "text", text : `${ai_response}`}]
            }
        } catch (error) {
            return {
                content : [{type : "text", text : "Error storing the episodic memory"}]
            }
        }
    }
)


server.registerTool(
    "query-episodic",
    {
        title : "This is querying the episodic memory",
        description : "This is querying the episodic memory",
        inputSchema : {
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const embedding : number[]= await generateEmbeddings(text);

            const memories = await EpisodicMemory.find();

            const scored = memories.map((m) => ({
                memory : m,
                score : cosineSimilarity(embedding, m.embedding)
            }))

            scored.sort((a,b) =>  b.score - a.score);

            return{
                content : [{type : "text", text :  `${scored.slice(0,3)}`}]
            }


        } catch (error) {
            return{
                content : [{type : "text", text : "Error in querying in episodic"}]
            }
        }
    }
)

server.registerTool(
    "save-relationship",
    {
        title : "Save relationship",
        description : "This tool saves relationships",
        inputSchema : {
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const {personId, name} = await genereateRelationship(text);
            const embedding = await generateEmbeddings(text);

            let record = await Relationship.findOne({personId});

            if(!record){
                record = new Relationship({personId : personId, name : name}) 
            }

            record.facts.push({
                content : text,
                embedding : embedding
            })

            record.lastInteraction = text
            if(name) record.name = name

            await record.save();

            return{
                content : [{type : "text", text : `Relation saved in memory`}]
            }


        } catch (error) {
            return{
                content : [{type : "text", text : "Error saving relationship"}]
            }
        }
    }
)

server.registerTool(
    "relationship-query",
    {
        title : "Relationship query",
        description : "Queying the relationship",
        inputSchema : {
            text : z.string()
        }
    },
    async ({text}) => {
        try {
            const {personId} = await genereateRelationship(text);

            const embedding = await generateEmbeddings(text);

            const record = await Relationship.findOne({personId});

            let scored : any[];

            if(record){
                scored = record.facts.map(f => ({
                    ...f,
                    score: cosineSimilarity(embedding, f.embedding)
                }));
                
                scored.sort((a, b) => b.score - a.score);
            } else {
                scored = [];
            }

            return {
                content : [{type : "text", text : `${scored.slice(0, 3)}`}]
            }


        } catch (error) {
            return{
                content : [{type : "text", text : `Error while querying in relationship`}]
            }
        }
    }
)

server.registerTool(
    "save-goalorhabbit",
    {
        title : "Save goal or habbit tool",
        description : "This tool helps to save goal or habbit",
        inputSchema : {
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const embedding : number[] = await generateEmbeddings(text);
            let {tags, category} = await generateTasks(text);
            const threshold = 0.85;
            const {bestMatch,  bestScore} = await checkIfTextExist(text, embedding);

            const isHabbitOrGoal : string = await detectHabitOrGoal(text);
            var habbitFrequency = await extractHabitFrequency(text);
            var goalDeadline : Date = await extractGoalDeadline(text);;
            if(bestScore > threshold){
                bestMatch.text = text;
                bestMatch.embeddings = embedding;
                if(isHabbitOrGoal === "goal"){
                    bestMatch.isGoal = true;
                    bestMatch.goalProgess = bestMatch.goalProgess || 0;
                    bestMatch.goalDeadline =  goalDeadline;
                }
                if(isHabbitOrGoal==="habit"){
                    bestMatch.isHabbit = false;
                    bestMatch.habbitFrequency = habbitFrequency;
                    bestMatch.habbitStreak = bestMatch.habbitStreak+1;
                }
                bestMatch.tags = Array.from(new Set([...(bestMatch.tags||[]), ...tags]));
                bestMatch.category = category;

                await bestMatch.save();

                if(isHabbitOrGoal==="habit") await tryLinkHabitToGoal(bestMatch)
            } else {
                const isGoal = isHabbitOrGoal==="goal";
                const isHabbit = isHabbitOrGoal=="habit";
                const memory = new Memory({
                    text : text,
                    embeddings : embedding,
                    category : category,
                    tags : tags
                })
                
                if(isGoal){
                    memory.isGoal = isGoal;
                    memory.goalDeadline = goalDeadline;
                }

                if(isHabbit){
                    memory.isHabbit = isHabbit;
                    memory.habbitFrequency = habbitFrequency
                }
                await memory.save()

                if(isHabbit) await tryLinkHabitToGoal(memory);
            }

            return({
                content : [{type : "text", text : `${isHabbitOrGoal}`}]
            })
        } catch (error) {
            return({
                content : [{type : "text", text : "Error while saving habbit or goal"}]
            })
        }
    }
)

server.registerTool(
    "update-goalProgress",
    {
        title : "Update the Goal Progess",
        description : "This tool helps to update the goal progress",
        inputSchema : {
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const embeddings = await generateEmbeddings(text);
            const {bestScore, bestMatch} = await checkIfTextExist(text, embeddings);
            const threshold = 0.70;
            if(bestScore < threshold){
                return ({
                    content : [{type : "text", text : `${bestScore}`}]
                })
            } else {
                const goalProgress = await generateGoalProgress(text)
                bestMatch.goalProgress = goalProgress;
                console.log(bestMatch.text)
                await bestMatch.save();
            }

            return ({
                content : [{type : "text", text : "Goal Progress updated successfully"}]
            })
        } catch (error) {
            return({
                content : [{type : "text", text : "Error while updating goal Progress"}]
            })
        }
    }
)

server.registerTool(
    "habit-checkin",
    {
        title : "Habit checkin to maintain streak",
        description : "Tool helps to update the habit streak",
        inputSchema  :{
            text : z.string()
        }
    },
    async({text}) => {
        try {
            const embedding = await generateEmbeddings(text);
            const {bestScore, bestMatch} = await checkIfTextExist(text, embedding);
            const threshold = 0.70;
            if(bestScore < threshold){
                return {
                    content : [{type : "text", text : `Cannot find such habit`}]
                }
            } else {
                const lastUpdated = new Date(bestMatch.timestamp).toISOString();
                const todaysDate = new Date(Date.now() - 86400000).toISOString();

                if(lastUpdated === todaysDate){
                    bestMatch.habbitStreak += 1;
                } else {
                    bestMatch.habbitStreak = 1;
                }
                await bestMatch.save();

            }
            return({
                content : [{type : "text", text : "Habit streak updated successfully"}]
            })
        } catch (error) {
            return {
                content : [{type : "text", text : "Error in habit checking"}]
            }
        }
    }
)

async function main(){
    const transport = new StdioServerTransport();
    await connectDB();
    await server.connect(transport);
}

async function checkIfTextExist(text : string, embeddings : number[]){
    const memories = await Memory.find();
    var bestScore = 0;
    var bestMatch : any = null;
    if(memories){
        for(const m of memories){
            const score = cosineSimilarity(embeddings, m.embeddings);
            if(score > bestScore){
                bestScore = score;
                bestMatch = m;
            }
        }
    }

    return {
        bestScore : bestScore,
        bestMatch : bestMatch
    }

}

main()