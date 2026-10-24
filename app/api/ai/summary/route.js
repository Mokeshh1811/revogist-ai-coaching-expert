import { NextResponse } from "next/server";
import { AIModelToGenerateFeedbackAndNotes } from "../../../../services/GlobalServices";

export async function POST(req) {
  const { coachingOption, conversation } = await req.json();

  const result = await AIModelToGenerateFeedbackAndNotes(coachingOption, conversation);
  return NextResponse.json(result);
}
