import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, date, time, duration, timezone } = body;

  // Get user's timezone or default to browser timezone
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    // First, try to get the user's calendar settings to determine their timezone
    let userCalendarTimezone;
    try {
      const calendarSettings = await calendar.settings.get({
        setting: 'timezone'
      });
      userCalendarTimezone = calendarSettings.data.value;
    } catch {
      // Ignore error and use browser timezone instead
      console.log("Could not fetch calendar timezone, using browser timezone instead");
      userCalendarTimezone = userTimezone;
    }
    
    // *** IMPORTANT: Create the datetime strings directly without Date object manipulation ***
    // This avoids any timezone conversion issues
    
    // Format: 2023-12-17T14:30:00
    const startDateTime = `${date}T${time.padStart(5, '0')}:00`;
    
    // Calculate end time by adding duration (in minutes) to the time parts
    let [hours, minutes] = time.split(':').map(Number);
    minutes += duration;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    
    // Format end time with leading zeros
    const endTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    const endDateTime = `${date}T${endTime}`;
    
    console.log(`Creating meeting: ${startDateTime} to ${endDateTime} in timezone ${userTimezone}`);
    
    // Create an event with explicit timezone information using the user's input
    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: name || "Scheduled Meeting",
        start: {
          dateTime: startDateTime,
          timeZone: userTimezone
        },
        end: {
          dateTime: endDateTime,
          timeZone: userTimezone
        },
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri;
    return NextResponse.json({ 
      meetLink,
      meetingDetails: {
        name,
        date,
        time,
        duration,
        displayTimezone: userTimezone,
        calendarTimezone: userCalendarTimezone
      }
    });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    return NextResponse.json({ error: "Failed to schedule meeting" }, { status: 500 });
  }
} 