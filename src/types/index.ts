import mongoose from 'mongoose';

// Enums and helper types
export type AgeGroup = '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
export type Gender = 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
export type RatingDescription = 'Terrible' | 'Not good' | 'Average' | 'Very good' | 'Amazing';
export type Rating = 1 | 2 | 3 | 4 | 5;

// Avatar interface for user avatar sub-document
export interface IAvatar {
  path: string;
  filename: string;
}

// Country interface for user country sub-document
export interface ICountry {
  name: string;
  flag?: string;
}

// Cover photo interface for user cover photo sub-document
export interface ICoverPhoto {
  path?: string;
  filename?: string;
  position?: string;
}

// Image interface for post image sub-document
export interface IImage {
  path?: string;
  filename?: string;
}

// User interface (without _id - Mongoose Document adds it)
export interface IUser {
  email: string;
  username: string;
  password?: string;
  ageGroup?: AgeGroup;
  gender?: Gender;
  country?: ICountry;
  timezone?: string;
  defaultTimezone?: string;
  avatar?: IAvatar;
  bio?: string;
  coverColor?: string;
  coverPhoto?: ICoverPhoto;
  posts: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  journals: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  postedToday: boolean;
  todaysPost?: string;
  postStreak: number;
  average: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isVerified: boolean;
  verifyEmailToken?: string;
  verifyTokenExpires?: Date;
  termsAgreement: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Post interface
export interface IPost {
  date?: string;
  rating: number;
  body?: string;
  image?: IImage;
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

// Journal interface
export interface IJournal {
  date?: string;
  title?: string;
  body: string;
  author: mongoose.Types.ObjectId;
  edited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Comment interface
export interface IComment {
  body: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Rating description mapping utility
export const RATING_DESCRIPTIONS: Record<Rating, RatingDescription> = {
  1: 'Terrible',
  2: 'Not good',
  3: 'Average',
  4: 'Very good',
  5: 'Amazing',
};
