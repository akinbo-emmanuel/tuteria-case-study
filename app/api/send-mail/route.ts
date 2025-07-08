import { NextResponse } from "next/server";
import { Client } from "postmark";

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

  const postmarkClient = new Client(process.env.POSTMARK_API_KEY || "");

  try {
    const result = await postmarkClient.sendEmailWithTemplate({
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

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
