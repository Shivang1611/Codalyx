import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
ai.getGenerativeModel({model: "gemini-1.5-flash"}).generateContent("hello").then(r => console.log("SUCCESS")).catch(e => console.error("ERROR 1.5-flash:", e.message));

