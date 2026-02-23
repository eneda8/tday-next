import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  date: string;
  rating: number;
  body?: string;
  image?: {
    path: string;
    filename: string;
  };
  author: mongoose.Types.ObjectId;
  authorCountry?: string;
  authorUsername?: string;
  authorGender?: string;
  authorAgeGroup?: string;
  authorID?: string;
  comments: mongoose.Types.ObjectId[];
  likes?: number;
  edited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    date: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, required: false },
    image: {
      path: String,
      filename: String,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorCountry: String,
    authorUsername: String,
    authorGender: String,
    authorAgeGroup: String,
    authorID: String,
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes: { type: Number, default: 0 },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Rating description virtual
PostSchema.virtual("desc").get(function () {
  const descriptions: Record<number, string> = {
    1: "Terrible",
    2: "Not good",
    3: "Average",
    4: "Very good",
    5: "Amazing",
  };
  return descriptions[this.rating] || "";
});

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
