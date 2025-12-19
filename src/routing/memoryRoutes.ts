import express from "express"
import { deleteMemory, episodicMemory, isGoalOrHabbit, parseSms, queryEpisodic, queryMemory, relationshipQuery, saveGoalOrHabbit, saveMemory, saveRelationship } from "../controller/memoryController.js";

const route = express.Router();

route.post("/save-memory", saveMemory)
route.post("/query-memory", queryMemory)
route.post("/delete-memory", deleteMemory)
route.post("/episodic-memory", episodicMemory)
route.post("/query-episodic", queryEpisodic)
route.post("/save-relationship", saveRelationship)
route.post("/relationship-query", relationshipQuery)
route.post("/save-goalorhabbit", saveGoalOrHabbit)
route.post("/parse-sms", parseSms);

route.post("/goalOrHabbit", isGoalOrHabbit);

export default route