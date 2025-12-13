import express from "express";
import { getTask } from "../controller/taskController.js";
const route = express.Router();
route.post("/getTask", getTask);
export default route;
