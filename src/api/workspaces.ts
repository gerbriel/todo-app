export interface WorkspaceRow {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// Simple approach: Use the user ID as the workspace ID directly
// This avoids the need for a separate workspaces table
export async function getOrCreateUserWorkspace(userId: string, name?: string): Promise<WorkspaceRow> {
  // For now, just return a mock workspace using the user ID
  return {
    id: userId,
    name: name || 'My Workspace',
    description: 'User workspace',
    owner_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getWorkspacesByUser(userId: string): Promise<WorkspaceRow[]> {
  // Return a single workspace for the user
  const workspace = await getOrCreateUserWorkspace(userId);
  return [workspace];
}