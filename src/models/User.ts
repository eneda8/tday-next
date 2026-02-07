import mongoose, { Schema, Document } from 'mongoose';
import { IUser, IAvatar, ICountry, ICoverPhoto, AgeGroup, Gender } from '@/types';

// Avatar sub-document schema
const AvatarSchema = new Schema<IAvatar>(
  {
    path: {
      type: String,
      default: 'https://res.cloudinary.com/dw3o86f8j/image/upload/v1634179812/t%27day/avatars/defaultAvatar2_qyqc9t.png',
    },
    filename: {
      type: String,
      default: "t'day/avatars/defaultAvatar2_qyqc9t.png",
    },
  },
  { _id: false }
);

// Virtual getter for thumbnail
AvatarSchema.virtual('thumbnail').get(function (this: IAvatar) {
  if (!this.path) return null;
  return this.path.replace('/upload', '/upload/w_200');
});

// Virtual getter for profile
AvatarSchema.virtual('profile').get(function (this: IAvatar) {
  if (!this.path) return null;
  return this.path;
});

// Country sub-document schema
const CountrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Cover photo sub-document schema
const CoverPhotoSchema = new Schema<ICoverPhoto>(
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

// Virtual getter for profile on CoverPhotoSchema
CoverPhotoSchema.virtual('profile').get(function (this: ICoverPhoto) {
  if (!this.path) return null;
  return this.path;
});

// User document interface for Mongoose
interface IUserDocument extends IUser, Document {}

// Main User schema
const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    password: {
      type: String,
      select: false,
    },
    ageGroup: {
      type: String,
      enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
    },
    country: CountrySchema,
    timezone: String,
    defaultTimezone: String,
    avatar: {
      type: AvatarSchema,
      default: {},
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    coverColor: String,
    coverPhoto: CoverPhotoSchema,
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    journals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Journal',
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    postedToday: {
      type: Boolean,
      default: false,
    },
    todaysPost: {
      type: String,
    },
    postStreak: {
      type: Number,
      default: 0,
    },
    average: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyEmailToken: String,
    verifyTokenExpires: Date,
    termsAgreement: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation in Next.js
const User = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
export type { IUserDocument };
