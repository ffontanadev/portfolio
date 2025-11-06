import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error calling Groq API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
