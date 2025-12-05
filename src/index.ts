import express from "express"
import intentRoute from "../src/routing/intentRoute.js"

const app = express();

const PORT = 2484;

app.use(express.json())

app.use("/getIntent", intentRoute);

app.listen(PORT,() => {
    console.log(`application started on port : ${PORT}`)
})