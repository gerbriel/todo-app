-- Sample data setup for user: ad146555-19f4-4eb7-8d22-9ccdedd6a917
-- Run this in your Supabase SQL editor after running the main schema

-- Insert a workspace for your user
INSERT INTO workspaces (name, owner_id) VALUES
  ('My Workspace', 'ad146555-19f4-4eb7-8d22-9ccdedd6a917')
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Get the workspace ID (you'll need to copy this from the result above)
-- Then insert a board - replace 'WORKSPACE_ID_HERE' with the actual ID from above
-- INSERT INTO boards (workspace_id, name) VALUES
--   ('WORKSPACE_ID_HERE', 'My First Board')
-- RETURNING id, name;

-- After you have the board ID, insert some lists - replace 'BOARD_ID_HERE' with actual board ID
-- INSERT INTO lists (board_id, name, position) VALUES
--   ('BOARD_ID_HERE', 'To Do', 1000),
--   ('BOARD_ID_HERE', 'In Progress', 2000),
--   ('BOARD_ID_HERE', 'Done', 3000)
-- RETURNING id, name, position;

-- Alternative: Create everything in one go (uncomment the block below)
/*
DO $$
DECLARE
    workspace_uuid uuid;
    board_uuid uuid;
BEGIN
    -- Create workspace
    INSERT INTO workspaces (name, owner_id) VALUES
        ('My Workspace', 'ad146555-19f4-4eb7-8d22-9ccdedd6a917')
    ON CONFLICT DO NOTHING
    RETURNING id INTO workspace_uuid;
    
    -- If workspace already exists, get its ID
    IF workspace_uuid IS NULL THEN
        SELECT id INTO workspace_uuid FROM workspaces 
        WHERE owner_id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917' 
        LIMIT 1;
    END IF;
    
    -- Create board
    INSERT INTO boards (workspace_id, name) VALUES
        (workspace_uuid, 'My First Board')
    RETURNING id INTO board_uuid;
    
    -- Create lists
    INSERT INTO lists (board_id, name, position) VALUES
        (board_uuid, 'To Do', 1000),
        (board_uuid, 'In Progress', 2000),
        (board_uuid, 'Done', 3000);
        
    -- Show the created IDs
    RAISE NOTICE 'Created workspace: %, board: %', workspace_uuid, board_uuid;
END $$;
*/