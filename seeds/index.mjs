// seeds/index.mjs — Seed script for tday-next
// Run: node seeds/index.mjs
// Requires: MONGODB_URI in .env.local or as environment variable

import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found. Create .env.local with MONGODB_URI.");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log("Database connected");

// Import models inline (since we can't use @ aliases in standalone scripts)
const UserSchema = new mongoose.Schema({}, { strict: false, collection: "users" });
const PostSchema = new mongoose.Schema({}, { strict: false, timestamps: true, collection: "posts" });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

const journalEntries = [
  "Had a great day at work today, feeling productive!",
  "Spent time with family, feeling grateful.",
  "Feeling a bit stressed about upcoming deadlines.",
  "Beautiful weather today, went for a nice walk.",
  "Cooked a new recipe for dinner, turned out amazing!",
  "Had some challenges today but pushed through.",
  "Feeling really happy and content with life right now.",
  "A bit tired today, need more rest.",
  "Made progress on my personal goals today.",
  "Enjoyed a quiet evening reading a good book.",
  "Had an interesting conversation with a friend.",
  "Feeling motivated and energized!",
  "Today was challenging but I learned something new.",
  "Grateful for the small moments of joy today.",
  "Feeling overwhelmed but taking it one step at a time.",
  "Had a productive morning workout.",
  "Enjoyed quality time with loved ones.",
  "Feeling creative and inspired today.",
  "A peaceful day with no major ups or downs.",
  "Accomplished everything on my to-do list!",
  "Feeling anxious about some things, but staying positive.",
  "Had a lovely coffee with a friend this morning.",
  "Work was intense today but rewarding.",
  "Feeling thankful for my health and wellbeing.",
  "Today was tough but tomorrow is a new day.",
  "Made someone smile today, that felt good.",
  "Feeling content and at peace.",
  "Had a breakthrough moment today!",
  "Spent the day doing things I love.",
  "Feeling blessed and fortunate.",
];

const today = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

console.log(`Seeding posts for ${today}...`);

let created = 0;
for (let i = 0; i < 500; i++) {
  try {
    const rating = Math.floor(Math.random() * 5) + 1;
    const body = journalEntries[Math.floor(Math.random() * journalEntries.length)];

    const user = await User.findOne({ isVerified: false, postedToday: false });
    if (!user) {
      console.log(`No more eligible users after ${created} posts.`);
      break;
    }

    const postData = {
      rating,
      body,
      date: today,
      author: user._id,
      authorUsername: user.username,
      authorCountry: user.country?.name || "",
      authorGender: user.gender || "",
      authorAgeGroup: user.ageGroup || "",
      authorID: user._id.toString(),
      comments: [],
      likes: 0,
      edited: false,
    };

    // 50% chance of image
    if (i % 2 === 0) {
      postData.image = {
        path: "https://picsum.photos/350?random",
        filename: "",
      };
    }

    const post = await Post.create(postData);

    // Update user
    await User.updateOne(
      { _id: user._id },
      {
        $set: { postedToday: true, todaysPost: post._id.toString() },
        $push: { posts: { $each: [post._id], $position: 0 } },
        $inc: { postStreak: 1 },
      }
    );

    // Recalculate average
    const avgResult = await Post.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    if (avgResult.length) {
      await User.updateOne(
        { _id: user._id },
        { $set: { average: parseFloat(avgResult[0].avgRating.toFixed(2)) } }
      );
    }

    created++;
  } catch (e) {
    console.log("Error:", e.message);
  }
}

console.log(`Done! Created ${created} posts for ${today}.`);
await mongoose.connection.close();
