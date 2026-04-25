// models/Memory.js

import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    default: ""
  },
  recent: {
    type: [String],
    default: []
  }
});

export default mongoose.model("Memory", memorySchema);