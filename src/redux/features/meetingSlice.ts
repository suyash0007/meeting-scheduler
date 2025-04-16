import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { extractMeetingId } from '@/utils/meetingUtils';
import { formatDate } from '@/utils/meetingUtils';

interface Meeting {
  id: string;
  link: string;
  createdAt: string;
}

interface MeetingState {
  currentMeeting: Meeting | null;
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
}

const initialState: MeetingState = {
  currentMeeting: null,
  meetings: [],
  loading: false,
  error: null,
};

// Async thunk for creating a meeting
export const createInstantMeeting = createAsyncThunk(
  'meeting/createInstantMeeting',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/instant-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      
      if (!data.meetLink) {
        throw new Error('No meeting link returned from the API');
      }
      
      // Extract ID from the meeting link and format date
      const meetingId = extractMeetingId(data.meetLink);
      
      // Return the meeting data
      return {
        id: meetingId,
        link: data.meetLink,
        createdAt: formatDate(new Date()),
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    createMeeting: (state, action: PayloadAction<Meeting>) => {
      state.currentMeeting = action.payload;
      state.meetings = [action.payload, ...state.meetings];
    },
    clearCurrentMeeting: (state) => {
      state.currentMeeting = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInstantMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInstantMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeeting = action.payload;
        state.meetings = [action.payload, ...state.meetings];
      })
      .addCase(createInstantMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { createMeeting, clearCurrentMeeting } = meetingSlice.actions;
export default meetingSlice.reducer; 