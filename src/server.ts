import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {generateAIRespone, generateEmbeddings, generateTasks} from "../src/utils/gemini-tasks.js"
import { connectDB } from "./utils/db.js";
import Memory from "../src/models/memory.js";
import { cosineSimilarity } from 'ai';

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

            if(bestScore > threshold){
                bestMatch.embeddings = embedding;
                bestMatch.text = text;
                const finalTags = new Set([...(bestMatch.tags || []), ...tags]);
                bestMatch.tags = [...finalTags];
                bestMatch.category = category;
                await bestMatch.save();
            } else {
                const memory = new Memory({
                text : text,
                embeddings : embedding,
                category : category,
                tags : tags
            })
            await memory.save();
            }
            const ai_response = await generateAIRespone(text)

            return{
                content : [{type : "text", text : `${ai_response} `}]
            }

        } catch (error) {
            return{
                content : [{type:"text", text : "Error while saving the memory"}]
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

            return{
                content : [{type : "text", text : `${scored.slice(0, topK)}`}]
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

            const toDelete = matches.filter(m => m.score >= 0.7);

            const best = toDelete[0].memory;
            await Memory.findByIdAndDelete(best._id);

            return{
                content : [{type : "text", text : "The memory is deleted"}]
            }
        } catch (error) {
            return {
                content : [{type : "text", text : "Error while deleting from memory"}]
            }
        }
    }
)

async function main(){
    const transport = new StdioServerTransport();
    await connectDB();
    await server.connect(transport);
}

main()