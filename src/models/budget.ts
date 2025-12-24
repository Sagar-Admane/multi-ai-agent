import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    budget : {
        type : Number,
        required : true
    },
    month : {
        type : String,
        required : true
    },
    year : {
        type : Number,
        required : true
    },
    updatedAt : {
        type : Date
    }
}, {timestamps : true});

const budgetModel = mongoose.model("Budget", budgetSchema);

export default budgetModel;