import mongoose, { Schema, Document } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { IJournal } from '@/types';

// Journal document interface for Mongoose
interface IJournalDocument extends IJournal, Document {}

// Main Journal schema
const JournalSchema = new Schema<IJournalDocument>(
  {
    date: {
      type: String,
    },
    title: {
      type: String,
    },
    body: {
      type: String,
      required: [true, 'Journal body is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add field encryption plugin
const secret = process.env.JOURNAL_SECRET || 'default-journal-secret-key';

JournalSchema.plugin(fieldEncryption, {
  fields: ['title', 'body'],
  secret: secret,
});

// Indexes for performance
JournalSchema.index({ author: 1 });
JournalSchema.index({ date: -1 });
JournalSchema.index({ createdAt: -1 });

// Prevent recompilation in Next.js
const Journal = mongoose.models.Journal || mongoose.model<IJournalDocument>('Journal', JournalSchema);

export default Journal;
export type { IJournalDocument };
