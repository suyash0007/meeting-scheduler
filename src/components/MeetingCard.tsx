'use client';

import React from 'react';
import Button from './Button';

interface MeetingCardProps {
  meetingLink: string;
  createdAt: string;
  onCopyLink: () => void;
  onJoinMeeting: () => void;
}

const MeetingCard = ({
  meetingLink,
  createdAt,
  onCopyLink,
  onJoinMeeting
}: MeetingCardProps) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Instant Meeting</h3>
        <span className="text-sm text-gray-500">{createdAt}</span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Duration</p>
        <p className="font-medium text-gray-800">30 minutes</p>
      </div>
      
      <div className="mb-5">
        <p className="text-sm text-gray-500 mb-1">Meeting Link</p>
        <div className="flex items-center">
          <a 
            href={meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate flex-1"
          >
            {meetingLink}
          </a>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={onCopyLink}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex-1"
        >
          Copy Link
        </Button>
        <Button 
          onClick={onJoinMeeting}
          className="bg-green-600 text-white hover:bg-green-700 flex-1"
        >
          Join Meeting
        </Button>
      </div>
    </div>
  );
};

export default MeetingCard; 