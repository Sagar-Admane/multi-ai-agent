import mongoose from "mongoose";
const memorySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: "user",
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    embeddings: {
        type: [Number],
        required: true,
    },
    category: {
        type: String,
        default: "other",
    },
    isGoal: {
        type: Boolean,
        default: false,
    },
    goalProgress: {
        type: Number,
        default: 0
    },
    goalDeadline: {
        type: Date,
        default: null
    },
    isHabbit: {
        type: Boolean,
        default: false,
    },
    habbitFrequency: {
        type: String,
        default: "none"
    },
    habbitStreak: {
        type: Number,
        default: 0,
    },
    linkedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', default: null },
    importance: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
        default: 3
    },
    tags: {
        type: [String],
        default: []
    }
});
const model = mongoose.model("Memory", memorySchema);
export default model;
