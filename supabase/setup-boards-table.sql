-- First, let's check if you need to run this schema
-- Run this in your Supabase SQL Editor: https://btiyyxmiwngikpuygpsq.supabase.co

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workspaces table (needed for boards)
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id)
);

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id text NOT NULL, -- Changed to text to match userId
  name text NOT NULL,
  description text,
  position integer DEFAULT 0,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_boards_position ON boards(position);
CREATE INDEX IF NOT EXISTS idx_boards_archived ON boards(archived);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Create policies for boards (allow all operations for now)
DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
CREATE POLICY "Users can view their own boards" ON boards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own boards" ON boards;
CREATE POLICY "Users can insert their own boards" ON boards
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
CREATE POLICY "Users can update their own boards" ON boards
  FOR UPDATE USING (true);

DROP POLICY IF NOT EXISTS "Users can delete their own boards" ON boards;
CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (true);
