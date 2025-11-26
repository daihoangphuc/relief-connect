-- ==========================================
-- RELIEF CONNECT - FULL DATABASE SCHEMA
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tables

-- Table: relief_requests (Yêu cầu cứu trợ)
CREATE TABLE IF NOT EXISTS relief_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id TEXT NOT NULL, -- ID người gửi (từ localStorage hoặc Auth)
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    contact_phone TEXT,
    status INTEGER DEFAULT 0, -- 0: Open, 1: InProgress, 2: Completed, 3: Cancelled
    urgency_level INTEGER DEFAULT 1, -- 0: Low, 1: Medium, 2: High, 3: Critical
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: relief_missions (Nhiệm vụ cứu trợ)
CREATE TABLE IF NOT EXISTS relief_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES relief_requests(id) ON DELETE CASCADE,
    donor_id TEXT NOT NULL, -- ID tình nguyện viên
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    proof_image TEXT, -- URL ảnh chứng minh hoàn thành
    mission_status INTEGER DEFAULT 0 -- 0: Accepted, 1: EnRoute, 2: Arrived, 3: Completed
);

-- Table: reports (Báo cáo vi phạm/spam)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES relief_requests(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL,
    reason TEXT NOT NULL, -- spam, fake, inappropriate, other
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: request_logs (Lịch sử thay đổi trạng thái - Optional)
CREATE TABLE IF NOT EXISTS request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES relief_requests(id) ON DELETE CASCADE,
    previous_status INTEGER,
    new_status INTEGER,
    changed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Indexes (Performance Optimization)

CREATE INDEX IF NOT EXISTS idx_requests_status ON relief_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON relief_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_requests_location ON relief_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON relief_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_missions_request_id ON relief_missions(request_id);
CREATE INDEX IF NOT EXISTS idx_missions_donor_id ON relief_missions(donor_id);
CREATE INDEX IF NOT EXISTS idx_missions_completed_at ON relief_missions(completed_at);

CREATE INDEX IF NOT EXISTS idx_reports_request_id ON reports(request_id);

-- 4. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE relief_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: relief_requests (Public Read/Write for now - can be restricted later)
CREATE POLICY "Public requests access" ON relief_requests
    FOR ALL USING (true) WITH CHECK (true);

-- Policy: relief_missions (Public Read/Write)
CREATE POLICY "Public missions access" ON relief_missions
    FOR ALL USING (true) WITH CHECK (true);

-- Policy: reports (Public Insert, Read own reports?)
-- For simplicity in this MVP, allowing public access
CREATE POLICY "Public reports access" ON reports
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Storage Buckets Setup (Supabase Storage)

-- Create bucket for proof images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-images', 'proof-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access Proof Images" ON storage.objects
    FOR SELECT USING (bucket_id = 'proof-images');

CREATE POLICY "Public Upload Proof Images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'proof-images');

-- 6. Realtime Setup (Optional - usually done via Dashboard but can be enabled here)
-- Note: This requires superuser privileges usually
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE relief_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE relief_missions;

-- 7. Database Functions (RPC)

-- Function to get nearby requests using Haversine formula
-- Returns requests within a specific radius (km), sorted by distance

DROP FUNCTION IF EXISTS get_nearby_requests_v2;

CREATE OR REPLACE FUNCTION get_nearby_requests_v2(
  lat double precision,
  long double precision,
  radius_km double precision DEFAULT 10,
  status_filter integer DEFAULT -1,
  limit_val integer DEFAULT 10,
  offset_val integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  requester_id text,
  title text,
  description text,
  latitude double precision,
  longitude double precision,
  address text,
  status integer,
  urgency_level integer,
  created_at timestamptz,
  contact_phone text,
  dist_km double precision,
  report_count bigint,
  reporter_ids text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.requester_id::text,
    r.title::text,
    r.description::text,
    r.latitude::double precision,
    r.longitude::double precision,
    r.address::text,
    r.status::integer,
    r.urgency_level::integer,
    r.created_at::timestamptz,
    r.contact_phone::text,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(r.latitude)) *
        cos(radians(r.longitude) - radians(long)) +
        sin(radians(lat)) * sin(radians(r.latitude))
      )
    )::double precision AS dist_km,
    COALESCE(rep.count, 0)::bigint as report_count,
    COALESCE(rep.reporter_ids, ARRAY[]::text[])::text[] as reporter_ids
  FROM
    relief_requests r
  LEFT JOIN (
      SELECT request_id, COUNT(*) as count, array_agg(reporter_id::text) as reporter_ids
      FROM reports
      GROUP BY request_id
  ) rep ON r.id = rep.request_id
  WHERE
    (status_filter = -1 OR r.status = status_filter)
    AND (
      6371 * acos(
        cos(radians(lat)) * cos(radians(r.latitude)) *
        cos(radians(r.longitude) - radians(long)) +
        sin(radians(lat)) * sin(radians(r.latitude))
      )
    ) <= radius_km
  ORDER BY
    dist_km ASC,
    r.urgency_level DESC
  LIMIT limit_val
  OFFSET offset_val;
END;
$$;
