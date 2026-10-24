import { NextResponse } from "next/server";
import { ConvertTextToSpeech } from "../../../../services/GlobalServices";

export async function POST(req) {
  const { text, expertName } = await req.json();

  try {
    const audioBytes = await ConvertTextToSpeech(text, expertName);
    return new NextResponse(audioBytes, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (e) {
    console.error("❌ Polly TTS Error:", e);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
