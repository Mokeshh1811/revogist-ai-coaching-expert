import { NextResponse } from "next/server";
import { AIModel } from "../../../../services/GlobalServices";

export async function POST(req) {
  const { topic, coachingOption, msg, previousMessages } = await req.json();

  const message = await AIModel(topic, coachingOption, msg, previousMessages);
  return NextResponse.json({ message });
}
