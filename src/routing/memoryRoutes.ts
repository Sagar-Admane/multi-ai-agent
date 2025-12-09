import express from "express"
import { deleteMemory, queryMemory, saveMemory } from "../controller/memoryController.js";

const route = express.Router();

route.post("/save-memory", saveMemory)
route.post("/query-memory", queryMemory)
route.post("/delete-memory", deleteMemory)
export default route