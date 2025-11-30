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

const relationshipModel = new mongoose.Model("relationshiipModel", relationshipSchema);
export default relationshipModel;