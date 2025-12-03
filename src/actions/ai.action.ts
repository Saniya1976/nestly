"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate caption from text prompt
 */
export async function generateCaptionFromText(prompt: string) {
  try {
    if (!prompt.trim()) {
      return { success: false, error: "Prompt cannot be empty" };
    }

    if (!process.env.GROQ_API_KEY) {
      return { success: false, error: "AI service not configured. Please add GROQ_API_KEY to .env.local" };
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert social media content creator. Write SHORT, punchy, engaging captions.

RULES:
- Maximum 2 sentences or 25 words
- Be conversational and natural
- No clichés, no corporate speak
- No hashtags unless requested
- Start with impact
- Be authentic and relatable

Write like a real person, not a bot.`,
        },
        {
          role: "user",
          content: `Write a SHORT social media caption (max 2 sentences) about: ${prompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 150,
      top_p: 0.95,
    });

    const caption = completion.choices[0]?.message?.content?.trim() || "";

    if (!caption) {
      throw new Error("No caption generated");
    }

    return { success: true, caption };
  } catch (error: any) {
    console.error("Error generating caption from text:", error);
    return {
      success: false,
      error: error.message || "Failed to generate caption",
    };
  }
}

/**
 * Improve existing caption - make it shorter and punchier
 */
export async function improveCaption(currentCaption: string) {
  try {
    if (!currentCaption.trim()) {
      return { success: false, error: "Caption cannot be empty" };
    }

    if (!process.env.GROQ_API_KEY) {
      return { success: false, error: "AI service not configured. Please add GROQ_API_KEY to .env.local" };
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a social media editor who makes captions SHORTER and MORE IMPACTFUL.

RULES:
- Make it CRISP (maximum 2 sentences or 25 words)
- Keep the original meaning
- More punchy and engaging
- Remove fluff and filler words
- No clichés
- Natural and conversational

Transform boring into brilliant, but keep it SHORT.`,
        },
        {
          role: "user",
          content: `Make this caption SHORTER and more impactful (max 2 sentences):

"${currentCaption}"

Just give me the improved caption, nothing else.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.9,
    });

    const caption = completion.choices[0]?.message?.content?.trim() || "";

    if (!caption) {
      throw new Error("No improved caption generated");
    }

    return { success: true, caption };
  } catch (error: any) {
    console.error("Error improving caption:", error);
    return {
      success: false,
      error: error.message || "Failed to improve caption",
    };
  }
}