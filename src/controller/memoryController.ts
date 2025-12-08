import { text } from "stream/consumers";
import { mcp } from "../client.js";

export async function saveMemory(req : any, res : any){
    try {
        const tool = req.body.intent;
        const response = await mcp.callTool({
            name : `${tool}`,
            arguments : {
                text : req.body.text
            }
        })

        if(!response){
            return res.json({
                message : "Unable to save the memory"
            })
        }

        console.log(response)

        return res.json({
            text : req.body.text,
            intent : req.body.intent,
            message : response
        })
    } catch (error) {
        res.error({
            error : `Error while saving the memory : ${error}`
        })
    }
}

export async function queryMemory(req : any, res : any){
    try {
        const tool = req.body.intent;
        const response = await mcp.callTool({
            name : `${tool}`,
            arguments : {
                text : req.body.text
            }
        })

        if(!response){
            return res.json({
                message : "Unable to query the memory"
            })
        }

        console.log(response.content)

        return res.json({
            text : req.body.text,
            intent : req.body.intent,
            message : `${response.content[0].text}`
        })
    } catch (error) {
        res.error({
            error : `Error while saving the memory : ${error}`
        })
    }
}