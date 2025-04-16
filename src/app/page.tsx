'use client';

import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setUser, clearUser } from '@/redux/features/authSlice';
import { createInstantMeeting } from '@/redux/features/meetingSlice';
import Button from '@/components/Button';
import MeetingCard from '@/components/MeetingCard';
import { RootState } from '@/redux/store';
import { AppDispatch } from '@/redux/store';

export default function Home() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentMeeting = useSelector((state: RootState) => state.meeting.currentMeeting);
  const isLoading = useSelector((state: RootState) => state.meeting.loading);
  const meetingError = useSelector((state: RootState) => state.meeting.error);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (session?.user) {
      dispatch(setUser(session.user));
    } else if (status === 'unauthenticated') {
      dispatch(clearUser());
    }
  }, [session, status, dispatch]);

  const handleSignIn = () => {
    signIn('google');
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleInstantMeeting = () => {
    dispatch(createInstantMeeting());
  };

  const handleScheduleMeeting = () => {
    router.push('/schedule-meeting');
  };

  const handleCopyLink = () => {
    if (currentMeeting) {
      navigator.clipboard.writeText(currentMeeting.link);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const handleJoinMeeting = () => {
    if (currentMeeting) {
      window.open(currentMeeting.link, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Show copied message */}
        {showCopiedMessage && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-center">
            Meeting link copied to clipboard!
          </div>
        )}

        {/* Show error message if any */}
        {meetingError && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-center">
            Error: {meetingError}. Please make sure you have granted calendar permissions.
          </div>
        )}

        <div className="p-6 bg-white rounded-xl shadow-md mb-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Meeting Scheduler</h1>
          
          {!isAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6 text-center">Sign in to schedule or start meetings</p>
              <Button 
                onClick={handleSignIn}
                className="bg-blue-600 text-white hover:bg-blue-700 w-full py-3"
              >
                Sign in with Google
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-gray-600 mb-2 text-center">
                Welcome, {session?.user?.name}!
              </p>
              
              <Button 
                onClick={handleInstantMeeting}
                className={`bg-green-600 text-white hover:bg-green-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating Meeting...' : 'Instant Meeting'}
              </Button>
              
              <Button 
                onClick={handleScheduleMeeting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Schedule Meeting
              </Button>
              
              <Button 
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 mt-2"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Show meeting card if a meeting has been created */}
        {isAuthenticated && currentMeeting && (
          <MeetingCard
            meetingLink={currentMeeting.link}
            createdAt={currentMeeting.createdAt}
            onCopyLink={handleCopyLink}
            onJoinMeeting={handleJoinMeeting}
          />
        )}
      </div>
    </div>
  );
}
