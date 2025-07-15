// models/Summary.ts

import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema({
  originalText: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Summary =
  mongoose.models.Summary || mongoose.model("Summary", SummarySchema);
