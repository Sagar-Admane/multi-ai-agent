import mongoose from "mongoose";

export async function connectDB(){
    const mongoURI : string = process.env.MONGO_URI || "";
    if(!mongoURI){
        console.log("Mongo DB URI not found");
    } else {
        mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    }
}