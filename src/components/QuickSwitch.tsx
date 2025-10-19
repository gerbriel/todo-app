import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { getBoards } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';
import { useOrg } from '@/contexts/OrgContext';

export default function QuickSwitch() {
  const { user } = useAuth();
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: boards = [] } = useQuery({
    queryKey: ['boards', currentOrg?.id || user?.id],
    queryFn: () => user?.id ? getBoards(currentOrg?.id || user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Open on Ctrl/Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boards;
    return boards.filter((b: any) => (b.name || '').toLowerCase().includes(q));
  }, [boards, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const board = filtered[activeIndex];
        if (board) {
          setOpen(false);
          navigate(`/b/${board.id}/board`);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, activeIndex, navigate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            placeholder="Search boards... (Ctrl/Cmd+K to toggle)"
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
          />
          <div className="text-xs text-gray-400">Press Esc to close</div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No boards match.</div>
          ) : (
            filtered.map((b: any, idx: number) => (
              <button
                key={b.id}
                onClick={() => { setOpen(false); navigate(`/b/${b.id}/board`); }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${idx === activeIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{b.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{b.workspace_id || b.org_id}</div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">{b.position ? `#${b.position}` : ''}</span>
                  {idx === activeIndex ? <ChevronDown className="w-4 h-4" /> : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
