import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function toNull(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
}

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body?.date_of_birth) {
      return NextResponse.json(
        { error: "date_of_birth is required" },
        { status: 400 }
      );
    }
    if (!body?.terms_accepted || !body?.privacy_policy_accepted) {
      return NextResponse.json(
        { error: "Terms and privacy policy must be accepted" },
        { status: 400 }
      );
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      legal_first_name: toNull(body.legal_first_name),
      legal_last_name: toNull(body.legal_last_name),
      email: toNull(body.email),
      phone_number: toNull(body.phone_number),
      street_address: toNull(body.street_address),
      city: toNull(body.city),
      state: toNull(body.state),
      zip_code: toNull(body.zip_code),
      country: toNull(body.country),
      date_of_birth: toNull(body.date_of_birth),
      employment_status: toNull(body.employment_status),
      employment_type: toNull(body.employment_type),
      occupation_category: toNull(body.occupation_category),
      preferred_contact_method: toNull(body.preferred_contact_method),
      payout_preference: toNull(body.payout_preference),
      terms_accepted: Boolean(body.terms_accepted),
      privacy_policy_accepted: Boolean(body.privacy_policy_accepted),
      ethnicity: toNull(body.ethnicity),
      gender_identity: toNull(body.gender_identity),
      disability_status: toNull(body.disability_status),
      onboarded: true,
    });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Claimi] /api/auth/profile", e);
    return NextResponse.json(
      { error: e?.message || "Save failed" },
      { status: 500 }
    );
  }
}
