import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getBoard } from '@/api/boards';
import { getListsByBoard } from '@/api/lists';
import { getCardsByBoard } from '@/api/cards';

export default function BoardMap() {
  const { boardId } = useParams<{ boardId: string }>();

  // Fetch board data
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId!),
    enabled: !!boardId,
  });

  // Fetch lists for list names
  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['lists', boardId],
    queryFn: () => getListsByBoard(boardId!),
    enabled: !!boardId,
  });

  // Fetch cards
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: () => getCardsByBoard(boardId!),
    enabled: !!boardId,
  });

  if (boardLoading || listsLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }

  // Filter cards with location data
  const cardsWithLocations = cards.filter(card => 
    card.location_lat && card.location_lng || card.location_address
  );

  const getListName = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    return list?.name || 'Unknown List';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {board?.name} - Map View
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {cardsWithLocations.length} pinned location{cardsWithLocations.length !== 1 ? 's' : ''} on this board
        </p>
      </div>

      {/* Map Content */}
      <div className="flex-1 overflow-auto p-4">
        {cardsWithLocations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Pinned Locations
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add location data to your cards to see them on this board's map.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Edit a card and add an address or coordinates to pin it to the map.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📍 Location Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {cardsWithLocations.filter(c => c.location_lat && c.location_lng).length}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">GPS Coordinates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {cardsWithLocations.filter(c => c.location_address).length}
                  </div>
                  <div className="text-green-700 dark:text-green-300">Addresses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {new Set(cardsWithLocations.map(c => getListName(c.list_id))).size}
                  </div>
                  <div className="text-purple-700 dark:text-purple-300">Lists</div>
                </div>
              </div>
            </div>

            {/* Location Cards Grid */}
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
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {getListName(card.list_id)}
                    </span>
                  </div>

                  {card.description && typeof card.description === 'string' && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {card.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {card.location_address && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-red-500 mt-0.5">📍</span>
                        <span className="flex-1">{card.location_address}</span>
                      </div>
                    )}
                    
                    {card.location_lat && card.location_lng && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-blue-500">🌐</span>
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
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          📍 View on Google Maps
                        </button>
                      )}
                      
                      {card.location_address && !card.location_lat && (
                        <button
                          onClick={() => {
                            const url = `https://www.google.com/maps/search/${encodeURIComponent(card.location_address!)}`;
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          🔍 Search Address
                        </button>
                      )}

                      {card.location_lat && card.location_lng && (
                        <button
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir//${card.location_lat},${card.location_lng}`;
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                        >
                          🧭 Get Directions
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card metadata */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {card.date_start && `Start: ${new Date(card.date_start).toLocaleDateString()}`}
                        {card.date_end && ` • Due: ${new Date(card.date_end).toLocaleDateString()}`}
                      </span>
                      <span>📋 Card</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🗺️ Quick Map Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (cardsWithLocations.length > 0) {
                      const coords = cardsWithLocations
                        .filter(c => c.location_lat && c.location_lng)
                        .map(c => `${c.location_lat},${c.location_lng}`)
                        .join('|');
                      if (coords) {
                        const url = `https://www.google.com/maps?q=${coords}`;
                        window.open(url, '_blank');
                      }
                    }
                  }}
                  disabled={cardsWithLocations.filter(c => c.location_lat && c.location_lng).length === 0}
                  className="px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  🌍 View All Locations on Map
                </button>
                
                <button
                  onClick={() => {
                    const addresses = cardsWithLocations
                      .filter(c => c.location_address)
                      .map(c => c.location_address)
                      .join(' | ');
                    if (addresses) {
                      navigator.clipboard.writeText(addresses);
                      // You could add a toast notification here
                    }
                  }}
                  disabled={cardsWithLocations.filter(c => c.location_address).length === 0}
                  className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  📋 Copy All Addresses
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
