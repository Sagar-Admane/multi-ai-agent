import express from "express"
import { deleteMemory, episodicMemory, queryEpisodic, queryMemory, relationshipQuery, saveMemory, saveRelationship } from "../controller/memoryController.js";

const route = express.Router();

route.post("/save-memory", saveMemory)
route.post("/query-memory", queryMemory)
route.post("/delete-memory", deleteMemory)
route.post("/episodic-memory", episodicMemory)
route.post("/query-episodic", queryEpisodic)
route.post("/save-relationship", saveRelationship)
route.post("/relationship-query", relationshipQuery)
export default route