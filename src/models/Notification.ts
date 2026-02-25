import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: "comment";
  fromUser: mongoose.Types.ObjectId;
  fromUsername: string;
  post?: mongoose.Types.ObjectId;
  postDate?: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["comment"], required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromUsername: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    postDate: String,
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
