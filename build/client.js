import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import express from "express";
import route from "../src/routing/memoryRoutes.js";
import taskRoute from "../src/routing/taskRoute.js";
const clientApp = express();
clientApp.use(express.json());
export const mcp = new Client({
    name: "MCP_CLIENT",
    version: "1.0.0"
}, {
    capabilities: {
        sampling: {}
    }
});
clientApp.use("/memory", route);
clientApp.use("/", taskRoute);
const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "memory_server:dev"],
    stderr: "ignore"
});
export async function main() {
    await mcp.connect(transport);
    console.log("MCP CLinet connected successfully");
}
main();
clientApp.listen(3000, () => {
    console.log("APplication started on port : 2485");
});
