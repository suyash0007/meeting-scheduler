/**
 * Generates a random string of specified length
 */
export const generateRandomId = (length: number = 10): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let result = '';
  
  // First three characters are always 'abc'
  result = 'abc';
  
  // Generate the rest of the ID
  for (let i = 0; i < length - 3; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Formats date to a readable format
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Creates a Google Meet link with a random ID
 */
export const createGoogleMeetLink = (): {
  link: string;
  id: string;
  createdAt: string;
} => {
  const meetId = generateRandomId(10);
  return {
    id: meetId,
    link: `https://meet.google.com/${meetId}`,
    createdAt: formatDate(new Date()),
  };
};

/**
 * Extracts meeting ID from a Google Meet URL
 */
export const extractMeetingId = (meetLink: string): string => {
  if (!meetLink) return '';
  
  // Try to extract the ID from the URL
  const match = meetLink.match(/meet.google.com\/([a-z-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // If no match, just return the last part of the URL
  return meetLink.split('/').pop() || '';
}; 