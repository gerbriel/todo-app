-- Project Management App Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS lists CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- Create tables in correct order (no foreign key dependencies first)
CREATE TABLE workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE boards (
  id TEXT PRIMARY KEY, -- Using TEXT to match 'board-1' format
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lists (
  id TEXT PRIMARY KEY, -- Using TEXT to match 'list-1' format  
  board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cards (
  id TEXT PRIMARY KEY, -- Using TEXT to match 'card-1' format
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
  list_id TEXT REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE,
  date_end DATE,
  position INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS boards_workspace_id_idx ON boards(workspace_id);
CREATE INDEX IF NOT EXISTS lists_board_id_idx ON lists(board_id);
CREATE INDEX IF NOT EXISTS cards_board_id_idx ON cards(board_id);
CREATE INDEX IF NOT EXISTS cards_list_id_idx ON cards(list_id);
CREATE INDEX IF NOT EXISTS cards_position_idx ON cards(position);
CREATE INDEX IF NOT EXISTS lists_position_idx ON lists(position);

-- Enable Row Level Security (RLS)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - you can customize these)
-- Workspaces
CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Boards
CREATE POLICY "Users can view boards in their workspaces" ON boards
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update boards" ON boards
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Lists
CREATE POLICY "Users can view lists" ON lists
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update lists" ON lists
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete lists" ON lists
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Cards
CREATE POLICY "Users can view cards" ON cards
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update cards" ON cards
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete cards" ON cards
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert sample data (optional)
INSERT INTO workspaces (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Default Workspace')
ON CONFLICT (id) DO NOTHING;

INSERT INTO boards (id, workspace_id, name) VALUES 
  ('board-1', '550e8400-e29b-41d4-a716-446655440000', 'Sample Project Board')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lists (id, board_id, name, position) VALUES 
  ('list-1', 'board-1', 'To Do', 1000),
  ('list-2', 'board-1', 'In Progress', 2000),
  ('list-3', 'board-1', 'Done', 3000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample cards to test with
INSERT INTO cards (id, workspace_id, board_id, list_id, title, description, position, created_by) VALUES 
  ('card-1', '550e8400-e29b-41d4-a716-446655440000', 'board-1', 'list-1', 'Welcome to the Database!', 'This card comes from your real Supabase database', 1000, NULL),
  ('card-2', '550e8400-e29b-41d4-a716-446655440000', 'board-1', 'list-1', 'Database setup complete', 'All tables are working correctly', 2000, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample cards to test with
INSERT INTO cards (id, workspace_id, board_id, list_id, title, description, position, created_by) VALUES 
  ('card-1', '550e8400-e29b-41d4-a716-446655440000', 'board-1', 'list-1', 'Welcome to the Database!', 'This card comes from your real Supabase database', 1000, NULL),
  ('card-2', '550e8400-e29b-41d4-a716-446655440000', 'board-1', 'list-1', 'Database setup complete', 'All tables are working correctly', 2000, NULL)
ON CONFLICT (id) DO NOTHING;