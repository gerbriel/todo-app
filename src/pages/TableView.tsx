import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getBoard } from '@/api/boards';
import { getListsByBoard } from '@/api/lists';
import { getCardsByBoard } from '@/api/cards';
import type { CardRow } from '@/types/dto';

export default function TableView() {
  const { boardId } = useParams<{ boardId: string }>();

  // Fetch board data
  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId!),
    enabled: !!boardId,
  });

  // Fetch lists
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
        <div className="text-gray-500 dark:text-gray-400">Loading table view...</div>
      </div>
    );
  }

  // Group cards by list
  const cardsByList = cards.reduce((acc, card) => {
    if (!acc[card.list_id]) {
      acc[card.list_id] = [];
    }
    acc[card.list_id].push(card);
    return acc;
  }, {} as Record<string, CardRow[]>);

  // Create table rows
  const tableRows: Array<{
    listName: string;
    card?: CardRow;
    isListHeader?: boolean;
  }> = [];

  lists.forEach(list => {
    // Add list header row
    tableRows.push({
      listName: list.name,
      isListHeader: true,
    });

    // Add cards for this list
    const listCards = cardsByList[list.id] || [];
    listCards.forEach(card => {
      tableRows.push({
        listName: list.name,
        card,
      });
    });

    // If no cards, add empty row
    if (listCards.length === 0) {
      tableRows.push({
        listName: list.name,
      });
    }
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {board?.name} - Table View
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {cards.length} cards across {lists.length} lists
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  List
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Card Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Labels
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tableRows.map((row, index) => (
                <tr 
                  key={index}
                  className={`${
                    row.isListHeader 
                      ? 'bg-gray-50 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.isListHeader ? (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        📋 {row.listName}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {row.listName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.card ? (
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {row.card.title}
                      </div>
                    ) : row.isListHeader ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        List Section
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No cards
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.card?.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {String(row.card.description)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.card?.date_end && (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(row.card.date_end).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.card?.card_labels && (
                      <div className="flex flex-wrap gap-1">
                        {row.card.card_labels
                          .filter(cl => cl.labels)
                          .map((cardLabel, labelIndex) => (
                          <span
                            key={labelIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: cardLabel.labels!.color + '20',
                              color: cardLabel.labels!.color,
                              border: `1px solid ${cardLabel.labels!.color}40`
                            }}
                          >
                            {cardLabel.labels!.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.card?.created_at && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(row.card.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
