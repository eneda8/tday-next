import mongoose, { Schema, Document } from 'mongoose';
import { IComment } from '@/types';

// Comment document interface for Mongoose
interface ICommentDocument extends IComment, Document {}

// Main Comment schema
const CommentSchema = new Schema<ICommentDocument>(
  {
    body: {
      type: String,
      required: [true, 'Comment body is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
CommentSchema.index({ post: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ createdAt: -1 });

// Prevent recompilation in Next.js
const Comment = mongoose.models.Comment || mongoose.model<ICommentDocument>('Comment', CommentSchema);

export default Comment;
export type { ICommentDocument };
