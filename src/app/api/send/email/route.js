export async function POST(request) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return Response.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.paubox.net/v1/${process.env.PAUBOX_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Token token=${process.env.PAUBOX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            message: {
              recipients: [to],
              headers: {
                subject,
                from: process.env.PAUBOX_FROM_EMAIL,
              },
              content: {
                "text/html": body,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send email");
    }

    const result = await response.json();
    return Response.json({ success: true, messageId: result.data?.message?.id });
  } catch (error) {
    console.error("Paubox error:", error);
    return Response.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}