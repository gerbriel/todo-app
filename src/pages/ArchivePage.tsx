import { Archive as ArchiveIcon, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <ArchiveIcon className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Archive</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Archived cards and lists
          </span>
        </div>

        {/* Info about board deletion */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Boards are no longer archived
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Boards are now permanently deleted instead of archived. 
                To view archived cards and lists, navigate to the <Link to="/b/archive-board/board" className="underline font-medium">Archive Board</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Archived Cards and Lists */}
        <div className="text-center py-12">
          <ArchiveIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            View Archived Items
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Archived cards and lists can be found in the Archive board.
          </p>
          <Link 
            to="/b/archive-board/board"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArchiveIcon className="w-4 h-4 mr-2" />
            Go to Archive Board
          </Link>
        </div>
      </div>
    </div>
  );
}