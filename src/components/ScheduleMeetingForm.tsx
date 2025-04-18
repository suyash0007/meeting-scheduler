'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

interface MeetingDetails {
  link: string;
  date: string;
  time: string;
  duration: number;
  name: string;
  displayTimezone?: string;
  calendarTimezone?: string;
}

export default function ScheduleMeetingForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [timezone, setTimezone] = useState("");
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get user's timezone on component mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detectedTimezone || "UTC");
    } catch (error) {
      console.error("Could not detect timezone:", error);
      setTimezone("UTC");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/schedule-meeting", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, date, time, duration, timezone }),
      });

      const data = await res.json();
      if (data.meetLink) {
        setMeetingDetails({
          link: data.meetLink,
          date,
          time,
          duration,
          name,
          displayTimezone: data.meetingDetails?.displayTimezone || timezone,
          calendarTimezone: data.meetingDetails?.calendarTimezone
        });
      } else if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      setError("Failed to schedule meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    // Use the exact date string that was input by the user
    // Don't convert between timezones when displaying the date
    const [year, month, day] = dateString.split('-').map(Number);
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    // Create a date object but preserve the date parts exactly as selected
    const date = new Date();
    date.setFullYear(year, month - 1, day); // month is 0-indexed in JS
    
    return date.toLocaleDateString(undefined, options);
  };

  // Format time to display in a more readable format
  const formatTime = (timeString: string) => {
    // Use the exact time that was input by the user
    // Don't convert between timezones when displaying the time
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true  // Show as AM/PM format
    });
  };

  // Format duration to display hours and minutes
  const formatDuration = (durationMinutes: number) => {
    if (durationMinutes < 60) return `${durationMinutes} minutes`;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Format timezone for better readability
  const formatTimezone = (tzString?: string) => {
    if (!tzString) return "Unknown";
    
    // Convert "America/New_York" to "America/New York"
    const formatted = tzString.replace(/_/g, ' ');
    
    // Add the timezone abbreviation if possible
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzString,
        timeZoneName: 'short'
      });
      const tzParts = formatter.formatToParts(now).find(part => part.type === 'timeZoneName');
      if (tzParts?.value) {
        return `${formatted} (${tzParts.value})`;
      }
    } catch {
      // If any error occurs, just return the formatted string
    }
    
    return formatted;
  };

  // Helper function to compare timezones
  const areEquivalentTimezones = (tz1?: string, tz2?: string) => {
    if (!tz1 || !tz2) return false;
    const formatted1 = tz1.replace(/_/g, ' ').toLowerCase();
    const formatted2 = tz2.replace(/_/g, ' ').toLowerCase();
    return formatted1 === formatted2;
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Schedule a Meeting</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {!meetingDetails ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Meeting Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter meeting name"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-700">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-700">Time</label>
              <input
                id="time"
                name="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Time will be scheduled in your local timezone: <strong>{formatTimezone(timezone)}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="duration" className="block mb-2 text-sm font-medium text-gray-700">Duration</label>
              <select
                id="duration"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </form>
        ) : (
          <div className="mt-2">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-medium text-green-800">Meeting Scheduled Successfully</h2>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Meeting Details</h3>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Name:</strong> {meetingDetails.name}</span>
                </div>
                
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Date:</strong> {formatDate(meetingDetails.date)}</span>
                </div>
                
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Time:</strong> {formatTime(meetingDetails.time)}</span>
                </div>
                
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Duration:</strong> {formatDuration(meetingDetails.duration)}</span>
                </div>

                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  <span><strong>Your Timezone:</strong> {formatTimezone(meetingDetails.displayTimezone)}</span>
                </div>

                {meetingDetails.calendarTimezone && 
                  meetingDetails.displayTimezone && 
                  meetingDetails.calendarTimezone.trim() !== meetingDetails.displayTimezone.trim() && 
                  !areEquivalentTimezones(meetingDetails.calendarTimezone, meetingDetails.displayTimezone) && (
                  <div className="flex mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="text-amber-600">
                      <strong>Important Note:</strong> Your Google Calendar is set to {formatTimezone(meetingDetails.calendarTimezone)}. 
                      This meeting has been scheduled for <strong>{formatDate(meetingDetails.date)} at {formatTime(meetingDetails.time)}</strong> in your 
                      local timezone ({formatTimezone(meetingDetails.displayTimezone)}). 
                      <p className="mt-1">Due to timezone differences, this may appear as a different date/time in your Google Calendar.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Join with this link:</h3>
              <a 
                href={meetingDetails.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {meetingDetails.link}
              </a>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => navigator.clipboard.writeText(meetingDetails.link)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 012 2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Link
              </button>
              
              <Link 
                href="/"
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 