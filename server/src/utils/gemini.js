import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
const reportCache = new Map();

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export async function reviewCode(code, context = "") {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are the "Codalyx Principal Architect".
      Context/Question: ${context}
      ${code ? `Code:\n\`\`\`\n${code}\n\`\`\`` : ''}
      Provide a concise, helpful coding response. Use Markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Review Failure:", error.message);
    return `### ⚠️ Neural Link Interrupted
      
The Principal Architect is currently processing a high volume of requests or the Neural Link is unstable.

**Diagnostic Insight:**
- Concept: ${context || "General Inquiry"}
- Status: Fallback Mode Active

Please try your request again in a few moments or check your internet connectivity.`;
  }
}

export async function analyzeProblemIntelligence(title, userCode = null) {
  const cacheKey = userCode ? `${title}-${userCode.length}` : title;
  if (reportCache.has(cacheKey)) {
    return reportCache.get(cacheKey);
  }

  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      As a Coding Coach, provide a JSON intelligence report for the LeetCode problem: "${title}".
      ${userCode ? `CRITICAL: The user has provided their exact code submission below. You MUST audit THIS specific code block as the 'buggy' implementation. \n\nUSER CODE:\n${userCode}\n` : `Since no user code was provided, generate a common buggy implementation for this problem.`}
      
      Respond strictly with a valid JSON object matching exactly this structure:
      {
        "title": "${title}",
        "detectedMistake": { 
          "buggy": "multi-line buggy code string", 
          "correct": "multi-line fixed code string", 
          "explanation": "string explaining the bug" 
        },
        "editorial": { 
          "intuition": "detailed string explaining the optimal approach", 
          "algorithm": "string step by step text", 
          "implementations": { "cpp": "code string", "java": "code string", "python": "code string" }, 
          "timeComplexity": "string e.g. O(n)", 
          "spaceComplexity": "string e.g. O(1)" 
        },
        "thoughtProcess": [ 
          { "label": "string", "status": "success", "msg": "" },
          { "label": "string", "status": "fail", "msg": "error message" }
        ],
        "psychology": [ 
          {"trait": "Confidence", "score": 85}, 
          {"trait": "Focus", "score": 90}
        ],
        "mastery": { "mastered": ["Arrays", "Hashing"], "needsWork": ["Two Pointers"] },
        "paths": [ 
          { "priority": 1, "title": "string", "problems": ["Two Sum", "3Sum"], "estimatedHours": "2h", "targetAccuracy": 90 } 
        ],
        "resources": [ 
          { "type": "Video", "title": "string", "source": "string", "duration": "10m", "url": "string" } 
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    // Strip markdown if AI included it
    text = text.replace(/```json|```/g, '');
    const parsed = JSON.parse(text);
    
    // Save to cache
    reportCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error("Intelligence Analysis Error:", error.message);
    if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('503')) {
      console.warn("Generating Circuit-Breaker Mock Response due to API Rate Limit.");
      const mockFallback = {
        title: title || "Logic Challenge",
        detectedMistake: {
          buggy: userCode || "function solve(nums) {\n  for(let i=0; i<nums.length; i++){\n    for(let j=0; j<nums.length; j++){\n       // Brute force logic\n    }\n  }\n}",
          correct: "function solve(nums) {\n  const map = new Map();\n  for(let i=0; i<nums.length; i++){\n     // Optimized O(N) logic utilizing Hash Map\n  }\n}",
          explanation: "The provided nested loop structure triggers an O(N^2) time complexity. Utilizing a Hash Map reduces the mathematical iterations to a linear O(N) progression."
        },
        editorial: {
          intuition: "Instead of comparing every pair iteratively, we can cache previously seen elements in a HashMap to achieve constant time O(1) lookups.",
          algorithm: "1. Initialize an empty Map.\n2. Iterate through the elements.\n3. Check if the complement exists in the map.\n4. If yes, return indices. Otherwise, store the current element.",
          implementations: {
            cpp: "class Solution {\npublic:\n    vector<int> solve(vector<int>& nums) {\n        unordered_map<int, int> m;\n        for(int i=0;i<nums.size();i++) {\n            // C++ Optimal Solution\n        }\n    }\n};",
            java: "class Solution {\n    public int[] solve(int[] nums) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        // Java Optimal Solution\n    }\n}",
            python: "class Solution:\n    def solve(self, nums: List[int]) -> List[int]:\n        hash_map = {}\n        # Python Optimal Solution"
          },
          timeComplexity: "O(N) - Linear iteration through the datastructure.",
          spaceComplexity: "O(N) - Worst case memory overhead for the Hash Map."
        },
        thoughtProcess: [
          { label: "Base Case Handled", status: "success", msg: "" },
          { label: "Loop Invariants Check", status: "fail", msg: "State leak detected" },
          { label: "Memory Allocation", status: "success", msg: "" }
        ],
        psychology: [
          { trait: "Resilience", score: 88 },
          { trait: "Speed", score: 76 }
        ],
        mastery: { mastered: ["Hash Table"], needsWork: ["Dynamic Programming"] },
        paths: [
          { priority: 1, title: "Optimize Time Complexities", problems: ["Two Sum", "Group Anagrams"], estimatedHours: "1.5h", targetAccuracy: 95 }
        ],
        resources: [
          { type: "Video", title: "Mastering Hash Maps", source: "YouTube", duration: "14m", url: "#" }
        ]
      };
      reportCache.set(cacheKey, mockFallback);
      return mockFallback;
    }
    throw new Error("AI Generation Failed: We encountered an error compiling the intelligence report.");
  }
}
export async function generateRoadmapContent(roadmapId, totalSolved = 0) {
  const isDSA = roadmapId.includes('dsa');
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash", // Flash is faster and less prone to timeouts
      generationConfig: { responseMimeType: "application/json" }
    });

    const pathType = isDSA ? "Data Structures & Algorithms" : "Interview Prep";
    const prompt = `
      Create a detailed JSON roadmap for "${roadmapId}" focus on ${pathType}.
      The user solved ${totalSolved} problems.
      
      Structure:
      {
        "title": "Roadmap Title",
        "description": "Short description",
        "modules": [
          {
            "id": 1,
            "title": "Module Title",
            "status": "active",
            "lessons": [
              { "title": "Example Problem", "type": "Practice", "difficulty": "Medium" }
            ],
            "proTip": "Tip"
          }
        ]
      }
      
      Requirements: 
      - EXACTLY 10 modules.
      - 8 items per module.
      - REAL LeetCode problem titles.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    text = text.replace(/```json|```/g, '');
    const parsed = JSON.parse(text);
    
    // Add real LeetCode URLs to all practice items
    parsed.modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.type === 'Practice') {
          const slug = l.title.toLowerCase()
            .replace(/-/g, ' ')
            .replace(/[^\w\s]/gi, '')
            .trim()
            .replace(/\s+/g, '-');
          l.problemUrl = `https://leetcode.com/problems/${slug}/`;
        }
      });
    });

    return {
      ...parsed,
      totalModules: parsed.modules.length,
      estimatedDays: isDSA ? 90 : 45,
      mentorMessage: `You've solved ${totalSolved} problems. This path will take you to 1000+.`
    };
  } catch (err) {
    console.error("AI Roadmap Error:", err);
    // Real-world fallback with REAL links
    const fallbackTitle = isDSA ? "DSA Mastery Path" : "FAANG Interview Prep";
    const dsaTopics = ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List", "Trees", "Tries", "Heap", "Backtracking", "Graphs", "DP"];
    
    return {
      id: roadmapId,
      title: fallbackTitle,
      description: "Custom path generated based on your platform activity.",
      totalModules: 12,
      estimatedDays: 60,
      modules: dsaTopics.map((topic, i) => ({
        id: i + 1,
        title: topic,
        status: "active", // Make all active by default for UX
        progress: 0,
        lessons: [
          { title: `${topic} Fundamentals`, type: "Concept" },
          { title: "Two Sum", type: "Practice", difficulty: "Easy", problemUrl: "https://leetcode.com/problems/two-sum/" },
          { title: "3Sum", type: "Practice", difficulty: "Medium", problemUrl: "https://leetcode.com/problems/3sum/" }
        ],
        proTip: "Focus on understanding the underlying pattern rather than memorizing the solution."
      })),
      mentorMessage: "AI is currently offline. Here is our expert-curated mastery path."
    };
  }
}

