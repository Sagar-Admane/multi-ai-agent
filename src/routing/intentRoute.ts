import express from "express"
import { intentOfText } from "../controller/intentOfText.js";

const route = express.Router();

route.post("/", intentOfText);
export default route;