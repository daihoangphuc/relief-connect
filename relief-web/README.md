# RELIEF CONNECT Frontend

Frontend application for the Relief Connect emergency coordination system.

## Features
- **Anonymous Usage**: No login required for requesters or volunteers.
- **Geolocation**: Auto-detect location for requests.
- **Real-time Updates**: Connects to .NET Backend (Supabase).
- **Mission Tracking**: Local storage based mission tracking for volunteers.

## Setup

1. Configure Backend URL:
   Create a `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:5162/api
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Backend Integration
This frontend is designed to work with the ReliefConnect.API. 
If the API is not available, the application falls back to **Mock Mode** automatically, allowing you to test the UI flows.
