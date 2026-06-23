import twilio from "twilio";

export async function POST(request) {
  try {
    const { to, body } = await request.json();

    if (!to || !body) {
      return Response.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to,
    });

    return Response.json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error("Twilio error:", error);
    return Response.json(
      { error: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}