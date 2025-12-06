import mongoose from "mongoose";
const episodicSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60 * 60 * 24
    }
});
const model = mongoose.model("Episodic", episodicSchema);
export default model;
