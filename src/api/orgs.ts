import { supabase } from '@/app/supabaseClient';

export type OrgRow = {
  id: string;
  name: string;
  slug?: string | null;
};

export async function getOrgsForUser(userId: string): Promise<OrgRow[]> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations(id, name, slug)')
      .eq('user_id', userId);

    if (error) throw error;

    // map to org rows
    return (data || []).map((row: any) => ({ id: row.organizations.id, name: row.organizations.name, slug: row.organizations.slug }));
  } catch (err) {
    console.error('Error fetching orgs for user', err);
    return [];
  }
}

export async function createOrganization(name: string, slug?: string) {
  const { data, error } = await supabase.rpc('create_organization', { p_name: name, p_slug: slug || null });
  if (error) throw error;
  return data as string; // uuid
}

export async function createBoardWithAdmin(name: string, orgId: string) {
  const { data, error } = await supabase.rpc('create_board_with_admin', { p_name: name, p_org: orgId });
  if (error) throw error;
  return data as string;
}

export default {
  getOrgsForUser,
  createOrganization,
  createBoardWithAdmin
};
