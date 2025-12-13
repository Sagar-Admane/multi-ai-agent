import { getTasks } from "../utils/gemini-tasks.js";
export async function getTask(req, res) {
    try {
        console.log("Get task started....");
        const result = await getTasks(req.body.text);
        console.log(result);
        return res.json({
            result,
            text: req.body.text
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: error
        });
    }
}
