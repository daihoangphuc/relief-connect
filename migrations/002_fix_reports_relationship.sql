-- Add Foreign Key relationship explicitly if missing
ALTER TABLE reports
DROP CONSTRAINT IF EXISTS reports_request_id_fkey;

ALTER TABLE reports
ADD CONSTRAINT reports_request_id_fkey
FOREIGN KEY (request_id)
REFERENCES relief_requests(id)
ON DELETE CASCADE;

-- Refresh schema cache (sometimes needed for Supabase to pick up changes)
NOTIFY pgrst, 'reload config';
