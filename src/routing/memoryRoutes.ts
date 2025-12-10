import express from "express"
import { deleteMemory, episodicMemory, queryEpisodic, queryMemory, saveMemory } from "../controller/memoryController.js";

const route = express.Router();

route.post("/save-memory", saveMemory)
route.post("/query-memory", queryMemory)
route.post("/delete-memory", deleteMemory)
route.post("/episodic-memory", episodicMemory)
route.post("/query-episodic", queryEpisodic)
export default route