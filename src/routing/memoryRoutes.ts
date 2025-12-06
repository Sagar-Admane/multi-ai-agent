import express from "express"
import { queryMemory, saveMemory } from "../controller/memoryController.js";

const route = express.Router();

route.post("/save-memory", saveMemory)
route.post("/query-memory", queryMemory)

export default route