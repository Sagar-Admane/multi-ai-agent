import mongoose from "mongoose"

const memorySchema = new mongoose.Schema({
    text : {
        type : String,
        required : true
    },
    source : {
        type : String,
        default : "user",
    },
    timestamp : {
        type : Date,
        default: Date.now
    },
    embeddings : {
        type : [Number],
        required : true,
    },
    tags : {
        type : [String],
        default : []
    }
})

const model = mongoose.model("Memory", memorySchema);
export default model;

