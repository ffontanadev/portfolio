/**
 * Serverless API endpoint for Claude chat integration
 * Compatible with Vercel/Netlify serverless functions
 *
 * Environment variables required:
 * - ANTHROPIC_API_KEY: Your Anthropic API key
 */

import Anthropic from "@anthropic-ai/sdk";
import { MARKDOWN_RESUME } from "../src/constants/index";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory: ChatMessage[];
}

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

export default async function handler(req: Request) {
  // CORS headers for local development
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY environment variable not set");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          details: "API key not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request: message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey,
    });

    // Convert conversation history to Claude format
    // Limit history to last 10 messages to avoid token limits
    const recentHistory = conversationHistory.slice(-10);
    const messages = [
      ...recentHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
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

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat API:", error);

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return new Response(
        JSON.stringify({
          error: "AI service error",
          details: error.message,
        }),
        {
          status: error.status || 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generic error response
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Vercel Edge Function export
export const config = {
  runtime: "edge",
};
