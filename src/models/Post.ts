import mongoose, { Schema, Document } from 'mongoose';
import { IPost, IImage, RatingDescription } from '@/types';

// Image sub-document schema
const ImageSchema = new Schema<IImage>(
  {
    path: {
      type: String,
    },
    filename: {
      type: String,
    },
  },
  { _id: false }
);

// Virtual getter for thumbnail
ImageSchema.virtual('thumbnail').get(function (this: IImage) {
  if (!this.path) return null;
  return this.path.replace('/upload', '/upload/w_200');
});

// Virtual getter for fullsize
ImageSchema.virtual('fullsize').get(function (this: IImage) {
  if (!this.path) return null;
  return this.path.replace('/upload', '/upload/c_fill_pad,g_auto,w_800,h_800');
});

// Post document interface for Mongoose
interface IPostDocument extends IPost, Document {}

// Main Post schema
const PostSchema = new Schema<IPostDocument>(
  {
    date: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    body: {
      type: String,
      required: false,
    },
    image: ImageSchema,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    authorCountry: String,
    authorUsername: String,
    authorGender: String,
    authorAgeGroup: String,
    authorID: String,
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likes: {
      type: Number,
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

// Virtual getter for description
PostSchema.virtual('desc').get(function (this: IPostDocument) {
  const ratingDescriptions: Record<number, RatingDescription> = {
    1: 'Terrible',
    2: 'Not good',
    3: 'Average',
    4: 'Very good',
    5: 'Amazing',
  };
  return ratingDescriptions[this.rating] || 'Unknown';
});

// Indexes for performance
PostSchema.index({ author: 1 });
PostSchema.index({ date: -1 });
PostSchema.index({ createdAt: -1 });

// Prevent recompilation in Next.js
const Post = mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);

export default Post;
export type { IPostDocument };
