process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_ANON_KEY = "test-anon-key";
process.env.POSTMARK_API_KEY = "test-postmark-key";

import { POST } from "@/app/api/send-mail/route";

import { NextRequest } from "next/server";

// Mock Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    }),
  }),
}));

// Mock Postmark
jest.mock("postmark", () => ({
  Client: function () {
    return {
      sendEmailWithTemplate: jest.fn().mockResolvedValue({
        Message: "OK", // ✅ Add this to satisfy the condition
      }),
    };
  },
}));

// Helper to mock NextRequest with JSON body
function mockRequest(body: any): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe("POST /api/send-mail", () => {
  it("returns success: true with valid input", async () => {
    const req = mockRequest({
      userFirstName: "John",
      referredUserName: "Jane",
      courseName: "React Basics",
      currency: "USD",
      referralAmount: "50",
      email: "jane@example.com",
    });

    const res = await POST(req);
    const json = await res.json();
    console.log("Response JSON:", json); // <--- Add this line
    expect(json.success).toBe(true);
  });
});
