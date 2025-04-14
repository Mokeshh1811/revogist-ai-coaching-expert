import OpenAI from "openai";
import CoachingOptions from "./Options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

/**
 * Main AI function that generates responses based on the prompt and recent conversation context.
 */
export const AIModel = async (topic, coachingOption, msg, previousMessages = []) => {
  try {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) throw new Error("Invalid coaching option");

    const PROMPT = option.prompt.replace("{user_topic}", topic);
    console.log("🔹 Using Prompt:", PROMPT);

    // Limit to last 2 messages if more were passed
    const messages = [
      { role: "system", content: PROMPT },
      ...previousMessages.slice(-2), // Only last two messages
      { role: "user", content: msg },
    ];

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages,
    });

    const message = completion?.choices?.[0]?.message?.content?.trim();
    console.log("🔹 AI Response:", message);

    if (!message) {
      throw new Error("AI returned an empty or invalid message.");
    }

    return message;
  } catch (error) {
    console.error("❌ AIModel Error:", error);
    return `❌ AI Error: ${error.message}`;
  }
};

/**
 * AI function to generate summarized feedback and notes from the full conversation.
 */
export const AIModelToGenerateFeedbackAndNotes = async (coachingOption, conversation) => {
  try {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) throw new Error("Invalid coaching option for summary");

    const PROMPT = option.summeryPrompt;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        ...conversation,
        { role: "assistant", content: PROMPT },
      ],
    });

    return completion?.choices?.[0]?.message;
  } catch (error) {
    console.error("❌ Summary Generation Error:", error);
    return { content: `❌ Error: ${error.message}` };
  }
};

/**
 * Converts text to speech using AWS Polly based on the expert's voice name.
 */
export const ConvertTextToSpeech = async (text, expertName) => {
  const pollyClient = new PollyClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
    },
  });

  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: expertName,
  });

  try {
    const { AudioStream } = await pollyClient.send(command);
    const audioArrayBuffer = await AudioStream.transformToByteArray();
    const audioBlob = new Blob([audioArrayBuffer], { type: "audio/mp3" });
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (e) {
    console.error("❌ Polly TTS Error:", e);
    return null;
  }
};
