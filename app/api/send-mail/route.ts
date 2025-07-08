import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Client as PostmarkClient } from "postmark";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  const data = await req.json();

  const {
    userFirstName,
    referredUserName,
    courseName,
    currency,
    referralAmount,
    email,
  } = data;

  const postmark = new PostmarkClient(process.env.POSTMARK_API_KEY || "");

  try {
    // 1. Send email
    await postmark.sendEmailWithTemplate({
      From: "your-verified-sender@domain.com",
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

    // 2. Save to Supabase
    await supabase.from("referrals").insert([
      {
        user_first_name: userFirstName,
        referred_user_name: referredUserName,
        course_name: courseName,
        currency,
        referral_value: referralAmount,
        email,
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
