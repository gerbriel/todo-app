-- Add status and priority columns to cards table
ALTER TABLE cards 
ADD COLUMN status text CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked', 'on-hold')) DEFAULT 'not-started',
ADD COLUMN priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium';

-- Update the existing cards to have default values
UPDATE cards SET status = 'not-started' WHERE status IS NULL;
UPDATE cards SET priority = 'medium' WHERE priority IS NULL;