import mongoose, { Schema, Document } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";

export interface IJournal extends Document {
  date: string;
  title?: string;
  body: string;
  author: mongoose.Types.ObjectId;
  edited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    date: { type: String },
    title: { type: String },
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Encrypt body and title fields (matches original Express app)
JournalSchema.plugin(fieldEncryption, {
  fields: ["body", "title"],
  secret: process.env.JOURNAL_SECRET || "",
});

// Force fresh model registration to ensure encryption plugin is always applied
// (Next.js hot reload can cache models without the plugin)
if (mongoose.models.Journal) {
  delete mongoose.models.Journal;
}

export default mongoose.model<IJournal>("Journal", JournalSchema);
