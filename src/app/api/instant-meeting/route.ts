import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const end = new Date(now.getTime() + 30 * 60000); // 30 minutes

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: "Instant Meeting",
        start: {
          dateTime: now.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;

    return NextResponse.json({ meetLink });
  } catch (error) {
    console.error("Error creating meeting", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
} 