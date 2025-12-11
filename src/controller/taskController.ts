import { getTasks } from "../utils/gemini-tasks.js";

export async function getTask(req : any, res : any){
    try {
        console.log("Get task started....")
        const result = await getTasks(req.body.text);
        console.log(result);
        return res.json({
            result
        })
    } catch (error) {
        console.log(error);
        return res.json({
            error : error
        })
    }
}