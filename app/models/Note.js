import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String },
  category: { type: String },
  selectedColor: { type: String },
}, { timestamps: true });

export default mongoose.model("Note", NoteSchema);
