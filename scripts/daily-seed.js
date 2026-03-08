// Daily seed script for t'day
// Creates posts for fake (unverified) users only
// Mirrors the logic from the original seeds/index.js

const mongoose = require('mongoose');

// Inline schemas so this script is self-contained (no TS imports needed)
const PostSchema = new mongoose.Schema({
  date: String,
  rating: { type: Number, required: true },
  body: String,
  image: { path: String, filename: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorCountry: String,
  authorUsername: String,
  authorGender: String,
  authorAgeGroup: String,
  authorID: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: Number,
  edited: Boolean,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });

// Real journal-like sentences (matching original seed data)
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

async function run() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error('ERROR: DB_URL environment variable is required');
    process.exit(1);
  }

  await mongoose.connect(dbUrl);
  console.log('Connected to DB');

  const User = mongoose.model('User', UserSchema);
  const Post = mongoose.model('Post', PostSchema);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  console.log('Today:', today);

  // ── Step 0: Reset all fake users so they can post today ──
  await User.updateMany({ isVerified: false }, {
    $set: { postedToday: false, todaysPost: '' }
  });
  console.log('Reset fake users for new day');

  // ── Step 1: Find fake users who haven't posted today ──
  const eligibleUsers = await User.find({ isVerified: false, postedToday: false });
  console.log('Found', eligibleUsers.length, 'eligible fake users');

  if (eligibleUsers.length === 0) {
    console.log('No eligible users found. They may have already posted today.');
    await mongoose.connection.close();
    return;
  }

  // ── Step 2: Also reset real (verified) users so they can post today ──
  // Don't create posts for them, just clear the flag
  await User.updateMany({ isVerified: true }, {
    $set: { postedToday: false, todaysPost: '' }
  });
  console.log('Reset real users so they can post today');

  // ── Step 3: Create posts for each eligible fake user ──
  // Faithfully ported from original seeds/index.js
  let created = 0;

  for (const user of eligibleUsers) {
    try {
      const rating = Math.floor(Math.random() * 5) + 1;
      const body = journalEntries[Math.floor(Math.random() * journalEntries.length)];

      const post = new Post({
        rating,
        body,
        date: today,
        author: user._id,
        authorID: user._id.toString(),
        authorCountry: user.country?.name || '',
        authorUsername: user.username,
        authorGender: user.gender || '',
        authorAgeGroup: user.ageGroup || '',
        comments: [],
        likes: 0,
        edited: false,
      });

      // Add image to ~50% of posts (matching original)
      if (created % 2 === 0) {
        post.image = { path: 'https://picsum.photos/350?random=' + Date.now() + created };
      }

      await post.save();

      // Update user: mark as posted, set todaysPost, push to posts array
      user.postedToday = true;
      user.posts.unshift(post._id);
      user.todaysPost = post._id.toString();

      // ── Update post streak (matching original logic exactly) ──
      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday = yesterday.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      const yesterdayPost = await Post.find({ author: user._id, date: yesterday });
      if (!yesterdayPost.length) {
        user.postStreak = 1;
      } else {
        user.postStreak = (user.postStreak || 0) + 1;
      }

      // ── Update user average rating (matching original logic) ──
      const avgResult = await Post.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      if (avgResult.length > 0) {
        await user.updateOne({ $set: { average: parseFloat(avgResult[0].avgRating.toFixed(2)) } });
      }

      await user.save();
      created++;

      if (created % 50 === 0) {
        console.log(`Created ${created} posts...`);
      }
    } catch (e) {
      console.log('Error for user', user.username, ':', e.message);
    }
  }

  console.log('\nCreated', created, 'posts for', today);
  await mongoose.connection.close();
}

run().catch(e => { console.error(e); process.exit(1); });
