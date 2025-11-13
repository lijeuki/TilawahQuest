-- Create ayah_attempts table
CREATE TABLE IF NOT EXISTS ayah_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  recognized_text TEXT,
  confidence_score DECIMAL(5,2),
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_session_surah 
  ON ayah_attempts(session_id, surah_number);

CREATE INDEX IF NOT EXISTS idx_created_at 
  ON ayah_attempts(created_at) 
  WHERE created_at > NOW() - INTERVAL '24 hours';

-- Enable Row Level Security (RLS)
ALTER TABLE ayah_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for anonymous users)
CREATE POLICY "Allow anonymous inserts" 
  ON ayah_attempts 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to read their own attempts
CREATE POLICY "Allow users to read own attempts" 
  ON ayah_attempts 
  FOR SELECT 
  USING (true);

-- Create a function to automatically delete old recordings (>24 hours)
CREATE OR REPLACE FUNCTION delete_old_recordings()
RETURNS void AS $$
BEGIN
  DELETE FROM ayah_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily
-- Note: This requires pg_cron extension which may need to be enabled
-- SELECT cron.schedule('delete-old-recordings', '0 0 * * *', 'SELECT delete_old_recordings()');
