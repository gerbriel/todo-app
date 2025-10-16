import { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    url: string;
    mime: string;
    size?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const isImage = file.mime.startsWith('image/');
  const isPdf = file.mime === 'application/pdf';
  const isVideo = file.mime.startsWith('video/');
  const isAudio = file.mime.startsWith('audio/');
  const isText = file.mime.startsWith('text/') || 
                 file.mime === 'application/json' ||
                 file.mime === 'application/javascript';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={file.url}
          className="w-full h-full border-0"
          title={file.name}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={file.url}
          controls
          className="max-w-full max-h-full"
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        >
          Your browser does not support video playback.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <audio
            src={file.url}
            controls
            className="w-full max-w-md"
            onLoadedData={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          >
            Your browser does not support audio playback.
          </audio>
          <p className="mt-4 text-gray-600 text-center">{file.name}</p>
        </div>
      );
    }

    if (isText) {
      return (
        <iframe
          src={file.url}
          className="w-full h-full border-0 bg-white"
          title={file.name}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <button
          onClick={() => window.open(file.url, '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Download className="w-4 h-4" />
          Download File
        </button>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg max-w-6xl max-h-[90vh] w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">{file.name}</h3>
            <p className="text-sm text-gray-500">
              {file.mime} {file.size && `• ${formatFileSize(file.size)}`}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
          {loading && (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading preview...</span>
            </div>
          )}
          
          {error && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
              <p className="text-gray-600 mb-4">Unable to preview this file.</p>
              <button
                onClick={() => window.open(file.url, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}

          {!loading && !error && renderPreview()}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}