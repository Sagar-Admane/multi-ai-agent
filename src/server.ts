import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {generateTasks} from "../src/utils/gemini-tasks.js"
import { connectDB } from "./utils/db.js";

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

        const tasks = await generateTasks(text);
        console.log("Generated tasks:", tasks);
        const output = `Memory Agent received the following text: ${tasks}`;
        return {
            content : [{type : "text", text : output}]
        }
    }
)

async function main(){
    const transport = new StdioServerTransport();
    await connectDB();
    await server.connect(transport);
}

main()