import mongoose, { Schema, Document } from "mongoose";

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

// NOTE: The original app uses mongoose-field-encryption to encrypt body/title.
// If you need to read existing encrypted journals, install mongoose-field-encryption:
//   npm install mongoose-field-encryption
// Then uncomment:
// import { fieldEncryption } from "mongoose-field-encryption";
// JournalSchema.plugin(fieldEncryption, {
//   fields: ["body", "title"],
//   secret: process.env.JOURNAL_SECRET || "",
// });

export default mongoose.models.Journal ||
  mongoose.model<IJournal>("Journal", JournalSchema);
