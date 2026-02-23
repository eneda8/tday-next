import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IUser extends Document {
  username: string;
  email: string;
  hash: string;
  salt: string;
  ageGroup?: string;
  gender?: string;
  country?: {
    name: string;
    flag: string;
  };
  timezone?: string;
  defaultTimezone?: string;
  avatar?: {
    path: string;
    filename: string;
  };
  bio?: string;
  coverColor?: string;
  coverPhoto?: {
    path: string;
    filename: string;
  };
  posts?: mongoose.Types.ObjectId[];
  comments?: mongoose.Types.ObjectId[];
  journals?: mongoose.Types.ObjectId[];
  bookmarks?: mongoose.Types.ObjectId[];
  postedToday?: boolean;
  todaysPost?: string;
  postStreak?: number;
  average?: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isVerified?: boolean;
  verifyEmailToken?: string;
  verifyTokenExpires?: Date;
  termsAgreement?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserModel extends mongoose.Model<IUser> {
  authenticateUser(username: string, password: string): Promise<IUser | null>;
  hashPassword(password: string): { hash: string; salt: string };
}

const UserSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 1,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    hash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    ageGroup: String,
    gender: String,
    country: {
      name: String,
      flag: String,
    },
    timezone: String,
    defaultTimezone: String,
    avatar: {
      path: String,
      filename: String,
    },
    bio: String,
    coverColor: {
      type: String,
      default: "#343a40",
    },
    coverPhoto: {
      path: String,
      filename: String,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    journals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Journal",
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bookmark",
      },
    ],
    postedToday: {
      type: Boolean,
      default: false,
    },
    todaysPost: String,
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
  { timestamps: true }
);

// Static method to authenticate user with pbkdf2
UserSchema.statics.authenticateUser = async function (
  username: string,
  password: string
): Promise<IUser | null> {
  try {
    const user = await this.findOne({ username: username.toLowerCase() });

    if (!user) {
      return null;
    }

    // Verify password using pbkdf2 with passport-local-mongoose defaults
    // sha256, 25000 iterations, 512 byte key length
    const hash = crypto
      .pbkdf2Sync(password, user.salt, 25000, 512, "sha256")
      .toString("hex");

    if (hash === user.hash) {
      return user;
    }

    return null;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
};

// Static method to hash password with pbkdf2
UserSchema.statics.hashPassword = function (
  password: string
): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 25000, 512, "sha256")
    .toString("hex");

  return { hash, salt };
};

export default mongoose.models.User ||
  mongoose.model<IUser, IUserModel>("User", UserSchema);
