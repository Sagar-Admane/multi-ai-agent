import { cosineSimilarity } from "ai";
import Memory from "../models/memory.js"

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
