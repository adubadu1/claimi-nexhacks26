import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const PROFILE_COLUMNS = [
  "legal_first_name",
  "legal_last_name",
  "email",
  "phone_number",
  "street_address",
  "city",
  "state",
  "zip_code",
  "country",
  "date_of_birth",
  "employment_status",
  "employment_type",
  "occupation_category",
  "preferred_contact_method",
  "payout_preference",
  "terms_accepted",
  "privacy_policy_accepted",
  "ethnicity",
  "gender_identity",
  "disability_status",
  "onboarded",
].join(",");

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Not signed in" },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? "" },
    profile,
  });
}
