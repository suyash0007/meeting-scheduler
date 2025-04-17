# Complete Google Calendar API Integration

## Steps to Implement Real Google Meet Integration

To create real, functional Google Meet links, follow these steps:

### 1. Set Up Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API for your project
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application type)
6. Add your app's domain to authorized JavaScript origins
7. Add your callback URL (`http://localhost:3000/api/auth/callback/google` for development)

### 2. Configure NextAuth with Proper Scopes

Update your NextAuth configuration to include the necessary scopes:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

### 3. Handle Authentication in API Route

In your instant-meeting API route, implement proper token handling:

```typescript
// src/app/api/instant-meeting/route.ts
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    // Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Configure OAuth client with the access token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );
    
    oauth2Client.setCredentials({
      access_token: token.accessToken as string
    });

    // Create Calendar API client
    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });

    // Create a new Google Meet conference
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: 'Instant Meeting',
        start: {
          dateTime: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    // Extract the Google Meet link from the response
    const meetLink = event.data.hangoutLink;
    const meetingId = meetLink?.split('/').pop() || '';
    
    return NextResponse.json({
      success: true,
      meetLink,
      meetingId,
      createdAt: formatDate(new Date()),
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
```

### 4. Handle Token Refreshing

For long-lived applications, implement token refreshing:

```typescript
// Example token refresh logic
if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    token.accessToken = refreshedTokens.access_token;
    token.accessTokenExpires = Date.now() + refreshedTokens.expires_in * 1000;
  } catch (error) {
    console.error('Error refreshing access token', error);
    // Handle token refresh error
  }
}
```

### 5. Environment Variables

Ensure your `.env.local` file includes all necessary variables:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-secure-secret
NEXTAUTH_URL=http://localhost:3000
```

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/v3/reference)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2) 
