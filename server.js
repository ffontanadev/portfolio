/**
 * Simple local development server for the chat API endpoint
 * Run with: node server.js
 */

import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { MARKDOWN_RESUME } from "./src/constants/index.ts";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are a helpful AI assistant for Felipe Fontana's portfolio website.

Your role is to:
- Provide information about Felipe's skills, projects, experience, and background
- Answer questions professionally and concisely
- Be friendly and approachable
- If asked about topics outside Felipe's portfolio, politely redirect the conversation

Here is Felipe's resume for context:

${MARKDOWN_RESUME}

Guidelines:
- Keep responses concise (2-3 sentences when possible)
- Use natural, conversational language
- Highlight relevant experience when asked about specific technologies
- If you don't have specific information, be honest about it
- Encourage visitors to reach out via the contact information provided`;

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY environment variable not set");
      return res.status(500).json({
        error: "Server configuration error",
        details: "API key not configured",
      });
    }

    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid request: message is required" });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey });

    // Convert conversation history to Claude format
    const recentHistory = conversationHistory.slice(-10);
    const messages = [
      ...recentHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    // Extract the assistant's reply
    const reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : "Sorry, I encountered an error generating a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Error in chat API:", error);

    if (error instanceof Anthropic.APIError) {
      return res.status(error.status || 500).json({
        error: "AI service error",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Chat API server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/chat\n`);
});
