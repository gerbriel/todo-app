import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import Topbar from '@/components/Topbar';

export default function HomePage() {
  const navigate = useNavigate();
  const workspaceId = '2a8f10d6-4368-43db-ab1d-ab783ec6e935'; // Default workspace
  const { data: boards, isLoading, error } = useQuery({
    queryKey: ['my-boards'], 
    queryFn: () => getBoards(workspaceId)
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Topbar />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Your boards</h1>
        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-red-500">Failed to load boards.</div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {(boards ?? []).map((b: any) => (
              <button
                key={b.id}
                className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                onClick={() => navigate(`/b/${b.id}/board`)}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
