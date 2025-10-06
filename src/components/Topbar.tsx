import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createCardInBoard } from '@/api/cards';
import { createList } from '@/api/lists';
import { useAuth } from '@/contexts/AuthContext';

export default function Topbar() {
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user, signOut, isGuest } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isBoardPage = /^\/b\/.+\/(board|table|calendar|dashboard|map)$/.test(location.pathname);
  const boardId = params.boardId as string | undefined;

  const onNewCard = async () => {
    if (!boardId) return;
    try {
      await createCardInBoard(boardId, 'New card');
      await queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    } catch (e) {
      console.error('Failed to create card', e);
      alert('Failed to create card. Check console for details.');
    }
  };

  const onNewList = async () => {
    if (!boardId) return;
    try {
      await createList(boardId, 'New List');
      await queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
    } catch (e) {
      console.error('Failed to create list', e);
      alert('Failed to create list. Check console for details.');
    }
  };

  return (
    <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3">
      <div className="lg:hidden w-10"></div>
      
      <div className="flex-1 flex justify-center max-w-md mx-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Project Management App</div>
      </div>
      
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {isBoardPage && (
          <>
            <button
              onClick={onNewCard}
              className="px-2 md:px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs md:text-sm hover:bg-blue-700"
              title="Create a new card in this board"
            >
              + Card
            </button>
            <button
              onClick={onNewList}
              className="px-2 md:px-3 py-1.5 rounded-md bg-gray-600 text-white text-xs md:text-sm hover:bg-gray-700"
              title="Create a new list in this board"
            >
              + List
            </button>
          </>
        )}
        
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isGuest ? 'bg-green-300 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                {isGuest ? 'G' : user.email?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                {isGuest ? 'Guest User' : user.email}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                {isGuest && (
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    Guest Mode - Data won't be saved
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isGuest ? 'Exit Guest Mode' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
