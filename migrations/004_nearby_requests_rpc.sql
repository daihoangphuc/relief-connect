-- Function to get nearby requests using Haversine formula
-- Returns requests within a specific radius (km), sorted by distance

DROP FUNCTION IF EXISTS get_nearby_requests;

CREATE OR REPLACE FUNCTION get_nearby_requests(
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
  reporter_ids text[] -- Array of reporter IDs
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.requester_id,
    r.title,
    r.description,
    r.latitude,
    r.longitude,
    r.address,
    r.status,
    r.urgency_level,
    r.created_at,
    r.contact_phone,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(r.latitude)) *
        cos(radians(r.longitude) - radians(long)) +
        sin(radians(lat)) * sin(radians(r.latitude))
      )
    ) AS dist_km,
    COALESCE(rep.count, 0) as report_count,
    COALESCE(rep.reporter_ids, ARRAY[]::text[]) as reporter_ids
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
