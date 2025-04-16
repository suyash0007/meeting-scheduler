# Meeting Scheduler

A Next.js application for creating and scheduling Google Meet meetings with OAuth integration. Users can create instant meetings or schedule future meetings through an intuitive interface.

## Features

- **Google SSO Authentication**: Secure login with Google OAuth
- **Instant Meeting Creation**: Generate Google Meet links with one click
- **Meeting Scheduling**: Plan meetings with customizable date, time, and duration
- **Calendar Integration**: All meetings are automatically added to the user's Google Calendar
- **Responsive UI**: Clean, modern interface that works on all devices
- **Redux State Management**: Centralized state management for predictable behavior

## Table of Contents

- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Google Cloud Setup](#google-cloud-setup)
- [Development](#development)
- [Deployment on Vercel](#deployment-on-vercel)
- [Usage Notes](#usage-notes)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

## Architecture

### Tech Stack

- **Frontend**: React with Next.js App Router
- **State Management**: Redux with Redux Toolkit
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS
- **API Integration**: Google Calendar API for Meet links

### Project Structure

```
meeting-scheduler/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/              # Auth API routes
│   │   │   ├── instant-meeting/   # Instant meeting creation
│   │   │   └── schedule-meeting/  # Scheduled meeting creation
│   │   ├── schedule-meeting/      # Schedule meeting page
│   │   └── page.tsx               # Home page
│   ├── components/                # React components
│   │   ├── Button.tsx             # Reusable button component
│   │   ├── MeetingCard.tsx        # Meeting details card
│   │   └── ScheduleMeetingForm.tsx # Meeting scheduling form
│   ├── lib/                       # Library code
│   │   └── auth.ts                # Auth configuration
│   ├── redux/                     # Redux state management
│   │   ├── features/              # Redux slices
│   │   │   ├── authSlice.ts       # Authentication state
│   │   │   └── meetingSlice.ts    # Meeting state
│   │   ├── provider.tsx           # Redux provider
│   │   └── store.ts               # Redux store configuration
│   ├── types/                     # TypeScript type definitions
│   │   └── next-auth.d.ts         # NextAuth type extensions
│   └── utils/                     # Utility functions
│       └── meetingUtils.ts        # Meeting-related utilities
├── public/                        # Static assets
├── .env.local                     # Environment variables (local)
├── next.config.mjs                # Next.js configuration
└── tailwind.config.js             # Tailwind CSS configuration
```

### Data Flow

1. **Authentication Flow**:
   - User logs in via Google OAuth
   - NextAuth.js handles the OAuth flow and token management
   - Session with access token is maintained for API calls

2. **Instant Meeting Flow**:
   - User clicks "Instant Meeting" button
   - Redux thunk dispatches API call to `/api/instant-meeting`
   - API creates a Google Calendar event with Meet conferencing
   - Meet link is returned and displayed in MeetingCard

3. **Schedule Meeting Flow**:
   - User navigates to schedule meeting page
   - Fills form with date, time, duration
   - Form submits to `/api/schedule-meeting`
   - API creates future Calendar event with Meet conferencing
   - Meeting details and link are displayed

## Setup & Installation

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Google Cloud project with Calendar API enabled
- Google OAuth credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/meeting-scheduler.git
   cd meeting-scheduler
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory (see Environment Configuration below)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# For production deployment
# NEXTAUTH_URL=https://your-production-domain.com
```

For production on Vercel, set these environment variables in the Vercel dashboard.

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it

4. Configure OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type (unless you have a Google Workspace)
   - Fill in required app information
   - Add scopes: `.../auth/calendar` and `.../auth/calendar.events`
   - Add test users if in testing mode

5. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (for deployment)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for deployment)
   - Click "Create" and note your Client ID and Client Secret

## Development

### Running Locally

```bash
npm run dev
# or
yarn dev
```

### Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment on Vercel

### Setup

1. Push your code to a GitHub repository

2. Connect to Vercel:
   - Create an account on [Vercel](https://vercel.com)
   - Click "New Project" and import your GitHub repository
   - Configure the project:
     - Framework preset: Next.js
     - Root directory: `./`
     - Build command: `next build`
     - Output directory: `.next`

3. Environment Variables:
   - Add all environment variables from your `.env.local` file
   - Set `NEXTAUTH_URL` to your Vercel deployment URL
   - Make sure to add the Google OAuth callback URL to your Google Cloud project

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Any push to the main branch will trigger a new deployment.

### Custom Domain

1. In the Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain and follow the verification steps
4. Update your Google OAuth credentials with the new domain

## Usage Notes

### Google Authentication Process

When logging in with Google for the first time, users may see a security warning page since the application is in development or testing mode. To proceed:

1. Click on "Advanced" at the bottom of the warning page
2. Click "Continue to [your-app-name]" to proceed to the authentication process
3. Grant the requested permissions when prompted by Google:
   - Calendar access is required to create meetings
   - Email and profile information is needed for user identification

The application will immediately register all created meetings in the user's Google Calendar, making them accessible from any device where the user is signed into their Google account.

## Limitations

1. **API Rate Limits**: Google Calendar API has rate limits (typically 1,000,000 requests/day), which could affect high-traffic applications.

2. **Response Time**: Meeting creation can take 15-30 seconds, which might affect user experience.

3. **Token Expiry**: Google OAuth tokens expire, requiring refresh token management for long-lived sessions.

4. **Calendar Integration**: Currently only creates meetings; doesn't manage or list existing meetings.

5. **Error Handling**: Basic error handling for API failures could be improved.

6. **Time Zone Support**: Limited time zone management, currently uses user's local time.

7. **Meeting Templates**: No support for recurring meetings or meeting templates.

## Future Improvements

1. **Performance Optimization**:
   - Implement caching strategies
   - Add request timeouts and retry logic
   - Optimize API payload size

2. **Enhanced Features**:
   - Meeting templates and recurring meetings
   - Calendar view of scheduled meetings
   - Email notifications and calendar invites
   - Meeting participant management

3. **User Experience**:
   - Better loading states with progress indicators
   - Offline support with service workers
   - Dark mode support

4. **Security & Compliance**:
   - Enhanced error logging
   - GDPR compliance features
   - Data backup and recovery

5. **Integration**:
   - Microsoft Teams integration alternative
   - Zoom integration alternative
   - Calendar synchronization with other providers

6. **Infrastructure**:
   - Serverless function optimization
   - Edge function deployment for better global performance
   - WebSocket for real-time updates

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
