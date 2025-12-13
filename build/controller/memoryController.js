import { handleMemoryTool } from "../utils/helperFunction.js";
import { detectHabitOrGoal } from "../utils/gemini-tasks.js";
export async function saveMemory(req, res) {
    handleMemoryTool(req, res);
}
export async function queryMemory(req, res) {
    handleMemoryTool(req, res);
}
export async function deleteMemory(req, res) {
    handleMemoryTool(req, res);
}
export async function episodicMemory(req, res) {
    handleMemoryTool(req, res);
}
export async function queryEpisodic(req, res) {
    handleMemoryTool(req, res);
}
export async function saveRelationship(req, res) {
    handleMemoryTool(req, res);
}
export async function relationshipQuery(req, res) {
    handleMemoryTool(req, res);
}
export async function isGoalOrHabbit(req, res) {
    try {
        const text = req.body.text;
        const response = await detectHabitOrGoal(text);
        if (!response) {
            return res.json({
                error: "Not able to detect the habbit or goal"
            });
        }
        return res.json({
            type: response,
            intent: req.body.intent,
            text: req.body.text
        });
    }
    catch (error) {
        return res.json({
            error: `${error}`
        });
    }
}
export async function saveGoalOrHabbit(req, res) {
    try {
        handleMemoryTool(req, res);
    }
    catch (error) {
        return res.json({
            error: `${error}`
        });
    }
}
