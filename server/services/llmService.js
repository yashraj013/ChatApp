import OpenAI from "openai";

const SYSTEM_PROMPT =
  "You are a helpful assistant. Be concise, accurate, and friendly.";

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

export const buildChatPayload = (history, userMessage) => {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];
};

export const generateAssistantReply = async (messages) => {
  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    throw new Error(`OpenAI request failed: ${error.message}`);
  }
};