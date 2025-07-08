// __tests__/sendMail.test.ts

import { POST } from "@/app/api/send-mail/route";
import { NextRequest } from "next/server";

// Mock Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      insert: jest.fn().mockResolvedValue({}),
    }),
  }),
}));

// Mock Postmark
jest.mock("postmark", () => ({
  Client: function () {
    return {
      sendEmailWithTemplate: jest.fn().mockResolvedValue({}),
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

    expect(json.success).toBe(true);
  });
});
