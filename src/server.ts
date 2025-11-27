import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {generateEmbeddings, generateTasks} from "../src/utils/gemini-tasks.js"
import { connectDB } from "./utils/db.js";
import Memory from "../src/models/memory.js";

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
            const embedding = await generateEmbeddings(text);
            const tags = await generateTasks(text);
            const memory = new Memory({
                text : text,
                embeddings : embedding,
                tags : tags
            })
            await memory.save();



            return{
                content : [{type : "text", text : `Memory data with embeddings saved in database ${embedding} `}]
            }

        } catch (error) {
            return{
                content : [{type:"text", text : "Error while saving the memory"}]
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