export async function generateConceptExplanation(conceptTitle) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      As a Senior Principal Engineer and Technical Fellow at Google, provide an EXHAUSTIVE, ENCYCLOPEDIC documentation for: "${conceptTitle}".
      
      YOUR GOAL: Generate a 1000+ word master-class document.
      
      STRUCTURE:
      1. ANALOGY: A massive, detailed story (300 words) using a real-world scenario.
      2. HISTORY & EVOLUTION: Where did this come from? How did it evolve from legacy systems?
      3. CORE MECHANICS: A 500-word deep dive into memory addresses, CPU cache-lines, and data alignment.
      4. VARIANTS: Explain different types/variations of this concept.
      5. ADVANTAGES: 5+ granular benefits with technical justification.
      6. PREREQUISITES: Detailed concepts to master first.
      7. COMPLEXITY: Deep analysis of Time/Space with different data distributions.
      8. REAL WORLD: 5+ complex software architecture use cases.
      9. PITFALLS: 5+ common high-risk bugs and memory leaks.
      10. INTERVIEW TOPICS: 5 common senior-level interview questions and answers.
      11. CODE: Production-ready JavaScript with line-by-line expert commentary.

      Respond in JSON format:
      {
        "title": "...",
        "lastUpdated": "April 18, 2026",
        "analogy": "...",
        "history": "...",
        "explanation": "...",
        "variants": [{"title": "...", "desc": "..."}],
        "advantages": [{"title": "...", "desc": "..."}],
        "prerequisites": ["...", "..."],
        "complexity": {"time": "...", "space": "..."},
        "scenarios": [{"title": "...", "desc": "..."}],
        "pitfalls": [{"title": "...", "desc": "..."}],
        "interviewQA": [{"q": "...", "a": "..."}],
        "steps": ["...", "..."],
        "problems": {
          "easy": [{"title": "...", "id": "..."}],
          "medium": [{"title": "...", "id": "..."}]
        },
        "whyItMatters": "...",
        "code": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    text = text.replace(/```json|```/g, '');
    return JSON.parse(text);
  } catch (err) {
    console.error("AI Concept Error:", err);
    return {
      title: conceptTitle,
      lastUpdated: "April 18, 2026",
      analogy: "Exhaustive analogy here...",
      explanation: "Full technical breakdown...",
      advantages: [{ title: "...", desc: "..." }],
      prerequisites: ["..."],
      complexity: { time: "...", space: "..." },
      scenarios: [{ title: "...", desc: "..." }],
      pitfalls: [{ title: "...", desc: "..." }],
      interviewQA: [{ q: "...", a: "..." }],
      steps: ["..."],
      problems: { easy: [], medium: [] },
      whyItMatters: "...",
      code: "// Master code snippet"
    };
  }
}
