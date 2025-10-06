import { useState } from 'react';
import { MultiBoardWorkspace } from '../components/workspace/MultiBoardWorkspace';
import { Tags } from 'lucide-react';
import { MOCK_BOARDS } from '../api/mockData';

export default function DashboardView() {
  const [selectedBoard, setSelectedBoard] = useState<string>('board-1');

  // Convert MOCK_BOARDS to extended format
  const extendedBoards = MOCK_BOARDS.map(board => ({
    ...board,
    position: 0,
    archived: false,
    created_at: board.created_at || new Date().toISOString(),
    updated_at: board.updated_at || new Date().toISOString(),
    lists: [] // Will be populated by the component
  }));

  // Create archive board  
  const archiveBoard = {
    id: 'archive-board',
    workspace_id: 'guest-workspace',
    name: 'Archive',
    description: 'Archived items',
    position: 999,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lists: [
      {
        id: 'archive-list-1',
        board_id: 'archive-board',
        name: 'Archived Cards',
        position: 0,
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cards: []
      }
    ]
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cross-Board Workspace</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md">
              <Tags className="w-4 h-4" />
              <span>Drag cards between boards and to archive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <MultiBoardWorkspace
          boards={extendedBoards}
          archiveBoard={archiveBoard}
          selectedBoardId={selectedBoard}
          onSelectBoard={setSelectedBoard}
          onCreateList={(boardId: string, name: string) => {
            console.log('Create list:', boardId, name);
          }}
          onUpdateList={(id: string, data: any) => {
            console.log('Update list:', id, data);
          }}
          onCreateCard={(listId: string, title: string) => {
            console.log('Create card:', listId, title);
          }}
          onMoveCard={(cardId: string, listId: string, position: number) => {
            console.log('Move card:', cardId, listId, position);
          }}
          onReorderLists={(boardId: string, listIds: string[]) => {
            console.log('Reorder lists:', boardId, listIds);
          }}
          onMoveCardToBoard={(cardId: string, targetBoardId: string, targetListId: string) => {
            console.log('Move card to board:', cardId, targetBoardId, targetListId);
          }}
          onMoveListToBoard={(listId: string, targetBoardId: string) => {
            console.log('Move list to board:', listId, targetBoardId);
          }}
        />
      </div>
    </div>
  );
}
