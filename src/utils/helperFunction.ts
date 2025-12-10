import { cosineSimilarity } from "ai";
import Memory from "../models/memory.js"
import { mcp } from "../client.js";

type MemoryType = InstanceType<typeof Memory>

export async function tryLinkHabitToGoal(habitMemory : MemoryType) {
  // find candidate goals
  const allGoals = await Memory.find({ isGoal: true });
  if (!allGoals || allGoals.length === 0) return null;

  // compare embedding similarity
  let best = null; let bestScore = 0;
  for (const g of allGoals) {
    const score = cosineSimilarity(habitMemory.embeddings, g.embeddings);
    if (score > bestScore) { bestScore = score; best = g; }
  }

  // threshold for linking (tune as needed)
  const LINK_THRESHOLD = 0.7;
  if (best && bestScore >= LINK_THRESHOLD) {
    habitMemory.linkedGoalId = best._id;
    await habitMemory.save();
    return { linked: true, goalId: best._id, score: bestScore };
  }
  return null;
}


export async function handleMemoryTool(req: any, res: any) {
    try {
        const { intent, text } = req.body;

        const response = await mcp.callTool({
            name: intent,
            arguments: { text }
        });

        if (!response || !response.content) {
            return res.json({
                text,
                intent,
                message: "No response from the tool"
            });
        }

        const contentArray = response.content as { text: string }[];
        const message = contentArray[0]?.text || "No message returned";
        console.log(response);
        return res.json({ text, intent, message });

    } catch (error) {
        return res.json({
            error: `Error while calling the tool: ${error}`
        });
    }
}
