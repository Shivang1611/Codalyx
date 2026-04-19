import 'dotenv/config'
import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you online?");
    console.log("SUCCESS:", result.response.text());
  } catch (err) {
    console.error("TEST FAILED:", err.message);
    if (err.message.includes("404")) {
       console.log("TRYING gemini-pro...");
       try {
         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
         const result = await model.generateContent("Hello, are you online?");
         console.log("SUCCESS WITH gemini-pro:", result.response.text());
       } catch (err2) {
         console.error("ALL MODELS FAILED:", err2.message);
       }
    }
  }
}

test();
