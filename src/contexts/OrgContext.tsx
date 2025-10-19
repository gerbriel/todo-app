import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '@/app/supabaseClient';
import type { User } from '@supabase/supabase-js';

type Org = { id: string; name: string; slug?: string } | null;

interface OrgContextType {
  currentOrg: Org;
  setCurrentOrg: (org: Org) => Promise<void>;
  loading: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const [currentOrg, setCurrentOrgState] = useState<Org>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setCurrentOrgState(null);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('current_org').eq('id', user.id).single();
        if (!error && data?.current_org) {
          const { data: org } = await supabase.from('organizations').select('id,name,slug').eq('id', data.current_org).single();
          setCurrentOrgState(org ?? null);
        } else {
          setCurrentOrgState(null);
        }
      } catch (e) {
        setCurrentOrgState(null);
      }
    })();
  }, [user, supabase]);

  const setCurrentOrg = async (org: Org) => {
    setCurrentOrgState(org);
    if (!user) return;
    try {
      await supabase.from('profiles').upsert({ id: user.id, current_org: org?.id ?? null });
    } catch (e) {
      console.debug('Failed to persist current_org', e);
    }
  };

  return (
    <OrgContext.Provider value={{ currentOrg, setCurrentOrg, loading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used inside OrgProvider');
  return ctx;
}
