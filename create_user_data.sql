-- Complete setup script for user: ad146555-19f4-4eb7-8d22-9ccdedd6a917
-- Run this in your Supabase SQL editor to create workspace, board, and test data

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
    
    -- Create a sample card
    INSERT INTO cards (workspace_id, board_id, list_id, title, description, position, created_by) VALUES
        (workspace_uuid, board_uuid, (SELECT id FROM lists WHERE board_id = board_uuid AND name = 'To Do'), 'Welcome to your board!', 'This is a sample card to get you started.', 1000, 'ad146555-19f4-4eb7-8d22-9ccdedd6a917');
        
    -- Show the created IDs
    RAISE NOTICE 'Created workspace: %, board: %', workspace_uuid, board_uuid;
END $$;

-- Check what was created
SELECT 'Workspaces' as type, id, name, owner_id FROM workspaces WHERE owner_id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
UNION ALL
SELECT 'Boards' as type, b.id, b.name, w.owner_id FROM boards b 
JOIN workspaces w ON b.workspace_id = w.id 
WHERE w.owner_id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917';