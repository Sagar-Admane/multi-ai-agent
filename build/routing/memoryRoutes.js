import express from "express";
import { saveMemory } from "../controller/memoryController.js";
const route = express.Router();
route.post("/save-memory", saveMemory);
export default route;
