import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'src', '..', '.env') });
import { Sheet } from './src/models/Sheet.js';

const blind75Data = {
  "1": { "title": "Two Sum", "difficulty": "Easy" },
  "121": { "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy" },
  "217": { "title": "Contains Duplicate", "difficulty": "Easy" },
  "238": { "title": "Product of Array Except Self", "difficulty": "Medium" },
  "53": { "title": "Maximum Subarray", "difficulty": "Medium" },
  "152": { "title": "Maximum Product Subarray", "difficulty": "Medium" },
  "33": { "title": "Search in Rotated Sorted Array", "difficulty": "Medium" },
  "15": { "title": "3Sum", "difficulty": "Medium" },
  "153": { "title": "Find Minimum in Rotated Sorted Array", "difficulty": "Medium" },
  "371": { "title": "Sum of Two Integers", "difficulty": "Medium" },
  "11": { "title": "Container With Most Water", "difficulty": "Medium" },
  "191": { "title": "Number of 1 Bits", "difficulty": "Easy" },
  "338": { "title": "Counting Bits", "difficulty": "Easy" },
  "268": { "title": "Missing Number", "difficulty": "Easy" },
  "70": { "title": "Climbing Stairs", "difficulty": "Easy" },
  "322": { "title": "Coin Change", "difficulty": "Medium" },
  "190": { "title": "Reverse Bits", "difficulty": "Easy" },
  "1143": { "title": "Longest Common Subsequence", "difficulty": "Medium" },
  "300": { "title": "Longest Increasing Subsequence", "difficulty": "Medium" },
  "139": { "title": "Word Break", "difficulty": "Medium" },
  "377": { "title": "Combination Sum IV", "difficulty": "Medium" },
  "198": { "title": "House Robber", "difficulty": "Medium" },
  "213": { "title": "House Robber II", "difficulty": "Medium" },
  "62": { "title": "Unique Paths", "difficulty": "Medium" },
  "55": { "title": "Jump Game", "difficulty": "Medium" },
  "133": { "title": "Clone Graph", "difficulty": "Medium" },
  "207": { "title": "Course Schedule", "difficulty": "Medium" },
  "417": { "title": "Pacific Atlantic Water Flow", "difficulty": "Medium" },
  "200": { "title": "Number of Islands", "difficulty": "Medium" },
  "128": { "title": "Longest Consecutive Sequence", "difficulty": "Medium" },
  "91": { "title": "Decode Ways", "difficulty": "Medium" },
  "57": { "title": "Insert Interval", "difficulty": "Medium" },
  "56": { "title": "Merge Intervals", "difficulty": "Medium" },
  "435": { "title": "Non-overlapping Intervals", "difficulty": "Medium" }
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const problems = Object.values(blind75Data).map(p => ({
      title: p.title,
      difficulty: p.difficulty,
      topic: 'Blind 75 Core',
      url: `https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    }));

    const sheet = await Sheet.findOne({ title: 'Blind 75', type: 'curated' });
    if (sheet) {
      sheet.problems = problems;
      sheet.totalProblems = problems.length;
      await sheet.save();
      console.log('Updated existing Blind 75 sheet!');
    } else {
      await Sheet.create({
        title: 'Blind 75',
        description: 'The og interview prep list. Tech workers favorite.',
        totalProblems: problems.length,
        type: 'curated',
        isPublic: true,
        problems
      });
      console.log('Created new Blind 75 sheet!');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
