import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Supabase credentials are not set.");
}
if (!process.env.RESEND_API_KEY) {
  throw new Error("Resend API key is not set.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

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
    try {
      await resend.emails.send({
        from: "Emmanuel Akinbo <emmanuel.akinbo@huntrsync.com>",
        to: email,
        subject: "You've been referred to MedBuddy!",
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); padding: 30px;">
      <h2 style="color: #1a202c;">Hi ${userFirstName},</h2>
      <p style="font-size: 16px; color: #4a5568; line-height: 1.5;">
        <strong>${referredUserName}</strong> has referred you to join the course 
        <strong>${courseName}</strong> on MedBuddy.
      </p>
      <p style="font-size: 16px; color: #4a5568; line-height: 1.5;">
        As a reward, you’re eligible to earn <strong>${currency}${referralAmount}</strong> when you participate.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/app/referrals" 
           style="display: inline-block; background-color: #2b6cb0; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
          Track Your Referral
        </a>
      </div>
      <p style="font-size: 14px; color: #718096;">
        If you have any questions, feel free to reach out to our support team.
      </p>
      <p style="font-size: 14px; color: #a0aec0; margin-top: 30px;">
        — The MedBuddy Team
      </p>
    </div>
  </div>
`,
      });
    } catch (emailError: any) {
      console.error("Resend send error:", emailError);
      return NextResponse.json(
        {
          success: false,
          error: emailError?.message || "Failed to send email.",
        },
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
