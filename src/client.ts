import { Client } from "@modelcontextprotocol/sdk/client"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import express from "express"

const app = express()
app.use(express.json())

export const mcp = new Client({
    name : "MCP_CLIENT",
    version : "1.0.0"
}, {
    capabilities : {
        sampling : {}
    }
})

const transport = new StdioClientTransport({
    command : "node",
    args : ["build/server.js"],
    stderr : "ignore"
})

export async function main(){
    await mcp.connect(transport)
    console.log("MCP CLinet connected successfully")
}

app.listen(2485, () => {
    console.log("CLient Started")
})