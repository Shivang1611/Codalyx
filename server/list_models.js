import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await ai.models; // Wait, ListModels is not exposed directly in this version of the SDK, or maybe it is?
    // In SDK 0.24, there's no native listModels. We can do a raw fetch though!
  } catch(e) {}
}

async function fetchModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
}
fetchModels();
