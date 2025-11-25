-- Migration: Add urgency_level and other critical fields
-- Run this in Supabase SQL Editor

-- 1. Add urgency_level to relief_requests
ALTER TABLE relief_requests 
ADD COLUMN IF NOT EXISTS urgency_level int DEFAULT 1;
-- 0: Low, 1: Medium, 2: High, 3: Critical

COMMENT ON COLUMN relief_requests.urgency_level IS '0: Low, 1: Medium, 2: High, 3: Critical';

-- 2. Add index for urgency_level
CREATE INDEX IF NOT EXISTS idx_relief_requests_urgency ON relief_requests(urgency_level DESC);

-- 3. Add mission_status to relief_missions for better tracking
ALTER TABLE relief_missions
ADD COLUMN IF NOT EXISTS mission_status int DEFAULT 0;
-- 0: Accepted, 1: En Route, 2: Arrived, 3: Completed

COMMENT ON COLUMN relief_missions.mission_status IS '0: Accepted, 1: En Route, 2: Arrived, 3: Completed';

-- 4. Add quantity_delivered to request_items
ALTER TABLE request_items
ADD COLUMN IF NOT EXISTS quantity_delivered int DEFAULT 0;

-- 5. Create reports table for spam prevention
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL,
  reporter_id uuid,
  reason text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON reports FOR ALL USING (true);

-- Add index
CREATE INDEX IF NOT EXISTS idx_reports_request_id ON reports(request_id);

-- 6. Create messages table for in-app chat
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL, -- 'requester' or 'donor'
  message_text text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  read_at timestamp with time zone
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON messages FOR ALL USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messages_mission_id ON messages(mission_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- 7. Add additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_relief_requests_lat_lng ON relief_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_relief_missions_donor_id ON relief_missions(donor_id);
CREATE INDEX IF NOT EXISTS idx_relief_missions_completed_at ON relief_missions(completed_at);

-- 8. Add request_logs table for tracking and spam prevention
CREATE TABLE IF NOT EXISTS request_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON request_logs FOR ALL USING (true);

-- Add index
CREATE INDEX IF NOT EXISTS idx_request_logs_ip ON request_logs(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_requester ON request_logs(requester_id, created_at DESC);
