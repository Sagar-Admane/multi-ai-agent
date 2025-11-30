import mongoose from "mongoose";

const relationshipSchema = new mongoose.Schema({
    personId : {
        type : String,
        required : true
    },
    name : {
        type : String,
    },
    facts : [
        {
            content : String,
            embedding : [Number],
            createdAt : {
                type : Date,
                default : Date.now()
            }
        }
    ],

    lastInteraction : {
        type : String,
        default : ""
    }
})

const model = mongoose.model("relationshipModel", relationshipSchema);
export default model;