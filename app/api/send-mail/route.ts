import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Client as PostmarkClient } from "postmark";

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Supabase credentials are not set.");
}
if (!process.env.POSTMARK_API_KEY) {
  throw new Error("Postmark API key is not set.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const postmark = new PostmarkClient(process.env.POSTMARK_API_KEY);

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    let data;
    try {
      data = await req.json();
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err?.message || "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const {
      userFirstName,
      referredUserName,
      courseName,
      currency,
      referralAmount,
      email,
    } = data;

    // Basic field validation
    if (
      !userFirstName ||
      !referredUserName ||
      !courseName ||
      !currency ||
      !referralAmount ||
      !email
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing, error: fetchError } = await supabase
      .from("referrals")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (fetchError) {
      console.error("Error checking existing email:", fetchError.message);
      return NextResponse.json(
        { success: false, error: "Database lookup failed." },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already exists." },
        { status: 409 } // Conflict
      );
    }

    // Send email
    let emailResponse;
    try {
      emailResponse = await postmark.sendEmailWithTemplate({
        From: "emmanuel.akinbo@huntrsync.com",
        To: email,
        TemplateAlias: "medbuddy_referral_followup",
        TemplateModel: {
          user_first_name: userFirstName,
          referred_user_name: referredUserName,
          course_name: courseName,
          currency,
          referral_value: referralAmount,
          referral_tracking_page_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app/referrals`,
          recipient: email,
        },
      });
    } catch (emailError) {
      console.error("Postmark send error:", emailError);
      return NextResponse.json(
        { success: false, error: "Failed to send email." },
        { status: 502 }
      );
    }

    if (emailResponse?.Message !== "OK") {
      return NextResponse.json(
        { success: false, error: "Email not acknowledged by Postmark." },
        { status: 502 }
      );
    }

    // Save to Supabase
    const { error: insertError } = await supabase.from("referrals").insert([
      {
        user_first_name: userFirstName,
        referred_user_name: referredUserName,
        course_name: courseName,
        currency,
        referral_value: referralAmount,
        email,
      },
    ]);

    if (insertError) {
      console.error("Database insert error:", insertError.message);
      return NextResponse.json(
        { success: false, error: "Failed to save referral to database." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
