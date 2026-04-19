export const blind75Problems = Object.values({
  "1": {
    "title": "Two Sum",
    "difficulty": "Easy"
  },
  "121": {
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy"
  },
  "217": {
    "title": "Contains Duplicate",
    "difficulty": "Easy"
  },
  "238": {
    "title": "Product of Array Except Self",
    "difficulty": "Medium"
  },
  "53": {
    "title": "Maximum Subarray",
    "difficulty": "Medium"
  },
  "152": {
    "title": "Maximum Product Subarray",
    "difficulty": "Medium"
  },
  "33": {
    "title": "Search in Rotated Sorted Array",
    "difficulty": "Medium"
  },
  "15": {
    "title": "3Sum",
    "difficulty": "Medium"
  },
  "153": {
    "title": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium"
  },
  "371": {
    "title": "Sum of Two Integers",
    "difficulty": "Medium"
  },
  "11": {
    "title": "Container With Most Water",
    "difficulty": "Medium"
  },
  "191": {
    "title": "Number of 1 Bits",
    "difficulty": "Easy"
  },
  "338": {
    "title": "Counting Bits",
    "difficulty": "Easy"
  },
  "268": {
    "title": "Missing Number",
    "difficulty": "Easy"
  },
  "70": {
    "title": "Climbing Stairs",
    "difficulty": "Easy"
  },
  "322": {
    "title": "Coin Change",
    "difficulty": "Medium"
  },
  "190": {
    "title": "Reverse Bits",
    "difficulty": "Easy"
  },
  "1143": {
    "title": "Longest Common Subsequence",
    "difficulty": "Medium"
  },
  "300": {
    "title": "Longest Increasing Subsequence",
    "difficulty": "Medium"
  },
  "139": {
    "title": "Word Break",
    "difficulty": "Medium"
  },
  "377": {
    "title": "Combination Sum IV",
    "difficulty": "Medium"
  },
  "198": {
    "title": "House Robber",
    "difficulty": "Medium"
  },
  "213": {
    "title": "House Robber II",
    "difficulty": "Medium"
  },
  "62": {
    "title": "Unique Paths",
    "difficulty": "Medium"
  },
  "55": {
    "title": "Jump Game",
    "difficulty": "Medium"
  },
  "133": {
    "title": "Clone Graph",
    "difficulty": "Medium"
  },
  "207": {
    "title": "Course Schedule",
    "difficulty": "Medium"
  },
  "417": {
    "title": "Pacific Atlantic Water Flow",
    "difficulty": "Medium"
  },
  "200": {
    "title": "Number of Islands",
    "difficulty": "Medium"
  },
  "128": {
    "title": "Longest Consecutive Sequence",
    "difficulty": "Medium"
  },
  "91": {
    "title": "Decode Ways",
    "difficulty": "Medium"
  },
  "57": {
    "title": "Insert Interval",
    "difficulty": "Medium"
  },
  "56": {
    "title": "Merge Intervals",
    "difficulty": "Medium"
  },
  "435": {
    "title": "Non-overlapping Intervals",
    "difficulty": "Medium"
  }
}).map(p => ({
  title: p.title,
  difficulty: p.difficulty,
  topic: 'Blind 75',
  url: `https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}));
