import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      questionnaireVersion,
      answers,
      result
    } = body;

    if (
      !questionnaireVersion ||
      !Array.isArray(answers) ||
      answers.length !== 48 ||
      !result?.type ||
      !result?.dims
    ) {
      return NextResponse.json(
        { error: "Invalid assessment data" },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    if (!db) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    // 1. Create assessment session
    const {
      data: session,
      error: sessionError
    } = await db
      .from("assessment_sessions")
      .insert({
        questionnaire_version: questionnaireVersion,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // 2. Save all 48 answers
    const responseRows = answers.map((answer, index) => ({
      session_id: session.id,
      question_no: index + 1,
      answer
    }));

    const {
      error: responsesError
    } = await db
      .from("responses")
      .insert(responseRows);

    if (responsesError) {
      throw responsesError;
    }

    // 3. Save calculated result
    const {
      error: resultError
    } = await db
      .from("assessment_results")
      .insert({
        session_id: session.id,
        closest_type: result.type,
        ei_score: result.dims.EI,
        sn_score: result.dims.SN,
        tf_score: result.dims.TF,
        jp_score: result.dims.JP
      });

    if (resultError) {
      throw resultError;
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error("Assessment save error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to save assessment"
      },
      { status: 500 }
    );
  }
}