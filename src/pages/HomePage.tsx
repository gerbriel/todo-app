import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoards, createBoard } from '@/api/boards';
import { useAuth } from '@/contexts/AuthContext';
import { useOrg } from '@/contexts/OrgContext';

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentOrg } = useOrg();
  const workspaceId = currentOrg?.id || user?.id || '2a8f10d6-4368-43db-ab1d-ab783ec6e935'; // Default workspace
  const { data: boards, isLoading, error } = useQuery({
    queryKey: ['boards', currentOrg?.id || user?.id], 
    queryFn: () => getBoards(workspaceId),
    enabled: !!user?.id
  });

  const onCreateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (!name?.trim()) return;
    
    try {
      const newBoard = await createBoard(workspaceId, name.trim());
      // Invalidate all possible board query keys to ensure all components update
      await queryClient.invalidateQueries({ queryKey: ['boards', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['my-boards'] });
      navigate(`/b/${newBoard.id}/board`);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create board', error);
      alert('Failed to create board. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Your boards</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Create Board
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-red-500">Failed to load boards.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(boards ?? []).map((b: any) => (
              <button
                key={b.id}
                className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate(`/b/${b.id}/board`)}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{b.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to open</p>
              </button>
            ))}
          </div>
        )}
        
        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Board</h2>
              
              <form onSubmit={onCreateBoard}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Board Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter board name..."
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
