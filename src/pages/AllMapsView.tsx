import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBoards } from '@/api/boards';
import { getCardsByBoard } from '@/api/cards';
import { useAuth } from '@/contexts/AuthContext';

export default function AllMapsView() {
  const { user } = useAuth();
  const workspaceId = user?.id || '2a8f10d6-4368-43db-ab1d-ab783ec6e935';
  const [enabledBoardIds, setEnabledBoardIds] = useState<string[]>([]);

  // Get all boards
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn: () => getBoards(workspaceId),
    enabled: !!user?.id
  });

  // Initialize all boards as enabled when boards load
  useEffect(() => {
    if (boards.length > 0 && enabledBoardIds.length === 0) {
      setEnabledBoardIds(boards.map(b => b.id));
    }
  }, [boards, enabledBoardIds.length]);

  // Get cards for all boards
  const allCardQueries = useQuery({
    queryKey: ['all-cards-maps', boards.map(b => b.id)],
    queryFn: async () => {
      if (boards.length === 0) return [];
      
      const allCardsPromises = boards.map(async (board) => {
        try {
          const cards = await getCardsByBoard(board.id);
          return cards.map(card => ({ ...card, boardId: board.id, boardName: board.name }));
        } catch (error) {
          console.warn(`Failed to load cards for board ${board.id}:`, error);
          return [];
        }
      });
      
      const allCardsArrays = await Promise.all(allCardsPromises);
      return allCardsArrays.flat();
    },
    enabled: boards.length > 0,
  });

  if (boardsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading maps...</div>
      </div>
    );
  }

  if (allCardQueries.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Failed to load map data. Please try again.
        </div>
      </div>
    );
  }

  const allCards = allCardQueries.data || [];
  
  // Filter cards to only show those from enabled boards
  const cardsToShow = allCards.filter(c => enabledBoardIds.includes(c.boardId));

  // Filter cards with location data
  const cardsWithLocations = cardsToShow.filter(card => 
    card.location_lat && card.location_lng || card.location_address
  );

  // Generate board colors
  const getBoardColor = (boardId: string) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green  
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16', // lime
    ];
    const index = boards.findIndex(b => b.id === boardId);
    return colors[index % colors.length];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Maps
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {cardsWithLocations.length} pinned locations from {enabledBoardIds.length} of {boards.length} boards
          </div>
        </div>
        
        {/* Board filters */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Boards:</span>
          <button
            onClick={() => setEnabledBoardIds(boards.map(b => b.id))}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Enable All
          </button>
          <button
            onClick={() => setEnabledBoardIds([])}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Disable All
          </button>
          {boards.map(board => {
            const isEnabled = enabledBoardIds.includes(board.id);
            return (
              <button
                key={board.id}
                onClick={() => {
                  setEnabledBoardIds(prev => 
                    isEnabled 
                      ? prev.filter(id => id !== board.id)
                      : [...prev, board.id]
                  );
                }}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  isEnabled
                    ? 'text-white border-transparent'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: isEnabled ? getBoardColor(board.id) : undefined
                }}
              >
                {board.name}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        {cardsWithLocations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Pinned Locations
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add location data to your cards to see them on the map.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardsWithLocations.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {card.title}
                  </h3>
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getBoardColor(card.boardId) }}
                  >
                    {card.boardName}
                  </span>
                </div>

                {card.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {String(card.description)}
                  </p>
                )}

                <div className="space-y-2">
                  {card.location_address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>📍</span>
                      <span>{card.location_address}</span>
                    </div>
                  )}
                  
                  {card.location_lat && card.location_lng && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>🌐</span>
                      <span>{card.location_lat.toFixed(6)}, {card.location_lng.toFixed(6)}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    {card.location_lat && card.location_lng && (
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${card.location_lat},${card.location_lng}`;
                          window.open(url, '_blank');
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        View on Maps
                      </button>
                    )}
                    
                    {card.location_address && !card.location_lat && (
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/${encodeURIComponent(card.location_address!)}`;
                          window.open(url, '_blank');
                        }}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Search Address
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}